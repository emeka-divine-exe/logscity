import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { buyFromEmonBestLog, getEmonBestLogBalance, EmonBestLogError } from './client';

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object') {
    const anyErr = err as { message?: string; details?: string; hint?: string; code?: string };
    return (
      anyErr.message ??
      anyErr.details ??
      anyErr.hint ??
      (anyErr.code ? `Error code: ${anyErr.code}` : JSON.stringify(err))
    );
  }
  return String(err);
}

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
    if (insertError) {
      console.error('Account insert failed during restock', { categoryId, insertError });
      throw insertError;
    }
  } catch (err) {
    const isBalanceError = err instanceof EmonBestLogError && err.status === 402;
    const message = extractErrorMessage(err);

    await supabaseAdmin.from('restock_warnings').insert({
      category_id: categoryId,
      reason: isBalanceError ? 'low_emonbestlog_balance' : 'restock_failed',
      detail: message,
    });

    console.error('Auto-restock failed', { categoryId, error: err, extractedMessage: message });
  }
}
