import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { StoreGrid } from '@/components/store';
import type { ProductCardData } from '@/components/store';

export const metadata: Metadata = {
  title: 'Store — LogsCity',
  description:
    'Browse social media accounts, VPN accounts, and more, organized by category. Instant delivery after purchase.',
};

export default async function StorePage() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, platform, description, price, requires_selection')
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to load categories:', error);
  }

  const products: ProductCardData[] = await Promise.all(
    (categories ?? []).map(async (category) => {
      const { count } = await supabase
        .from('available_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id);

      return {
        id: category.id,
        platform: category.platform,
        name: category.name,
        description: category.description,
        price: Number(category.price),
        availableCount: count ?? 0,
        requiresSelection: category.requires_selection,
      };
    })
  );

  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1
          className="text-3xl font-bold text-white sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Store
        </h1>
        <p className="mt-2 text-neutral">
          Browse all available accounts.
        </p>

        <StoreGrid products={products} />
      </div>
    </section>
  );
}
