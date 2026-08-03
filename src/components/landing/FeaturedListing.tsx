import { createClient } from '@/lib/supabase/server';
import { FeaturedListingsGrid } from './FeaturedListingsGrid';
import type { ProductCardData } from '@/components/store';

export async function FeaturedListings() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, platform, description, price')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load featured categories:', error);
    return null;
  }

  if (!categories || categories.length === 0) {
    return null; // nothing featured yet — section just doesn't render
  }

  // availableCount is computed, not stored — one count query per category
  const products: ProductCardData[] = await Promise.all(
    categories.map(async (category) => {
      const { count } = await supabase
        .from('accounts')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('status', 'available');

      return {
        id: category.id,
        platform: category.platform,
        name: category.name,
        description: category.description,
        price: Number(category.price),
        availableCount: count ?? 0,
      };
    })
  );

  return (
    <section id="featured" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2
          className="text-3xl font-bold text-white"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Featured Listings
        </h2>
        <p className="mt-2 text-neutral">A few of our available accounts right now.</p>

        <FeaturedListingsGrid products={products} />
      </div>
    </section>
  );
}
