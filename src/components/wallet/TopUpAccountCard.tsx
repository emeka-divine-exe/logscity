'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

interface TopUpAccountCardProps {
  accountNumber: string;
  accountName: string;
  bankName: string;
}

export function TopUpAccountCard({ accountNumber, accountName, bankName }: TopUpAccountCardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  function copy(value: string, label: string) {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  }

  function checkBalance() {
    setChecking(true);
    router.refresh();
    setTimeout(() => setChecking(false), 1500);
  }

  return (
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
  );
}
