import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  const { data: pending } = await supabaseAdmin
    .from('pending_topups')
    .select('id, profile_id, exact_amount, status')
    .eq('id', id)
    .single();

  if (!pending) {
    return NextResponse.json({ error: 'Top-up request not found' }, { status: 404 });
  }
  if (pending.status !== 'pending') {
    return NextResponse.json({ error: 'This request was already resolved' }, { status: 409 });
  }

  const { error: creditError } = await supabaseAdmin.rpc('credit_wallet', {
    p_profile_id: pending.profile_id,
    p_amount: pending.exact_amount,
    p_reference: `admin-approved-${pending.id}`,
  });

  if (creditError) {
    console.error('Admin approve top-up failed', { creditError, pending });
    return NextResponse.json({ error: 'Failed to credit wallet' }, { status: 500 });
  }

  await supabaseAdmin
    .from('pending_topups')
    .update({ status: 'completed' })
    .eq('id', pending.id);

  return NextResponse.json({ success: true });
}
