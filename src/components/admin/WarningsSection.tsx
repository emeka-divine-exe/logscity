'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const visibleRestockWarnings = restockWarnings.filter((w) => !dismissed.has(w.id));
  const visibleUnmatchedPayments = unmatchedPayments.filter((p) => !dismissed.has(p.id));

  async function resolve(id: string, source: 'restock' | 'sms') {
    setDismissingId(id);
    try {
      const res = await fetch(`/api/admin/warnings/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      });
      setDismissingId(null);

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(`Dismiss failed (${res.status}): ${data?.error ?? 'unknown reason'}`);
        return;
      }

      setDismissed((prev) => new Set(prev).add(id));
      router.refresh();
    } catch (err) {
      setDismissingId(null);
      toast.error(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function retryRestock(warningId: string, categoryId: string) {
    setRetryingId(warningId);
    const res = await fetch(`/api/admin/restock/${categoryId}`, { method: 'POST' });
    const data = await res.json();
    setRetryingId(null);

    if (data.success) {
      toast.success(`Restocked — ${data.added} accounts added`);
      setDismissed((prev) => new Set(prev).add(warningId));
      router.refresh();
    } else {
      toast.error('Still could not restock — check the newest warning below for the real reason');
      router.refresh();
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
            className="rounded-xl border border-white/10 bg-background/40 p-3"
          >
            <p className="text-sm font-medium text-white">
              Restock failed — {warning.categoryName}
            </p>
            <p className="mt-1 text-xs text-neutral">{warning.detail}</p>
            <p className="mt-1 text-xs text-neutral">
              {new Date(warning.created_at).toLocaleString()}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => retryRestock(warning.id, warning.categoryId)}
                disabled={retryingId === warning.id || dismissingId === warning.id}
                className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {retryingId === warning.id ? 'Retrying...' : 'Restock Now'}
              </button>
              <button
                onClick={() => resolve(warning.id, 'restock')}
                disabled={retryingId === warning.id || dismissingId === warning.id}
                className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50"
              >
                {dismissingId === warning.id ? 'Dismissing...' : 'Dismiss'}
              </button>
            </div>
          </div>
        ))}

        {visibleUnmatchedPayments.map((payment) => (
          <div
            key={payment.id}
            className="rounded-xl border border-white/10 bg-background/40 p-3"
          >
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
            <button
              onClick={() => resolve(payment.id, 'sms')}
              disabled={dismissingId === payment.id}
              className="mt-3 w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50"
            >
              {dismissingId === payment.id ? 'Dismissing...' : 'Dismiss'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
