'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';

interface PendingOrder {
  id: string;
  total_amount: number;
  payment_reference: string;
  created_at: string;
  metadata: { categoryName?: string };
  profiles: { full_name: string; email: string } | { full_name: string; email: string }[] | null;
}

interface PendingOrdersSectionProps {
  orders: PendingOrder[];
}

export function PendingOrdersSection({ orders }: PendingOrdersSectionProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleConfirm(id: string) {
    setProcessingId(id);
    const res = await fetch(`/api/admin/orders/${id}/confirm`, { method: 'POST' });
    const data = await res.json();
    setProcessingId(null);

    if (!res.ok) {
      toast.error(data.error || 'Failed to confirm order');
      return;
    }

    toast.success('Order confirmed — accounts released to customer');
    router.refresh();
  }

  async function handleReject(id: string) {
    setProcessingId(id);
    const res = await fetch(`/api/admin/orders/${id}/reject`, { method: 'POST' });
    setProcessingId(null);

    if (!res.ok) {
      toast.error('Failed to reject order');
      return;
    }

    toast.success('Order rejected');
    router.refresh();
  }

  if (orders.length === 0) return null;

  return (
    <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-amber-400">
        <Icon icon="lucide:clock" />
        Pending Orders ({orders.length})
      </p>
      <div className="mt-4 flex flex-col gap-3">
        {orders.map((order) => {
          const buyer = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
          return (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-background/40 p-3"
            >
              <div>
                <p className="text-sm text-white">{buyer?.full_name ?? 'Customer'}</p>
                <p className="text-xs text-neutral">
                  {order.metadata.categoryName} · ₦{Number(order.total_amount).toLocaleString()}
                </p>
                <p className="text-xs text-neutral">Ref: {order.payment_reference}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleReject(order.id)}
                  disabled={processingId === order.id}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-neutral hover:bg-white/5"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleConfirm(order.id)}
                  disabled={processingId === order.id}
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary/90"
                >
                  Confirm
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
