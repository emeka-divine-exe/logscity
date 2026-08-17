'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Modal, Button, Spinner, EmptyState } from '@/components/ui';
import { Icon } from '@iconify/react';
import { BANK_DETAILS, buildWhatsAppOrderLink } from '@/lib/constants/payment';

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

  async function handlePlaceOrder() {
    if (!category || count === 0) return;

    setIsProcessing(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please log in to continue');
        router.push('/login?redirect=/store');
        setIsProcessing(false);
        return;
      }

      const res = await fetch('/api/checkout/initialize', {
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
        toast.error(data.error || 'Failed to place order');
        setIsProcessing(false);
        return;
      }

      const summary = `${data.count} × ${data.categoryName}`;
      const whatsappLink = buildWhatsAppOrderLink(data.reference, data.amount, summary);

      window.open(whatsappLink, '_blank');
      setOrderPlaced(true);
      toast.success('Order placed — complete payment via WhatsApp');
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
            </div>
            <Button
              variant="primary"
              disabled={count === 0 || isProcessing}
              isLoading={isProcessing}
              onClick={handlePlaceOrder}
            >
              Order via WhatsApp
            </Button>
          </div>
        )
      }
    >
      {orderPlaced ? (
        <div className="flex flex-col gap-4 py-4">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-medium text-white">Send payment to:</p>
            <div className="mt-2 flex flex-col gap-1 text-sm text-neutral">
              <p>Bank: <span className="text-white">{BANK_DETAILS.bankName}</span></p>
              <p>Account Name: <span className="text-white">{BANK_DETAILS.accountName}</span></p>
              <p>Account Number: <span className="text-white">{BANK_DETAILS.accountNumber}</span></p>
            </div>
          </div>
          <p className="text-sm text-neutral">
            We've opened WhatsApp with your order details. Send your payment proof there —
            your accounts will be released as soon as we confirm it.
          </p>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Spinner />
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
