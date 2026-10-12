'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

interface TopUpAccountCardProps {
  accountNumber: string;
  accountName: string;
  bankName: string;
  balance: number;
}

type Result =
  | { kind: 'received'; amount: number; balance: number }
  | { kind: 'pending' }
  | { kind: 'error' }
  | null;

export function TopUpAccountCard({
  accountNumber,
  accountName,
  bankName,
  balance,
}: TopUpAccountCardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [baseline, setBaseline] = useState(balance);
  const [result, setResult] = useState<Result>(null);

  function copy(value: string, label: string) {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  }

  async function checkBalance() {
    setChecking(true);
    try {
      const res = await fetch('/api/wallet/balance', { cache: 'no-store' });
      if (!res.ok) throw new Error('Request failed');
      const data = (await res.json()) as { balance: number };

      if (data.balance > baseline) {
        setResult({
          kind: 'received',
          amount: data.balance - baseline,
          balance: data.balance,
        });
        setBaseline(data.balance);
        router.refresh();
      } else {
        setResult({ kind: 'pending' });
      }
    } catch {
      setResult({ kind: 'error' });
    } finally {
      setChecking(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <p className="text-sm text-neutral">
          Transfer any amount (minimum ₦100) from any bank app to your personal account:
        </p>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs text-neutral">Account Number</p>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-2xl font-bold text-white">{accountNumber}</p>
            <button
              type="button"
              onClick={() => copy(accountNumber, 'Account number')}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral"
            >
              <Icon icon="lucide:copy" className="text-sm" />
              Copy
            </button>
          </div>
          <p className="mt-1 text-sm text-neutral">
            {bankName} — {accountName}
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-400">
            This account is yours only. Your balance updates automatically within a minute of your transfer.
          </p>
        </div>

        <button
          type="button"
          onClick={checkBalance}
          disabled={checking}
          className="mt-4 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {checking ? 'Checking...' : "I've sent it — check my balance"}
        </button>
      </div>

      {result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setResult(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 p-6 text-center"
            style={{ backgroundColor: '#111318' }}
            onClick={(e) => e.stopPropagation()}
          >
            {result.kind === 'received' && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                  <Icon icon="lucide:circle-check" className="text-3xl text-green-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">Money received</h3>
                <p className="mt-2 text-sm text-neutral">
                  ₦{result.amount.toLocaleString()} has been added to your balance. Your new
                  balance is ₦{result.balance.toLocaleString()}.
                </p>
              </>
            )}

            {result.kind === 'pending' && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
                  <Icon icon="lucide:clock" className="text-3xl text-amber-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">Not received yet</h3>
                <p className="mt-2 text-sm text-neutral">
                  We haven&apos;t seen your transfer yet. Bank transfers can take a few
                  minutes, so please check back shortly. Also make sure you sent it to the
                  account number shown above.
                </p>
              </>
            )}

            {result.kind === 'error' && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                  <Icon icon="lucide:circle-alert" className="text-3xl text-red-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">Couldn&apos;t check</h3>
                <p className="mt-2 text-sm text-neutral">
                  Something went wrong while checking. Please try again in a moment.
                </p>
              </>
            )}

            <button
              type="button"
              onClick={() => setResult(null)}
              className="mt-6 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white"
            >
              {result.kind === 'received' ? 'Done' : 'Okay'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
