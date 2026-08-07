import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single();

  if (profile?.role !== 'admin') return null;

  return { user, profile };
}
