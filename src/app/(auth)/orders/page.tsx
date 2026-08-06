import { createClient } from '@/lib/supabase/server';
import { OrdersList } from '@/components/orders';

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user!.id)
    .single();

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, total_amount, payment_status, created_at,
      order_items (
        id, price,
        accounts (
          id, username, email, password, two_fa_key, gmail_password, profile_url,
          category_id,
          categories ( name, platform )
        )
      )
    `)
    .eq('profile_id', profile?.id)
    .eq('payment_status', 'success')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        My Orders
      </h1>
      <p className="mt-1 text-sm text-neutral">Your purchases and account credentials.</p>

      <div className="mt-8">
        <OrdersList orders={orders ?? []} />
      </div>
    </div>
  );
}
