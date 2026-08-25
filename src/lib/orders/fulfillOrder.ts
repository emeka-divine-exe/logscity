import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { maybeAutoRestock } from '@/lib/emonbestlog/autoRestock';

interface FulfillOrderParams {
  orderId: string;
  categoryId: string;
  accountIds: string[] | null;
  quantity: number | null;
  priceEach: number;
}

// The single place stock actually gets claimed and restock gets checked —
// called by WhatsApp-manual checkout today, and by wallet-instant checkout
// once Track A ships. Neither path needs its own restock logic.
export async function fulfillOrder({
  orderId,
  categoryId,
  accountIds,
  quantity,
  priceEach,
}: FulfillOrderParams) {
  if (accountIds) {
    const { error } = await supabaseAdmin.rpc('claim_accounts', {
      p_account_ids: accountIds,
      p_order_id: orderId,
      p_price_each: priceEach,
    });
    if (error) throw error;
  } else {
    const { error } = await supabaseAdmin.rpc('claim_accounts_by_quantity', {
      p_category_id: categoryId,
      p_quantity: quantity,
      p_order_id: orderId,
      p_price_each: priceEach,
    });
    if (error) throw error;
  }

  await supabaseAdmin.from('orders').update({ payment_status: 'success' }).eq('id', orderId);

  maybeAutoRestock(categoryId).catch((err) =>
    console.error('maybeAutoRestock threw unexpectedly', err)
  );
}
