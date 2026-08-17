import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  const { error } = await supabaseAdmin.from('orders').delete().eq('id', id).eq('payment_status', 'pending');

  if (error) {
    return NextResponse.json({ error: 'Failed to reject order' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
