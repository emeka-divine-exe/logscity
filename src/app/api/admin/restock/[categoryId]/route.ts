import { NextRequest, NextResponse } from 'next/server';
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
  const result = await maybeAutoRestock(categoryId, { force: true });

  return NextResponse.json({
    success: result.ok,
    added: result.added,
    reason: result.reason ?? null,
  });
}
