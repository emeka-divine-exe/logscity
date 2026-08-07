'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Logo } from '@/components/shared';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: 'lucide:layout-dashboard' },
  { label: 'Orders', href: '/orders', icon: 'lucide:package' },
  { label: 'Settings', href: '/settings', icon: 'lucide:settings' },
];

interface SidebarProps {
  onHelpClick: () => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

export function Sidebar({ onHelpClick, onLogout, isAdmin = false }: SidebarProps) {
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

      {isAdmin && (
        <Link
          href="/admin"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary/10"
        >
          <Icon icon="lucide:shield" className="text-lg" />
          Admin Dashboard
        </Link>
      )}

      <button
        onClick={() => {
          setIsOpen(false);
          onHelpClick();
        }}
        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-neutral transition-colors duration-200 hover:bg-white/5 hover:text-white"
      >
        <Icon icon="lucide:help-circle" className="text-lg" />
        Help
      </button>
    </>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:hidden">
        <Logo />
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

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="mt-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-500 transition-colors duration-200 hover:bg-red-500/10"
            >
              <Icon icon="lucide:log-out" className="text-lg" />
              Logout
            </button>
          </div>
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen w-64 flex-col gap-1 border-r border-white/10 p-4 md:flex">
        <div className="mb-6 px-2">
          <Logo />
        </div>

        <NavLinks />

        <button
          onClick={onLogout}
          className="mt-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-500 transition-colors duration-200 hover:bg-red-500/10"
        >
          <Icon icon="lucide:log-out" className="text-lg" />
          Logout
        </button>
      </aside>
    </>
  );
}
