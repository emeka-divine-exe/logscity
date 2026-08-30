import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function createPendingTopup(profileId: string, baseAmount: number) {
  // Housekeeping: mark old unpaid requests as expired before generating a
  // new one, so stale rows don't sit around forever.
  await supabaseAdmin
    .from('pending_topups')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString());

  for (let attempt = 0; attempt < 10; attempt++) {
    const kobo = Math.floor(Math.random() * 99) + 1;
    const exactAmount = Number((baseAmount + kobo / 100).toFixed(2));

    const { data, error } = await supabaseAdmin
      .from('pending_topups')
      .insert({ profile_id: profileId, base_amount: baseAmount, exact_amount: exactAmount })
      .select('id, exact_amount, expires_at')
      .single();

    if (!error) return data;
    if (error.code !== '23505') throw error;
  }

  throw new Error('Could not generate a unique top-up amount after 10 attempts');
}
