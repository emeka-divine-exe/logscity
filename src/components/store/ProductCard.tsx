'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface ProductCardData {
  id: string;
  platform: string; // comes straight from categories.platform in the DB — no fixed set
  title: string;
  tags: string[];
  price: number;
  availableCount: number;
}

interface ProductCardProps {
  product: ProductCardData;
  onChooseAccounts: (productId: string) => void;
  className?: string;
}

export function ProductCard({ product, onChooseAccounts, className }: ProductCardProps) {
  const { id, platform, title, tags, price, availableCount } = product;
  const isOutOfStock = availableCount === 0;
  const [iconFailed, setIconFailed] = useState(false);

  // Icon path is derived from the platform string itself, e.g. "facebook" -> /platforms/facebook.png
  // Any new platform added in the DB just needs a matching file dropped into public/platforms/
  const iconSrc = `/platforms/${platform.toLowerCase()}.png`;

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5',
        className
      )}
    >
      {/* Platform icon + title */}
      <div className="flex items-center gap-3">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-white/10">
          {iconFailed ? (
            <Icon
              icon="lucide:globe"
              className="absolute inset-0 m-auto text-lg text-neutral"
            />
          ) : (
            <Image
              src={iconSrc}
              alt={platform}
              fill
              className="object-contain p-1.5"
              onError={() => setIconFailed(true)}
            />
          )}
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-white/10 px-2.5 py-1 text-xs text-neutral"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Price + availability */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-lg font-bold text-white">
          ₦{price.toLocaleString()}
        </span>
        <span className={cn('text-neutral', isOutOfStock && 'text-red-500')}>
          {isOutOfStock ? 'Out of stock' : `${availableCount} Available`}
        </span>
      </div>

      {/* CTA */}
      <Button
        variant="primary"
        size="sm"
        disabled={isOutOfStock}
        onClick={() => onChooseAccounts(id)}
        className="w-full"
      >
        <Icon icon="lucide:list-checks" className="mr-2 text-base" />
        Choose Accounts
      </Button>
    </div>
  );
      }
