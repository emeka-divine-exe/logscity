'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';
import { ConfirmationModal } from '@/components/modals';
import { Icon } from '@iconify/react';

export function SettingsClient() {
  const { theme, setTheme } = useTheme();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Logged out');
    window.location.href = '/';
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);

    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to delete account');
        setIsDeleting(false);
        return;
      }

      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('Account deleted');
      window.location.href = '/';
    } catch {
      toast.error('Something went wrong. Please try again.');
      setIsDeleting(false);
    }
  }

  return (
    <>
      <section>
        <h2 className="text-lg font-semibold text-white">Appearance</h2>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${
              theme === 'dark'
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-white/10 text-neutral'
            }`}
          >
            <Icon icon="lucide:moon" />
            Dark
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${
              theme === 'light'
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-white/10 text-neutral'
            }`}
          >
            <Icon icon="lucide:sun" />
            Light
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Account</h2>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => setIsLogoutConfirmOpen(true)}
        >
          <Icon icon="lucide:log-out" className="mr-2" />
          Log Out
        </Button>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
        <p className="mt-1 text-sm text-neutral">
          Deleting your account is permanent and cannot be undone.
        </p>
        <Button
          variant="secondary"
          className="mt-4 border-red-500/40 text-red-500 hover:bg-red-500/10"
          onClick={() => setIsDeleteConfirmOpen(true)}
        >
          Delete Account
        </Button>
      </section>

      <ConfirmationModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Log out?"
        description="You'll need to log in again to access your dashboard and orders."
        confirmLabel="Log Out"
        isLoading={isLoggingOut}
      />

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete your account?"
        description="This will permanently delete your account and you'll lose access to your order history. This cannot be undone."
        confirmLabel="Delete Account"
        isDangerous
        isLoading={isDeleting}
      />
    </>
  );
}
