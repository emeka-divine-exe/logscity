export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { TransactionHistory } from '@/components/wallet';
import { Icon } from '@iconify/react';

export default async function TopUpPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, balance, virtual_account_number')
    .eq('auth_user_id', user!.id)
    .single();

  const { data: transactions } = await supabase
    .from('wallet_transactions')
    .select('id, type, amount, balance_after, created_at')
    .eq('profile_id', profile?.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
        Top Up
      </h1>
      <p className="mt-1 text-sm text-neutral">Fund your balance to buy accounts instantly.</p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-neutral">Current Balance</p>
        <p className="mt-1 text-3xl font-bold text-white">
          ₦{Number(profile?.balance ?? 0).toLocaleString()}
        </p>
      </div>

      <div className="mt-6">
        {profile?.virtual_account_number ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
            <p className="text-sm text-neutral">Send money to your personal account:</p>
            <p className="mt-2 text-xl font-bold text-white">{profile.virtual_account_number}</p>
            <p className="mt-1 text-xs text-neutral">
              Your balance updates automatically once payment is received.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
            <Icon icon="lucide:construction" className="mt-0.5 text-lg text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-400">Top-up is being set up</p>
              <p className="mt-1 text-sm text-neutral">
                We&apos;re finishing setup with our banking partner. Check back soon — your
                personal top-up account will appear here.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-white">Transaction History</h2>
        <div className="mt-4">
          <TransactionHistory transactions={transactions ?? []} />
        </div>
      </div>
    </div>
  );
}
