'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Modal, Button, Spinner, EmptyState } from '@/components/ui';
import { Icon } from '@iconify/react';

interface AvailableAccount {
  id: string;
  profile_url: string;
}

interface CategoryInfo {
  id: string;
  name: string;
  price: number;
}

interface AccountSelectionModalProps {
  categoryId: string | null;
  onClose: () => void;
}

export function AccountSelectionModal({ categoryId, onClose }: AccountSelectionModalProps) {
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [accounts, setAccounts] = useState<AvailableAccount[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!categoryId) {
      setCategory(null);
      setAccounts([]);
      setSelectedIds(new Set());
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    async function loadData() {
      const [{ data: categoryData }, { data: accountsData }] = await Promise.all([
        supabase.from('categories').select('id, name, price').eq('id', categoryId).single(),
        supabase.from('available_accounts').select('id, profile_url').eq('category_id', categoryId),
      ]);

      setCategory(categoryData ? { ...categoryData, price: Number(categoryData.price) } : null);
      setAccounts(accountsData ?? []);
      setSelectedIds(new Set());
      setIsLoading(false);
    }

    loadData();
  }, [categoryId]);

  function toggleAccount(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selectedCount = selectedIds.size;
  const total = category ? category.price * selectedCount : 0;

  function handleProceedToPayment() {
    // Paystack not wired yet — placeholder for next build step
  }

  return (
    <Modal
      isOpen={categoryId !== null}
      onClose={onClose}
      title={category?.name ?? 'Select Accounts'}
      size="md"
      footer={
        <div className="flex w-full items-center justify-between">
          <div>
            <p className="text-sm text-neutral">Selected: {selectedCount}</p>
            <p className="text-lg font-bold text-white">₦{total.toLocaleString()}</p>
          </div>
          <Button
            variant="primary"
            disabled={selectedCount === 0}
            onClick={handleProceedToPayment}
          >
            Proceed to Payment
          </Button>
        </div>
      }
    >
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      )}

      {!isLoading && accounts.length === 0 && (
        <EmptyState
          icon="lucide:package-x"
          title="No accounts available"
          description="This category is currently out of stock. Check back soon."
        />
      )}

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
          </label>
        ))}
      </div>
    </Modal>
  );
}
