import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { buyFromEmonBestLog, getEmonBestLogBalance, EmonBestLogError } from './client';

export async function maybeAutoRestock(categoryId: string) {
  const { data: category } = await supabaseAdmin
    .from('categories')
    .select('id, name, emonbestlog_product_id, restock_quantity, low_stock_threshold, cost_price')
    .eq('id', categoryId)
    .single();

  if (!category?.emonbestlog_product_id || !category.restock_quantity) {
    return;
  }

  const { count: availableCount } = await supabaseAdmin
    .from('accounts')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .eq('status', 'available');

  if ((availableCount ?? 0) >= category.low_stock_threshold) {
    return;
  }

  try {
    const emonBalance = await getEmonBestLogBalance();

    const estimatedCost = Number(category.cost_price ?? 0) * category.restock_quantity;
    if (emonBalance < estimatedCost) {
      await supabaseAdmin.from('restock_warnings').insert({
        category_id: categoryId,
        reason: 'low_emonbestlog_balance',
        detail: `EmonBestLog balance (₦${emonBalance}) is too low to restock "${category.name}" (needs ~₦${estimatedCost}).`,
      });
      return;
    }

    const result = await buyFromEmonBestLog(
      category.emonbestlog_product_id,
      category.restock_quantity
    );

    const newAccounts = result.keys.map((key) => ({
      category_id: categoryId,
      raw_key: key,
      status: 'available' as const,
      source: 'emonbestlog' as const,
    }));

    const { error: insertError } = await supabaseAdmin.from('accounts').insert(newAccounts);
    if (insertError) throw insertError;
  } catch (err) {
    const isBalanceError = err instanceof EmonBestLogError && err.status === 402;

    await supabaseAdmin.from('restock_warnings').insert({
      category_id: categoryId,
      reason: isBalanceError ? 'low_emonbestlog_balance' : 'restock_failed',
      detail: err instanceof Error ? err.message : 'Unknown error during auto-restock',
    });

    console.error('Auto-restock failed', { categoryId, error: err });
  }
}
