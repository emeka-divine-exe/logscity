import { supabaseAdmin } from '@/lib/supabase/admin';
import { AvailableAccountsClient } from '@/components/admin';

export default async function AvailableAccountsPage() {
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('id, name, platform, description, price, featured, requires_selection')
    .order('platform')
    .order('name');

  const { data: accounts } = await supabaseAdmin.from('accounts').select('id, category_id, status');

  const categoriesWithCounts = (categories ?? []).map((cat) => ({
    ...cat,
    price: Number(cat.price),
    available: (accounts ?? []).filter((a) => a.category_id === cat.id && a.status === 'available').length,
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Available Accounts
          </h1>
          <p className="mt-1 text-sm text-neutral">Manage every account for sale, by category.</p>
        </div>
      </div>

      <div className="mt-8">
        <AvailableAccountsClient categories={categoriesWithCounts} />
      </div>
    </div>
  );
}
