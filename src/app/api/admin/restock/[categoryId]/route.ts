import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { maybeAutoRestock } from '@/lib/emonbestlog/autoRestock';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { categoryId } = await params;

  const beforeCount = await supabaseAdmin
    .from('accounts')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .eq('status', 'available');

  await maybeAutoRestock(categoryId);

  const afterCount = await supabaseAdmin
    .from('accounts')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .eq('status', 'available');

  const gained = (afterCount.count ?? 0) - (beforeCount.count ?? 0);

  if (gained > 0) {
    return NextResponse.json({ success: true, added: gained });
  }

  return NextResponse.json({ success: false, added: 0 });
}
