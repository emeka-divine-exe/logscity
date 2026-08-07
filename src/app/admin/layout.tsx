import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { AdminShell } from '@/components/layout';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  // Use service-role client here to eliminate RLS as a possible blocker on the role check
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (error || profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return <AdminShell>{children}</AdminShell>;
}
