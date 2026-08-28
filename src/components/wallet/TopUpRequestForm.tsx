'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

const LOGSCITY_ACCOUNT_NUMBER = '6422643972';
const LOGSCITY_BANK_NAME = 'OPay';
const LOGSCITY_ACCOUNT_NAME = 'Darlyton Oseghale Egboshe';

export function TopUpRequestForm() {
  const [amount, setAmount] = useState('');
  const [exactAmount, setExactAmount] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function copyToClipboard(value: string, label: string) {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  }

  async function handleGenerate() {
    const parsed = Number(amount);
    if (!parsed || parsed < 100) {
      toast.error('Enter a valid amount (minimum ₦100)');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/wallet/topup-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parsed }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? 'Something went wrong');
      return;
    }

    setExactAmount(data.exactAmount);
    setExpiresAt(data.expiresAt);
  }

  function reset() {
    setExactAmount(null);
    setExpiresAt(null);
    setAmount('');
  }

  if (exactAmount) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <p className="text-sm text-neutral">Send exactly this amount to:</p>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-2xl font-bold text-primary">
            ₦{exactAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <button
            type="button"
            onClick={() => copyToClipboard(exactAmount.toFixed(2), 'Amount')}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral"
          >
            <Icon icon="lucide:copy" className="text-sm" />
            Copy
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs text-neutral">Account Number</p>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-lg font-bold text-white">{LOGSCITY_ACCOUNT_NUMBER}</p>
            <button
              type="button"
              onClick={() => copyToClipboard(LOGSCITY_ACCOUNT_NUMBER, 'Account number')}
              className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral"
            >
              <Icon icon="lucide:copy" className="text-sm" />
              Copy
            </button>
          </div>
          <p className="mt-1 text-sm text-neutral">
            {LOGSCITY_BANK_NAME} — {LOGSCITY_ACCOUNT_NAME}
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-400">
            Important: send the exact amount above, down to the kobo. Your balance updates
            automatically within seconds of payment.
          </p>
        </div>

        {expiresAt && (
          <p className="mt-3 text-xs text-neutral">
            This amount is reserved for you until {new Date(expiresAt).toLocaleTimeString()}.
          </p>
        )}

        <button
          type="button"
          onClick={reset}
          className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm text-neutral"
        >
          Start over
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm font-medium text-white">How much would you like to add?</p>

      <input
        type="number"
        inputMode="numeric"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="e.g. 5000"
        className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-lg text-white outline-none"
      />

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="mt-4 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Get payment details'}
      </button>
    </div>
  );
        }
