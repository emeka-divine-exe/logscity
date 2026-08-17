import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('id, payment_status, metadata')
    .eq('id', id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (order.payment_status === 'success') {
    return NextResponse.json({ success: true });
  }

  const { categoryId, accountIds, quantity, priceEach } = order.metadata as {
    categoryId: string;
    accountIds: string[] | null;
    quantity: number | null;
    priceEach: number;
  };

  try {
    if (accountIds) {
      const { error } = await supabaseAdmin.rpc('claim_accounts', {
        p_account_ids: accountIds,
        p_order_id: order.id,
        p_price_each: priceEach,
      });
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin.rpc('claim_accounts_by_quantity', {
        p_category_id: categoryId,
        p_quantity: quantity,
        p_order_id: order.id,
        p_price_each: priceEach,
      });
      if (error) throw error;
    }
  } catch (error) {
    console.error('Claim accounts error:', error);
    return NextResponse.json(
      { error: 'Could not confirm — one or more accounts are no longer available' },
      { status: 400 }
    );
  }

  await supabaseAdmin.from('orders').update({ payment_status: 'success' }).eq('id', order.id);

  return NextResponse.json({ success: true });
}
