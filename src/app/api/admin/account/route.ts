import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { buildProfileUrl } from '@/lib/helpers/profileUrl';

function generateSlug(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const categoryId = req.nextUrl.searchParams.get('category_id');
  if (!categoryId) {
    return NextResponse.json({ error: 'category_id is required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('accounts')
    .select('id, profile_url, username, email, status, created_at')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to load accounts' }, { status: 500 });
  }

  return NextResponse.json({ accounts: data });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { profile_url, username, email, password, two_fa_key, gmail_password, newCategory } = body;
  let { category_id } = body;
  let platform: string | null = null;

  if (newCategory) {
    if (!newCategory.name || !newCategory.platform || !newCategory.price) {
      return NextResponse.json({ error: 'New category needs a name, platform, and price' }, { status: 400 });
    }

    const { data: createdCategory, error: categoryError } = await supabaseAdmin
      .from('categories')
      .insert({
        name: newCategory.name,
        platform: newCategory.platform,
        slug: generateSlug(newCategory.name),
        description: newCategory.description ?? '',
        price: Number(newCategory.price),
        featured: false,
        requires_selection: newCategory.requires_selection ?? true,
      })
      .select('id, platform')
      .single();

    if (categoryError || !createdCategory) {
      return NextResponse.json({ error: 'Failed to create new category' }, { status: 500 });
    }

    category_id = createdCategory.id;
    platform = createdCategory.platform;
  }

  if (!category_id) {
    return NextResponse.json({ error: 'category_id is required' }, { status: 400 });
  }

  // Fetch the category's platform if we don't already have it (existing category path)
  if (!platform) {
    const { data: category } = await supabaseAdmin
      .from('categories')
      .select('platform')
      .eq('id', category_id)
      .single();
    platform = category?.platform ?? null;
  }

  // Auto-build the profile URL from platform + username unless one was explicitly given
  const finalProfileUrl = profile_url || (platform ? buildProfileUrl(platform, username) : null);

  const { data, error } = await supabaseAdmin
    .from('accounts')
    .insert({
      category_id,
      profile_url: finalProfileUrl,
      username: username || null,
      email: email || null,
      password: password || null,
      two_fa_key: two_fa_key || null,
      gmail_password: gmail_password || null,
      status: 'available',
    })
    .select()
    .single();

  if (error) {
    console.error('Create account error:', error);
    return NextResponse.json({ error: 'Failed to add account' }, { status: 500 });
  }

  return NextResponse.json({ account: data });
         }
