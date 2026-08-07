import { createClient } from '@/lib/supabase/server';
import { SettingsForm, ChangePasswordForm } from '@/components/forms';
import { SettingsClient } from './SettingsClient';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('auth_user_id', user!.id)
    .single();

  return (
    <div>
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Settings
      </h1>
      <p className="mt-1 text-sm text-neutral">
        Manage your profile, security, and preferences.
      </p>

      <div className="mt-8 flex max-w-lg flex-col gap-8">
        <section>
          <h2 className="text-lg font-semibold text-white">Profile</h2>
          <p className="mt-1 text-sm text-neutral">{profile?.email}</p>
          <div className="mt-4">
            <SettingsForm profileId={profile!.id} initialFullName={profile?.full_name ?? ''} />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white">Change Password</h2>
          <div className="mt-4">
            <ChangePasswordForm />
          </div>
        </section>

        <SettingsClient />
      </div>
    </div>
  );
}
