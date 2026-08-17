import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id, total_amount, payment_reference, created_at, metadata,
      profiles ( full_name, email )
    `)
    .eq('payment_status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to load pending orders' }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}
