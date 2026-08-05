import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyPaystackTransaction } from '@/lib/paystack';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reference } = await req.json();

    // Verify with Paystack
    const transaction = await verifyPaystackTransaction(reference);

    if (transaction.status !== 'success') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    // Get the pending order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, payment_status, total_amount, metadata')
      .eq('payment_reference', reference)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Idempotency check — already processed (webhook may have beaten us)
    if (order.payment_status === 'success') {
      return NextResponse.json({ success: true, orderId: order.id });
    }

    // Verify amount matches — prevent tampering
    const expectedKobo = order.total_amount * 100;
    if (transaction.amount !== expectedKobo) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // Atomically claim accounts and create order_items
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

    // Mark order as successful
    await supabaseAdmin
      .from('orders')
      .update({ payment_status: 'success' })
      .eq('id', order.id);

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
      }
