'use client';

import { Icon } from '@iconify/react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface ProductCardData {
  id: string;
  platform: string | null;
  name: string;
  description: string | null;
  price: number;
  availableCount: number;
  requiresSelection: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  onChooseAccounts: (productId: string) => void;
  className?: string;
}

export function ProductCard({ product, onChooseAccounts, className }: ProductCardProps) {
  const { id, name, description, price, availableCount, requiresSelection } = product;
  const isOutOfStock = availableCount === 0;

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10">
          <Icon icon="lucide:package" className="text-lg text-neutral" />
        </div>
        <h3 className="text-base font-semibold text-white">{name}</h3>
      </div>

      {description && (
        <p className="line-clamp-2 text-sm text-neutral">{description}</p>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-lg font-bold text-white">
          ₦{price.toLocaleString()}
        </span>
        <span className={cn('text-neutral', isOutOfStock && 'text-red-500')}>
          {isOutOfStock ? 'Out of stock' : `${availableCount} Available`}
        </span>
      </div>

      <Button
        variant="primary"
        size="sm"
        disabled={isOutOfStock}
        onClick={() => onChooseAccounts(id)}
        className="w-full"
      >
        <Icon
          icon={requiresSelection ? 'lucide:list-checks' : 'lucide:shopping-cart'}
          className="mr-2 text-base"
        />
        {requiresSelection ? 'Choose Accounts' : 'Buy Now'}
      </Button>
    </div>
  );
}
