import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Generates a unique exact amount within 1–99 kobo of the requested amount,
// retrying if that exact figure happens to already be pending for someone else.
export async function createPendingTopup(profileId: string, baseAmount: number) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const kobo = Math.floor(Math.random() * 99) + 1; // 1–99, never a flat naira
    const exactAmount = Number((baseAmount + kobo / 100).toFixed(2));

    const { data, error } = await supabaseAdmin
      .from('pending_topups')
      .insert({ profile_id: profileId, base_amount: baseAmount, exact_amount: exactAmount })
      .select('id, exact_amount, expires_at')
      .single();

    if (!error) return data;

    // Unique index collision — someone else currently has this exact amount pending.
    // Safe to just retry with a new random kobo value.
    if (error.code !== '23505') throw error;
  }

  throw new Error('Could not generate a unique top-up amount after 10 attempts');
}
