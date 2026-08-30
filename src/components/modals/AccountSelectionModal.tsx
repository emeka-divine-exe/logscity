'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Modal, Button, Spinner, EmptyState } from '@/components/ui';
import { Icon } from '@iconify/react';

interface AvailableAccount {
  id: string;
  profile_url: string | null;
}

interface CategoryInfo {
  id: string;
  name: string;
  price: number;
  requires_selection: boolean;
}

interface AccountSelectionModalProps {
  categoryId: string | null;
  onClose: () => void;
}

export function AccountSelectionModal({ categoryId, onClose }: AccountSelectionModalProps) {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [accounts, setAccounts] = useState<AvailableAccount[]>([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    if (!categoryId) {
      setCategory(null);
      setAccounts([]);
      setSelectedIds(new Set());
      setQuantity(0);
      setOrderPlaced(false);
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('balance')
          .eq('auth_user_id', user.id)
          .single();
        setWalletBalance(Number(profile?.balance ?? 0));
      }

      const { data: categoryData } = await supabase
        .from('categories')
        .select('id, name, price, requires_selection')
        .eq('id', categoryId)
        .single();

      const resolvedCategory = categoryData
        ? { ...categoryData, price: Number(categoryData.price) }
        : null;
      setCategory(resolvedCategory);
      setSelectedIds(new Set());
      setQuantity(0);

      if (resolvedCategory?.requires_selection) {
        const { data: accountsData } = await supabase
          .from('available_accounts')
          .select('id, profile_url')
          .eq('category_id', categoryId);
        setAccounts(accountsData ?? []);
      } else {
        const { count } = await supabase
          .from('available_accounts')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', categoryId);
        setAvailableCount(count ?? 0);
      }

      setIsLoading(false);
    }

    loadData();
  }, [categoryId]);

  function toggleAccount(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const requiresSelection = category?.requires_selection ?? true;
  const count = requiresSelection ? selectedIds.size : quantity;
  const total = category ? category.price * count : 0;
  const insufficientBalance = total > 0 && total > walletBalance;

  async function handlePlaceOrder() {
    if (!category || count === 0) return;

    setIsProcessing(true);

    try {
      const res = await fetch('/api/checkout/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: category.id,
          accountIds: requiresSelection ? Array.from(selectedIds) : null,
          quantity: requiresSelection ? null : quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          toast.error('Insufficient balance — top up your wallet to continue');
        } else {
          toast.error(data.error || 'Failed to place order');
        }
        setIsProcessing(false);
        return;
      }

      setOrderPlaced(true);
      toast.success('Purchase successful!');
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDone() {
    onClose();
    router.push('/orders');
  }

  function handleTopUp() {
    onClose();
    router.push('/topup');
  }

  return (
    <Modal
      isOpen={categoryId !== null}
      onClose={onClose}
      title={category?.name ?? 'Select Accounts'}
      size="md"
      footer={
        orderPlaced ? (
          <div className="flex w-full justify-end">
            <Button variant="primary" onClick={handleDone}>
              View My Orders
            </Button>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between">
            <div>
              <p className="text-sm text-neutral">
                {requiresSelection ? 'Selected' : 'Quantity'}: {count}
              </p>
              <p className="text-lg font-bold text-white">₦{total.toLocaleString()}</p>
              <p className="text-xs text-neutral">
                Wallet balance: ₦{walletBalance.toLocaleString()}
              </p>
            </div>
            {insufficientBalance ? (
              <Button variant="primary" onClick={handleTopUp}>
                Top Up Wallet
              </Button>
            ) : (
              <Button
                variant="primary"
                disabled={count === 0 || isProcessing}
                isLoading={isProcessing}
                onClick={handlePlaceOrder}
              >
                Buy Now
              </Button>
            )}
          </div>
        )
      }
    >
      {orderPlaced ? (
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <Icon icon="lucide:check-circle" className="text-2xl text-primary" />
            <div>
              <p className="text-sm font-medium text-white">Purchase complete</p>
              <p className="mt-1 text-sm text-neutral">
                ₦{total.toLocaleString()} was deducted from your wallet. Your account details are
                ready in Orders.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          )}

          {!isLoading && insufficientBalance && (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-sm text-amber-400">
                Your wallet balance (₦{walletBalance.toLocaleString()}) isn&apos;t enough for this
                purchase. Top up to continue.
              </p>
            </div>
          )}

          {!isLoading && requiresSelection && accounts.length === 0 && (
            <EmptyState
              icon="lucide:package-x"
              title="No accounts available"
              description="This category is currently out of stock. Check back soon."
            />
          )}

          {!isLoading && requiresSelection && accounts.length > 0 && (
            <div className="flex flex-col gap-3">
              {accounts.map((account) => (
                <label
                  key={account.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(account.id)}
                      onChange={() => toggleAccount(account.id)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm text-white">Account</span>
                  </div>
                  {account.profile_url && (
                    <a
                      href={account.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Account
                      <Icon icon="lucide:external-link" className="text-xs" />
                    </a>
                  )}
                </label>
              ))}
            </div>
          )}

          {!isLoading && !requiresSelection && availableCount === 0 && (
            <EmptyState
              icon="lucide:package-x"
              title="Out of stock"
              description="This category is currently unavailable. Check back soon."
            />
          )}

          {!isLoading && !requiresSelection && availableCount > 0 && (
            <div className="flex flex-col items-center gap-4 py-6">
              <p className="text-sm text-neutral">{availableCount} available</p>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                  disabled={quantity === 0}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white disabled:opacity-30"
                >
                  <Icon icon="lucide:minus" />
                </button>
                <span className="w-8 text-center text-xl font-semibold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(availableCount, q + 1))}
                  disabled={quantity >= availableCount}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white disabled:opacity-30"
                >
                  <Icon icon="lucide:plus" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
