'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';

interface OrderAccount {
  id: string;
  username: string | null;
  email: string | null;
  password: string | null;
  two_fa_key: string | null;
  gmail_password: string | null;
  profile_url: string | null;
  categories: { name: string; platform: string } | null;
}

interface OrderItem {
  id: string;
  price: number;
  accounts: OrderAccount | null;
}

interface Order {
  id: string;
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
}

interface OrdersListProps {
  orders: Order[];
}

export function OrdersList({ orders }: OrdersListProps) {
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [visibleCredentials, setVisibleCredentials] = useState<Set<string>>(new Set());

  function toggleCredential(itemId: string) {
    setVisibleCredentials((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="lucide:package-x"
        title="No orders yet"
        description="Your purchases will show up here once you buy something."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => {
        const isOpen = openOrderId === order.id;
        return (
          <div key={order.id} className="rounded-2xl border border-white/10 bg-white/5">
            <button
              onClick={() => setOpenOrderId(isOpen ? null : order.id)}
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <div>
                <p className="text-sm text-white">Order #{order.id.slice(0, 8)}</p>
                <p className="text-xs text-neutral">
                  {new Date(order.created_at).toLocaleDateString()} · {order.order_items.length}{' '}
                  {order.order_items.length === 1 ? 'account' : 'accounts'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-white">
                  ₦{Number(order.total_amount).toLocaleString()}
                </p>
                <Icon
                  icon="lucide:chevron-down"
                  className={cn('text-neutral transition-transform', isOpen && 'rotate-180')}
                />
              </div>
            </button>

            {isOpen && (
              <div className="flex flex-col gap-3 border-t border-white/10 p-5">
                {order.order_items.map((item) => {
                  const account = item.accounts;
                  const showCreds = visibleCredentials.has(item.id);

                  if (!account) return null;

                  return (
                    <div key={item.id} className="rounded-xl border border-white/10 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">
                          {account.categories?.name ?? 'Account'}
                        </p>
                        <button
                          onClick={() => toggleCredential(item.id)}
                          className="text-sm text-primary"
                        >
                          {showCreds ? 'Hide Credentials' : 'View Credentials'}
                        </button>
                      </div>

                      {showCreds && (
                        <div className="mt-3 flex flex-col gap-2 text-sm">
                          {account.username && (
                            <p className="text-neutral">
                              Username: <span className="text-white">{account.username}</span>
                            </p>
                          )}
                          {account.email && (
                            <p className="text-neutral">
                              Email: <span className="text-white">{account.email}</span>
                            </p>
                          )}
                          {account.password && (
                            <p className="text-neutral">
                              Password: <span className="text-white">{account.password}</span>
                            </p>
                          )}
                          {account.two_fa_key && (
                            <p className="text-neutral">
                              2FA: <span className="text-white">{account.two_fa_key}</span>
                            </p>
                          )}
                          {account.gmail_password && (
                            <p className="text-neutral">
                              Gmail Password:{' '}
                              <span className="text-white">{account.gmail_password}</span>
                            </p>
                          )}
                          {account.profile_url && (
                            <a
                              href={account.profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary"
                            >
                              View Profile
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
        }
