'use client';

import { useState, ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
          >
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <span className="font-medium text-white">{item.title}</span>
              <Icon
                icon="lucide:chevron-down"
                className={cn(
                  'text-neutral transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            <div
              className={cn(
                'grid transition-all duration-200',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              )}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 text-sm text-neutral">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
