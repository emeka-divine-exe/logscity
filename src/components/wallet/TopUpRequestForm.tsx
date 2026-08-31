'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

const LOGSCITY_ACCOUNT_NUMBER = '6422643972';
const LOGSCITY_BANK_NAME = 'OPay';
const LOGSCITY_ACCOUNT_NAME = 'Darlyton Oseghale Egboshe';

interface ActiveRequest {
  id: string;
  exactAmount: number;
  expiresAt: string;
  markedSent: boolean;
}

interface TopUpRequestFormProps {
  initialRequest: ActiveRequest | null;
}

export function TopUpRequestForm({ initialRequest }: TopUpRequestFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [request, setRequest] = useState<ActiveRequest | null>(initialRequest);
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

    setRequest({
      id: data.id,
      exactAmount: data.exactAmount,
      expiresAt: data.expiresAt,
      markedSent: data.markedSent,
    });
  }

  async function handleMarkSent() {
    if (!request) return;
    setLoading(true);
    const res = await fetch(`/api/wallet/topup-request/${request.id}/mark-sent`, {
      method: 'PATCH',
    });
    setLoading(false);

    if (!res.ok) {
      toast.error('Something went wrong, please try again');
      return;
    }

    setRequest({ ...request, markedSent: true });
    toast.success("Marked as sent — we're confirming your payment");
  }

  async function handleCancel() {
    if (!request) return;
    setLoading(true);
    const res = await fetch(`/api/wallet/topup-request/${request.id}/cancel`, {
      method: 'PATCH',
    });
    setLoading(false);

    if (!res.ok) {
      toast.error('Something went wrong, please try again');
      return;
    }

    setRequest(null);
    setAmount('');
    router.refresh();
  }

  if (!request) {
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

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
      <p className="text-sm text-neutral">Send exactly this amount to:</p>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-2xl font-bold text-primary">
          ₦{request.exactAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <button
          type="button"
          onClick={() => copyToClipboard(request.exactAmount.toFixed(2), 'Amount')}
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

      {request.markedSent ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
          <Icon icon="lucide:loader-2" className="animate-spin text-lg text-primary" />
          <div>
            <p className="text-sm font-medium text-white">Confirming your payment</p>
            <p className="mt-0.5 text-xs text-neutral">
              Your balance updates automatically once we receive it — usually within a minute.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-400">
            Send the exact amount above, down to the kobo, to the account shown.
          </p>
        </div>
      )}

      <p className="mt-3 text-xs text-neutral">
        This amount is reserved for you until {new Date(request.expiresAt).toLocaleTimeString()}.
      </p>

      <div className="mt-4 flex gap-3">
        {!request.markedSent && (
          <button
            type="button"
            onClick={handleMarkSent}
            disabled={loading}
            className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            I've sent it
          </button>
        )}
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className={`flex items-center justify-center rounded-2xl border border-white/10 text-sm text-neutral disabled:opacity-50 ${
            request.markedSent ? 'flex-1 px-4 py-3' : 'w-14'
          }`}
        >
          {request.markedSent ? 'Cancel' : <Icon icon="lucide:x" className="text-lg" />}
        </button>
      </div>
    </div>
  );
}
