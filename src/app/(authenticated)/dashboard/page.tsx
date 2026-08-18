import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, balance')
    .eq('auth_user_id', user!.id)
    .single();

  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_amount, payment_status, created_at')
    .eq('profile_id', profile?.id)
    .eq('payment_status', 'success')
    .order('created_at', { ascending: false });

  const totalOrders = orders?.length ?? 0;
  const totalSpent = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0;
  const recentOrders = orders?.slice(0, 5) ?? [];

  return (
    <div>
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Welcome back, {profile?.full_name ?? 'there'}
      </h1>
      <p className="mt-1 text-sm text-neutral">
        Here&apos;s what&apos;s happening with your account.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="col-span-2 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <p className="text-sm text-neutral">Your Balance</p>
          <p className="mt-1 text-2xl font-bold text-white">
            ₦{Number(profile?.balance ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-neutral">Total Orders</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalOrders}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-neutral">Total Spent</p>
          <p className="mt-1 text-2xl font-bold text-white">₦{totalSpent.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/store">
          <Button variant="primary">Browse Store</Button>
        </Link>
        <Link href="/topup">
          <Button variant="secondary">Top Up Balance</Button>
        </Link>
        <Link href="/orders">
          <Button variant="secondary">My Orders</Button>
        </Link>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="mt-3 text-sm text-neutral">No orders yet.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-white/10 p-4"
              >
                <div>
                  <p className="text-sm text-white">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-neutral">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm font-semibold text-white">
                  ₦{Number(order.total_amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
