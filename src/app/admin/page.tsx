export const dynamic = 'force-dynamic';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { AdminDashboardClient } from '@/components/admin';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: adminProfile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('auth_user_id', user!.id)
    .single();

  const { count: totalUsers } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { data: categories } = await supabaseAdmin.from('categories').select('id, name');
  const { data: accounts } = await supabaseAdmin.from('accounts').select('id, category_id, status');

  const totalCategories = categories?.length ?? 0;
  const totalAvailable = accounts?.filter((a) => a.status === 'available').length ?? 0;

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('total_amount, payment_status')
    .eq('payment_status', 'success');

  const totalAmount = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0;

  const lowStock = (categories ?? [])
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      available: (accounts ?? []).filter((a) => a.category_id === cat.id && a.status === 'available').length,
    }))
    .filter((cat) => cat.available < 3);

  const { data: recentOrdersRaw } = await supabaseAdmin
    .from('orders')
    .select(`
      id, total_amount, created_at,
      profiles ( full_name ),
      order_items ( id )
    `)
    .eq('payment_status', 'success')
    .order('created_at', { ascending: false })
    .limit(50);

  const recentSales = (recentOrdersRaw ?? []).map((order) => {
    const profileData = Array.isArray(order.profiles) ? order.profiles[0] : order.profiles;
    return {
      id: order.id,
      buyerName: (profileData as { full_name: string } | null)?.full_name ?? 'Unknown',
      itemCount: order.order_items?.length ?? 0,
      amount: Number(order.total_amount),
      createdAt: order.created_at,
    };
  });

  return (
    <AdminDashboardClient
      adminName={adminProfile?.full_name ?? 'Admin'}
      totalAvailable={totalAvailable}
      totalAmount={totalAmount}
      totalUsers={totalUsers ?? 0}
      totalCategories={totalCategories}
      lowStock={lowStock}
      recentSales={recentSales}
    />
  );
}
