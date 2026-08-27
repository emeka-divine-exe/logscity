import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function creditWalletByExactAmount(amount: number, rawSms: string) {
  const { data: pending } = await supabaseAdmin
    .from('pending_topups')
    .select('id, profile_id')
    .eq('exact_amount', amount)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (!pending) {
    await supabaseAdmin.from('unmatched_sms_payments').insert({ amount, raw_sms: rawSms });
    return { success: false };
  }

  const { error } = await supabaseAdmin.rpc('credit_wallet', {
    p_profile_id: pending.profile_id,
    p_amount: amount,
    p_reference: `sms-${pending.id}`,
  });

  if (error) {
    console.error('credit_wallet failed', { error, pendingId: pending.id, amount });
    return { success: false };
  }

  await supabaseAdmin.from('pending_topups').update({ status: 'completed' }).eq('id', pending.id);

  return { success: true };
}
