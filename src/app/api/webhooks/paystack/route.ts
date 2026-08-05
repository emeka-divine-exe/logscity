import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyPaystackTransaction } from '@/lib/paystack';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // Verify webhook signature — confirms it's really from Paystack
    const hash = createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event !== 'charge.success') {
      return NextResponse.json({ received: true }); // Ignore non-payment events
    }

    const reference = event.data.reference;

    // Get the pending order
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, payment_status, total_amount, metadata')
      .eq('payment_reference', reference)
      .single();

    if (!order) return NextResponse.json({ received: true });

    // Idempotency — already processed by verify route
    if (order.payment_status === 'success') {
      return NextResponse.json({ received: true });
    }

    // Verify amount
    const transaction = await verifyPaystackTransaction(reference);
    if (transaction.amount !== order.total_amount * 100) {
      return NextResponse.json({ received: true });
    }

    // Atomically claim accounts
    const { categoryId, accountIds, quantity, priceEach } = order.metadata;

    if (accountIds) {
      await supabaseAdmin.rpc('claim_accounts', {
        p_account_ids: accountIds,
        p_order_id: order.id,
        p_price_each: priceEach,
      });
    } else {
      await supabaseAdmin.rpc('claim_accounts_by_quantity', {
        p_category_id: categoryId,
        p_quantity: quantity,
        p_order_id: order.id,
        p_price_each: priceEach,
      });
    }

    await supabaseAdmin
      .from('orders')
      .update({ payment_status: 'success' })
      .eq('id', order.id);

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
      }
