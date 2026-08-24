export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { TransactionHistory, ActivateWalletForm } from '@/components/wallet';

export default async function TopUpPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, balance, virtual_account_number, bank_name, account_name')
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
            <p className="mt-1 text-sm text-white">
              {profile.bank_name} — {profile.account_name}
            </p>
            <p className="mt-3 text-xs text-neutral">
              Your balance updates automatically once payment is received.
            </p>
          </div>
        ) : (
          <ActivateWalletForm />
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
