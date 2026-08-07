'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui';
import { CategoryFormModal } from './CategoryFormModal';
import { AccountsManageModal } from './AccountsManageModal';
import { AddAccountModal } from './AddAccountModal';

interface Category {
  id: string;
  name: string;
  platform: string;
  price: number;
  requires_selection: boolean;
  available: number;
}

interface AvailableAccountsClientProps {
  categories: Category[];
}

export function AvailableAccountsClient({ categories }: AvailableAccountsClientProps) {
  const router = useRouter();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [manageCategory, setManageCategory] = useState<{ id: string; name: string } | null>(null);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  function handleRefresh() {
    router.refresh();
  }

  const grouped = useMemo(() => {
    const map = new Map<string, Category[]>();
    for (const cat of categories) {
      const key = cat.platform || 'Other';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(cat);
    }
    return Array.from(map.entries());
  }, [categories]);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          onClick={() => {
            setEditingCategory(null);
            setIsCategoryFormOpen(true);
          }}
        >
          <Icon icon="lucide:folder-plus" className="mr-2" />
          Create New Category
        </Button>
        <Button variant="secondary" onClick={() => setIsAddAccountOpen(true)}>
          <Icon icon="lucide:plus" className="mr-2" />
          Add Account
        </Button>
      </div>

      <div className="mt-8 flex flex-col gap-8">
        {grouped.map(([platform, cats]) => (
          <div key={platform}>
            <h2 className="text-lg font-semibold capitalize text-white">{platform}</h2>
            <div className="mt-3 flex flex-col gap-3">
              {cats.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{category.name}</p>
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setIsCategoryFormOpen(true);
                        }}
                        aria-label="Edit category details"
                        className="text-neutral hover:text-white"
                      >
                        <Icon icon="lucide:pencil" className="text-xs" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-neutral">
                      ₦{category.price.toLocaleString()} · {category.available} Available
                    </p>
                  </div>
                  <button
                    onClick={() => setManageCategory({ id: category.id, name: category.name })}
                    className="rounded-lg border border-white/10 px-4 py-1.5 text-sm text-white hover:bg-white/5"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <CategoryFormModal
        isOpen={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        onSaved={handleRefresh}
        editingCategory={editingCategory}
      />

      <AccountsManageModal
        isOpen={!!manageCategory}
        onClose={() => setManageCategory(null)}
        categoryId={manageCategory?.id ?? null}
        categoryName={manageCategory?.name ?? ''}
      />

      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onSaved={handleRefresh}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
