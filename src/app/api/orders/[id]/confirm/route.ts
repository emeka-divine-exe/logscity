import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { fulfillOrder } from '@/lib/orders/fulfillOrder';

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
    await fulfillOrder({ orderId: order.id, categoryId, accountIds, quantity, priceEach });
  } catch (error) {
    console.error('Order fulfillment error:', error);
    return NextResponse.json(
      { error: 'Could not confirm — one or more accounts are no longer available' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
