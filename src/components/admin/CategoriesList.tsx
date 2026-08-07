'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui';
import { ConfirmationModal } from '@/components/modals';
import { CategoryFormModal } from './CategoryFormModal';

interface Category {
  id: string;
  name: string;
  platform: string;
  description: string | null;
  price: number;
  featured: boolean;
  requires_selection: boolean;
}

interface CategoriesListProps {
  categories: Category[];
}

export function CategoriesList({ categories }: CategoriesListProps) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleSaved() {
    router.refresh();
  }

  async function handleDelete() {
    if (!deletingCategory) return;
    setIsDeleting(true);

    const res = await fetch(`/api/admin/categories/${deletingCategory.id}`, {
      method: 'DELETE',
    });

    setIsDeleting(false);

    if (!res.ok) {
      toast.error('Failed to delete category');
      return;
    }

    toast.success('Category deleted');
    setDeletingCategory(null);
    router.refresh();
  }

  return (
    <div>
      <Button
        variant="primary"
        onClick={() => {
          setEditingCategory(null);
          setIsFormOpen(true);
        }}
      >
        <Icon icon="lucide:plus" className="mr-2" />
        Add Category
      </Button>

      <div className="mt-6 flex flex-col gap-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between rounded-xl border border-white/10 p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">{category.name}</p>
                {category.featured && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                    Featured
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-neutral">
                ₦{Number(category.price).toLocaleString()} ·{' '}
                {category.requires_selection ? 'Buyers pick accounts' : 'Quantity only'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingCategory(category);
                  setIsFormOpen(true);
                }}
                className="rounded-lg p-2 text-neutral hover:bg-white/5 hover:text-white"
              >
                <Icon icon="lucide:pencil" />
              </button>
              <button
                onClick={() => setDeletingCategory(category)}
                className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
              >
                <Icon icon="lucide:trash-2" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={handleSaved}
        editingCategory={editingCategory}
      />

      <ConfirmationModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        title="Delete this category?"
        description={`"${deletingCategory?.name}" and all its listed accounts will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        isDangerous
        isLoading={isDeleting}
      />
    </div>
  );
}
