import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, platform, description, price, featured, requires_selection } = body;

  const { data, error } = await supabaseAdmin
    .from('categories')
    .update({
      ...(name !== undefined && { name }),
      ...(platform !== undefined && { platform }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(featured !== undefined && { featured }),
      ...(requires_selection !== undefined && { requires_selection }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }

  return NextResponse.json({ category: data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);

  if (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
                                                                       }
