export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { ensureCustomerAccount } from '@/lib/wallet/ensureCustomerAccount';
import type { CustomerAccount } from '@/lib/paymonetra';
import { TransactionHistory, TopUpAccountCard } from '@/components/wallet';

export default async function TopUpPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, balance, pm_account_number, pm_account_name, pm_bank_name')
    .eq('auth_user_id', user!.id)
    .single();

  let account: CustomerAccount | null = null;
  if (profile) {
    try {
      account = await ensureCustomerAccount(profile);
    } catch (err) {
      console.error('Could not get customer account', err);
    }
  }

  const { data: txs } = await supabase
    .from('wallet_transactions')
    .select('id, type, amount, balance_after, created_at')
    .eq('profile_id', profile?.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const history = (txs ?? []).map((tx) => ({
    id: tx.id,
    type: tx.type,
    amount: Number(tx.amount),
    balance_after: Number(tx.balance_after),
    created_at: tx.created_at,
    status: 'completed' as const,
  }));

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
        {account ? (
          <TopUpAccountCard
            accountNumber={account.accountNumber}
            accountName={account.accountName}
            bankName={account.bankName}
          />
        ) : (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-400">
            We couldn&apos;t load your payment details right now. Please refresh, or contact support.
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-white">Transaction History</h2>
        <div className="mt-4">
          <TransactionHistory transactions={history} />
        </div>
      </div>
    </div>
  );
}
