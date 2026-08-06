'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from './Sidebar';
import { HelpModal } from '@/components/modals';

interface AuthenticatedShellProps {
  userName: string;
  children: React.ReactNode;
}

export function AuthenticatedShell({ userName, children }: AuthenticatedShellProps) {
  const router = useRouter();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Logged out');
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={userName}
        onHelpClick={() => setIsHelpOpen(true)}
        onLogout={handleLogout}
      />
      <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
