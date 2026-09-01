'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

interface PendingTopup {
  id: string;
  exact_amount: number;
  created_at: string;
  customerName: string;
  customerEmail: string;
}

interface PendingTopupsSectionProps {
  topups: PendingTopup[];
}

export function PendingTopupsSection({ topups }: PendingTopupsSectionProps) {
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const visible = topups.filter((t) => !resolved.has(t.id));

  async function handleApprove(id: string) {
    setLoadingId(id);
    const res = await fetch(`/api/admin/topups/${id}/approve`, { method: 'PATCH' });
    setLoadingId(null);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast.error(data?.error ?? 'Failed to approve');
      return;
    }

    setResolved((prev) => new Set(prev).add(id));
    toast.success('Wallet credited');
  }

  if (visible.length === 0) return null;

  return (
    <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Icon icon="lucide:banknote" />
        Pending Top-Ups ({visible.length})
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {visible.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-background/40 p-3"
          >
            <div>
              <p className="text-sm font-medium text-white">
                ₦{Number(t.exact_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-0.5 text-xs text-neutral">
                {t.customerName} — {t.customerEmail}
              </p>
              <p className="mt-0.5 text-xs text-neutral">
                Marked sent {new Date(t.created_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleApprove(t.id)}
              disabled={loadingId === t.id}
              className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              {loadingId === t.id ? 'Approving...' : 'Approve'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
