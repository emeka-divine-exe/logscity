'use client';

import { useState } from 'react';
import { ProductCard, type ProductCardData } from '@/components/store';
import { AccountSelectionModal } from '@/components/modals';

interface FeaturedListingsGridProps {
  products: ProductCardData[];
}

export function FeaturedListingsGrid({ products }: FeaturedListingsGridProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  return (
    <>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onChooseAccounts={setSelectedCategoryId}
          />
        ))}
      </div>

      <AccountSelectionModal
        categoryId={selectedCategoryId}
        onClose={() => setSelectedCategoryId(null)}
      />
    </>
  );
}
