import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, profile_id, total_amount, payment_status')
    .eq('id', id)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  if (order.payment_status !== 'pending') {
    return NextResponse.json({ error: 'This order was already resolved' }, { status: 409 });
  }

  const { error: refundError } = await supabaseAdmin.rpc('credit_wallet', {
    p_profile_id: order.profile_id,
    p_amount: order.total_amount,
    p_reference: `reject-refund-${order.id}`,
  });

  if (refundError) {
    console.error('Refund on reject failed:', refundError);
    return NextResponse.json({ error: 'Failed to refund customer' }, { status: 500 });
  }

  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ payment_status: 'failed' })
    .eq('id', id);

  if (updateError) {
    console.error('Failed to mark order as failed:', updateError);
    return NextResponse.json({ error: 'Failed to reject order' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
