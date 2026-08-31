'use client';

import { useMemo, useState } from 'react';
import { ProductCard, type ProductCardData } from './ProductCard';
import { AccountSelectionModal } from '@/components/modals';
import { SearchBar } from '@/components/shared';
import { EmptyState } from '@/components/ui';

interface StoreGridProps {
  products: ProductCardData[];
}

export function StoreGrid({ products }: StoreGridProps) {
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.description ?? '').toLowerCase().includes(term)
    );
  }, [search, products]);

  return (
    <>
      <SearchBar value={search} onChange={setSearch} className="mt-8 max-w-md" />

      {filtered.length === 0 && (
        <div className="mt-12">
          <EmptyState
            icon="lucide:search-x"
            title="No products found"
            description="Try a different search term."
          />
        </div>
      )}

      {filtered.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onChooseAccounts={setSelectedCategoryId}
            />
          ))}
        </div>
      )}

      <AccountSelectionModal
        categoryId={selectedCategoryId}
        onClose={() => setSelectedCategoryId(null)}
      />
    </>
  );
}
