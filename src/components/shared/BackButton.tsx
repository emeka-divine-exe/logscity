'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm text-neutral hover:text-white"
    >
      <Icon icon="lucide:arrow-left" className="text-base" />
      Back
    </button>
  );
}
