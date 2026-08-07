'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Logo } from '@/components/shared';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: 'lucide:layout-dashboard' },
  { label: 'Available Accounts', href: '/admin/accounts', icon: 'lucide:package' },
];

interface AdminSidebarProps {
  onLogout: () => void;
}

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-200',
              isActive
                ? 'bg-primary/15 text-primary'
                : 'text-neutral hover:bg-white/5 hover:text-white'
            )}
          >
            <Icon icon={item.icon} className="text-lg" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
            Admin
          </span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center rounded-xl p-2 text-white"
          aria-label="Open menu"
        >
          <Icon icon="lucide:menu" className="text-2xl" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
          <div className="relative flex h-full w-72 flex-col gap-1 bg-background p-4">
            <div className="mb-4 flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center rounded-xl p-2 text-neutral hover:text-white"
                aria-label="Close menu"
              >
                <Icon icon="lucide:x" className="text-xl" />
              </button>
            </div>

            <NavLinks />

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="mt-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-neutral transition-colors duration-200 hover:bg-white/5 hover:text-white"
            >
              <Icon icon="lucide:arrow-left" className="text-lg" />
              Back to Site
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-500 transition-colors duration-200 hover:bg-red-500/10"
            >
              <Icon icon="lucide:log-out" className="text-lg" />
              Logout
            </button>
          </div>
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen w-64 flex-col gap-1 border-r border-white/10 p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <Logo />
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
            Admin
          </span>
        </div>

        <NavLinks />

        <Link
          href="/dashboard"
          className="mt-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-neutral transition-colors duration-200 hover:bg-white/5 hover:text-white"
        >
          <Icon icon="lucide:arrow-left" className="text-lg" />
          Back to Site
        </Link>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-500 transition-colors duration-200 hover:bg-red-500/10"
        >
          <Icon icon="lucide:log-out" className="text-lg" />
          Logout
        </button>
      </aside>
    </>
  );
}
