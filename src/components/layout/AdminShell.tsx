'use client';

import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { AdminSidebar } from './AdminSidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Logged out');
    window.location.href = '/';
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
