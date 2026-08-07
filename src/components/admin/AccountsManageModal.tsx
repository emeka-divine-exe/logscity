'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { Modal, Spinner, EmptyState } from '@/components/ui';
import { ConfirmationModal } from '@/components/modals';

interface AccountRow {
  id: string;
  profile_url: string | null;
  username: string | null;
  email: string | null;
  status: string;
  created_at: string;
}

interface AccountsManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string | null;
  categoryName: string;
}

export function AccountsManageModal({ isOpen, onClose, categoryId, categoryName }: AccountsManageModalProps) {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen || !categoryId) return;

    setIsLoading(true);
    fetch(`/api/admin/accounts?category_id=${categoryId}`)
      .then((res) => res.json())
      .then((data) => setAccounts(data.accounts ?? []))
      .finally(() => setIsLoading(false));
  }, [isOpen, categoryId]);

  async function handleDelete() {
    if (!deletingId) return;
    setIsDeleting(true);

    const res = await fetch(`/api/admin/accounts/${deletingId}`, { method: 'DELETE' });

    setIsDeleting(false);

    if (!res.ok) {
      toast.error('Failed to delete account');
      return;
    }

    toast.success('Account deleted');
    setAccounts((prev) => prev.filter((a) => a.id !== deletingId));
    setDeletingId(null);
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={categoryName} size="md">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        )}

        {!isLoading && accounts.length === 0 && (
          <EmptyState
            icon="lucide:package-x"
            title="No accounts yet"
            description="Add accounts to this category to start selling."
          />
        )}

        {!isLoading && accounts.length > 0 && (
          <div className="flex flex-col gap-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-xl border border-white/10 p-3"
              >
                <div>
                  <p className="text-sm text-white">{account.username || account.email || 'Account'}</p>
                  <p className="text-xs text-neutral">
                    {account.status === 'available' ? 'Available' : 'Sold'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {account.profile_url && (
                    <a
                      href={account.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-neutral hover:bg-white/5 hover:text-white"
                    >
                      <Icon icon="lucide:external-link" />
                    </a>
                  )}
                  <button
                    onClick={() => setDeletingId(account.id)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                  >
                    <Icon icon="lucide:trash-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete this account?"
        description="This will permanently remove it from the store. This cannot be undone."
        confirmLabel="Delete"
        isDangerous
        isLoading={isDeleting}
      />
    </>
  );
            }
