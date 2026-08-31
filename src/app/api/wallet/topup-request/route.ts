import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createPendingTopup } from '@/lib/wallet/createPendingTopup';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { amount } = await req.json();
  if (!amount || amount < 100) {
    return NextResponse.json({ error: 'Enter a valid amount' }, { status: 400 });
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const { data: existing } = await supabaseAdmin
    .from('pending_topups')
    .select('id, exact_amount, expires_at, marked_sent')
    .eq('profile_id', profile.id)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (existing) {
    return NextResponse.json({
      id: existing.id,
      exactAmount: existing.exact_amount,
      expiresAt: existing.expires_at,
      markedSent: existing.marked_sent,
    });
  }

  const pending = await createPendingTopup(profile.id, amount);

  return NextResponse.json({
    id: pending.id,
    exactAmount: pending.exact_amount,
    expiresAt: pending.expires_at,
    markedSent: false,
  });
}
