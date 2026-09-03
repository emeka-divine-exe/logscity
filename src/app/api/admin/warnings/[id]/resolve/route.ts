import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const { source } = await req.json();

  const table = source === 'sms' ? 'unmatched_sms_payments' : 'restock_warnings';

  const { error } = await supabaseAdmin.from(table).update({ resolved: true }).eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to resolve' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
