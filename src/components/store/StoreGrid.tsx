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
        p.platform.toLowerCase().includes(term) ||
        (p.description ?? '').toLowerCase().includes(term)
    );
  }, [search, products]);

  const grouped = useMemo(() => {
    const groups: Record<string, ProductCardData[]> = {};
    for (const product of filtered) {
      const key = product.platform;
      if (!groups[key]) groups[key] = [];
      groups[key].push(product);
    }
    return groups;
  }, [filtered]);

  const platforms = Object.keys(grouped);

  return (
    <>
      <SearchBar value={search} onChange={setSearch} className="mt-8 max-w-md" />

      {platforms.length === 0 && (
        <div className="mt-12">
          <EmptyState
            icon="lucide:search-x"
            title="No products found"
            description="Try a different search term."
          />
        </div>
      )}

      {platforms.map((platform) => (
        <div key={platform} className="mt-12">
          <h2 className="text-xl font-semibold capitalize text-white">{platform}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {grouped[platform].map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onChooseAccounts={setSelectedCategoryId}
              />
            ))}
          </div>
        </div>
      ))}

      <AccountSelectionModal
        categoryId={selectedCategoryId}
        onClose={() => setSelectedCategoryId(null)}
      />
    </>
  );
}
