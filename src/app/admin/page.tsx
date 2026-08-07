import { supabaseAdmin } from '@/lib/supabase/admin';

export default async function AdminOverviewPage() {
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('id, total_amount, payment_status')
    .eq('payment_status', 'success');

  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0;
  const totalOrders = orders?.length ?? 0;

  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('id, name');

  const { data: accounts } = await supabaseAdmin
    .from('accounts')
    .select('id, category_id, status');

  const stockByCategory = (categories ?? []).map((category) => {
    const available = (accounts ?? []).filter(
      (a) => a.category_id === category.id && a.status === 'available'
    ).length;
    return { name: category.name, available };
  });

  const lowStock = stockByCategory.filter((c) => c.available <= 2);

  return (
    <div>
      <h1
        className="text-2xl font-bold text-white"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Admin Overview
      </h1>
      <p className="mt-1 text-sm text-neutral">Store-wide performance and stock health.</p>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-neutral">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-white">
            ₦{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-neutral">Total Orders</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalOrders}</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-white">Stock by Category</h2>
        <div className="mt-4 flex flex-col gap-3">
          {stockByCategory.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center justify-between rounded-xl border border-white/10 p-4"
            >
              <p className="text-sm text-white">{cat.name}</p>
              <p
                className={`text-sm font-semibold ${
                  cat.available <= 2 ? 'text-red-400' : 'text-white'
                }`}
              >
                {cat.available} available
              </p>
            </div>
          ))}
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm font-medium text-red-400">
            Low stock: {lowStock.map((c) => c.name).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
            }
