'use client';

import { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { AccountsManageModal } from './AccountsManageModal';
import { PendingOrdersSection } from './PendingOrdersSection';

interface LowStockItem {
  id: string;
  name: string;
  available: number;
}

interface RecentSale {
  id: string;
  buyerName: string;
  itemCount: number;
  amount: number;
  createdAt: string;
}

interface PendingOrder {
  id: string;
  total_amount: number;
  payment_reference: string;
  created_at: string;
  metadata: { categoryName?: string };
  profiles: { full_name: string; email: string } | { full_name: string; email: string }[] | null;
}

interface AdminDashboardClientProps {
  adminName: string;
  totalAvailable: number;
  totalAmount: number;
  totalUsers: number;
  totalCategories: number;
  lowStock: LowStockItem[];
  recentSales: RecentSale[];
  pendingOrders: PendingOrder[];
}

type Filter = 'today' | 'week' | 'month';

export function AdminDashboardClient({
  adminName,
  totalAvailable,
  totalAmount,
  totalUsers,
  totalCategories,
  lowStock,
  recentSales,
  pendingOrders,
}: AdminDashboardClientProps) {
  const [filter, setFilter] = useState<Filter>('today');
  const [manageCategoryId, setManageCategoryId] = useState<string | null>(null);
  const [manageCategoryName, setManageCategoryName] = useState<string>('');

  const filteredSales = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    if (filter === 'today') {
      cutoff.setHours(0, 0, 0, 0);
    } else if (filter === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else {
      cutoff.setMonth(now.getMonth() - 1);
    }
    return recentSales.filter((sale) => new Date(sale.createdAt) >= cutoff);
  }, [filter, recentSales]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
        Welcome back, {adminName}
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-neutral">Total Available Accounts</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalAvailable}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-neutral">Total Amount</p>
          <p className="mt-1 text-2xl font-bold text-white">₦{totalAmount.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-neutral">Total Users</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalUsers}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-neutral">Total Categories</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalCategories}</p>
        </div>
      </div>

      <PendingOrdersSection orders={pendingOrders} />

      {lowStock.length > 0 && (
        <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-red-400">
            <Icon icon="lucide:alert-triangle" />
            Low Stock ({lowStock.length})
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {lowStock.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-background/40 p-3"
              >
                <div>
                  <p className="text-sm text-white">{item.name}</p>
                  <p className="text-sm font-bold text-red-400">{item.available} Accounts Left</p>
                </div>
                <button
                  onClick={() => {
                    setManageCategoryId(item.id);
                    setManageCategoryName(item.name);
                  }}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/5"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Sales</h2>
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  filter === f ? 'bg-primary/15 text-primary' : 'text-neutral hover:text-white'
                }`}
              >
                {f === 'today' ? 'Today' : f === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {filteredSales.length === 0 ? (
            <p className="text-sm text-neutral">No sales in this period.</p>
          ) : (
            filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between rounded-xl border border-white/10 p-4"
              >
                <div>
                  <p className="text-sm text-white">{sale.buyerName}</p>
                  <p className="text-xs text-neutral">
                    Bought {sale.itemCount} {sale.itemCount === 1 ? 'account' : 'accounts'}
                  </p>
                </div>
                <p className="text-sm font-semibold text-white">₦{sale.amount.toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <AccountsManageModal
        isOpen={!!manageCategoryId}
        onClose={() => setManageCategoryId(null)}
        categoryId={manageCategoryId}
        categoryName={manageCategoryName}
      />
    </div>
  );
}
