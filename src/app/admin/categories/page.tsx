import { supabaseAdmin } from '@/lib/supabase/admin';
import { CategoriesList } from '@/components/admin';

export default async function AdminCategoriesPage() {
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('id, name, platform, description, price, featured, requires_selection')
    .order('name');

  return (
    <div>
      <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
        Categories
      </h1>
      <p className="mt-1 text-sm text-neutral">Manage what&apos;s for sale on the store.</p>

      <div className="mt-8">
        <CategoriesList categories={categories ?? []} />
      </div>
    </div>
  );
}
