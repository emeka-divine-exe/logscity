'use client';

import { useState } from 'react';
import { ProductCard, type ProductCardData } from '@/components/store';

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

      {/* AccountSelectionModal not built yet — will render here, driven by selectedCategoryId */}
    </>
  );
}
