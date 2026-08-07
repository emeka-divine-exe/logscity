'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from './Sidebar';
import { HelpModal, ConfirmationModal } from '@/components/modals';

export function AuthenticatedShell({
  children,
  isAdmin = false,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Logged out');
    window.location.href = '/';
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar
        onHelpClick={() => setIsHelpOpen(true)}
        onLogout={() => setIsLogoutConfirmOpen(true)}
        isAdmin={isAdmin}
      />
      <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <ConfirmationModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Log out?"
        description="You will need to log in again to access your dashboard and orders."
        confirmLabel="Log Out"
        isLoading={isLoggingOut}
      />
    </div>
  );
}
