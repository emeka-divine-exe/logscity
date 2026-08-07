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

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  // TEMPORARY DEBUG — shows what the server actually sees instead of redirecting
  if (error || profile?.role !== 'admin') {
    return (
      <div style={{ padding: 40, color: 'white', background: '#161316', minHeight: '100vh' }}>
        <h1>Admin Debug Info</h1>
        <p>user.id: {user.id}</p>
        <p>profile: {JSON.stringify(profile)}</p>
        <p>error: {JSON.stringify(error)}</p>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
