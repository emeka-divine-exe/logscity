'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

interface RestockWarning {
  id: string;
  reason: string;
  detail: string | null;
  created_at: string;
  categoryId: string;
  categoryName: string;
}

interface UnmatchedSmsPayment {
  id: string;
  amount: number;
  raw_sms: string | null;
  created_at: string;
}

interface WarningsSectionProps {
  restockWarnings: RestockWarning[];
  unmatchedPayments: UnmatchedSmsPayment[];
}

export function WarningsSection({ restockWarnings, unmatchedPayments }: WarningsSectionProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const visibleRestockWarnings = restockWarnings.filter((w) => !dismissed.has(w.id));
  const visibleUnmatchedPayments = unmatchedPayments.filter((p) => !dismissed.has(p.id));

  async function resolve(id: string, source: 'restock' | 'sms') {
    setDismissed((prev) => new Set(prev).add(id));
    await fetch(`/api/admin/warnings/${id}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source }),
    });
  }

  async function retryRestock(warningId: string, categoryId: string) {
    setRetryingId(warningId);
    const res = await fetch(`/api/admin/restock/${categoryId}`, { method: 'POST' });
    const data = await res.json();
    setRetryingId(null);

    if (data.success) {
      toast.success(`Restocked — ${data.added} accounts added`);
      setDismissed((prev) => new Set(prev).add(warningId));
    } else {
      toast.error('Still could not restock — check EmonBestLog balance');
    }
  }

  if (visibleRestockWarnings.length === 0 && visibleUnmatchedPayments.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-amber-400">
        <Icon icon="lucide:alert-circle" />
        Needs Attention ({visibleRestockWarnings.length + visibleUnmatchedPayments.length})
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {visibleRestockWarnings.map((warning) => (
          <div
            key={warning.id}
            className="flex flex-col gap-3 rounded-xl border border-white/10 bg-background/40 p-3 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">
                Restock failed — {warning.categoryName}
              </p>
              <p className="mt-1 text-xs text-neutral">{warning.detail}</p>
              <p className="mt-1 text-xs text-neutral">
                {new Date(warning.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => retryRestock(warning.id, warning.categoryId)}
                disabled={retryingId === warning.id}
                className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 sm:flex-none"
              >
                {retryingId === warning.id ? 'Retrying...' : 'Restock Now'}
              </button>
              <button
                onClick={() => resolve(warning.id, 'restock')}
                className="flex-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/5 sm:flex-none"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}

        {visibleUnmatchedPayments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-background/40 p-3"
          >
            <div>
              <p className="text-sm font-medium text-white">
                Unmatched payment — ₦{Number(payment.amount).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-neutral">
                Received via SMS but no pending top-up matched this exact amount. Check who might
                have sent this and credit manually if needed.
              </p>
              <p className="mt-1 text-xs text-neutral">
                {new Date(payment.created_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => resolve(payment.id, 'sms')}
              className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/5"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
