import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AuthenticatedShell } from '@/components/layout';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('auth_user_id', user.id)
    .single();

  return (
    <AuthenticatedShell userName={profile?.full_name ?? 'User'}>
      {children}
    </AuthenticatedShell>
  );
}
