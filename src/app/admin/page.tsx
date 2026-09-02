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
    .eq('payment_status', 'paid');

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
    .eq('payment_status', 'paid')
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

  const { data: pendingOrders } = await supabaseAdmin
    .from('orders')
    .select(`
      id, total_amount, payment_reference, created_at, metadata,
      profiles ( full_name, email )
    `)
    .eq('payment_status', 'pending')
    .order('created_at', { ascending: false });

  const { data: restockWarningsRaw } = await supabaseAdmin
    .from('restock_warnings')
    .select('id, reason, detail, created_at, category_id, categories ( name )')
    .eq('resolved', false)
    .order('created_at', { ascending: false });

  const restockWarnings = (restockWarningsRaw ?? []).map((w) => {
    const category = Array.isArray(w.categories) ? w.categories[0] : w.categories;
    return {
      id: w.id,
      reason: w.reason,
      detail: w.detail,
      created_at: w.created_at,
      categoryId: w.category_id,
      categoryName: (category as { name: string } | null)?.name ?? 'Unknown category',
    };
  });
  const { data: unmatchedPayments } = await supabaseAdmin
    .from('unmatched_sms_payments')
    .select('id, amount, raw_sms, created_at')
    .eq('resolved', false)
    .order('created_at', { ascending: false });

  const { data: pendingTopupsRaw } = await supabaseAdmin
    .from('pending_topups')
    .select('id, exact_amount, created_at, profiles ( full_name, email )')
    .eq('status', 'pending')
    .eq('marked_sent', true)
    .order('created_at', { ascending: false });

  const pendingTopups = (pendingTopupsRaw ?? []).map((t) => {
    const profile = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
    return {
      id: t.id,
      exact_amount: t.exact_amount,
      created_at: t.created_at,
      customerName: (profile as { full_name: string } | null)?.full_name ?? 'Unknown',
      customerEmail: (profile as { email: string } | null)?.email ?? '',
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
      pendingOrders={pendingOrders ?? []}
      restockWarnings={restockWarnings}
      unmatchedPayments={unmatchedPayments ?? []}
      pendingTopups={pendingTopups}
    />
  );
}
