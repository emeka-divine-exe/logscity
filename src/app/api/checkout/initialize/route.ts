import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { categoryId, accountIds, quantity } = body;

    // Fetch real price from DB — never trust client-sent price
    const { data: category, error: categoryError } = await supabaseAdmin
      .from('categories')
      .select('id, name, price, requires_selection')
      .eq('id', categoryId)
      .single();

    if (categoryError || !category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Validate selection or quantity
    if (category.requires_selection) {
      if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
        return NextResponse.json({ error: 'No accounts selected' }, { status: 400 });
      }
    } else {
      if (!quantity || quantity < 1) {
        return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
      }
    }

    const count = category.requires_selection ? accountIds.length : quantity;
    const totalAmount = Number(category.price) * count;
    const reference = `logscity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Fetch profile using auth_user_id — get profiles.id (not auth user id)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Create pending order using profiles.id as profile_id
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        profile_id: profile.id, // profiles.id — NOT user.id
        total_amount: totalAmount,
        payment_reference: reference,
        payment_status: 'pending',
        metadata: {
          categoryId,
          accountIds: category.requires_selection ? accountIds : null,
          quantity: category.requires_selection ? null : quantity,
          priceEach: Number(category.price),
        },
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('Order insert error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json({
      reference,
      amount: totalAmount * 100, // Paystack expects kobo
      email: profile.email ?? user.email,
      orderId: order.id,
    });

  } catch (error) {
    console.error('Initialize error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
