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

    // Generate unique reference
    const reference = `logscity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Get user profile for email
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('auth_user_id', user.id)
      .single();

    // Create pending order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        profile_id: profile?.auth_user_id ?? user.id,
        total_amount: totalAmount,
        payment_reference: reference,
        payment_status: 'pending',
      })
      .select('id')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Store selection context in order for verify step
    // We store this temporarily in a lightweight way — the verify route reads it back
    await supabaseAdmin
      .from('orders')
      .update({
        // Store as JSON in a temp field — we'll use a metadata approach
      })
      .eq('id', order.id);

    return NextResponse.json({
      reference,
      amount: totalAmount * 100, // Paystack expects kobo
      email: profile?.email ?? user.email,
      orderId: order.id,
      categoryId,
      accountIds: category.requires_selection ? accountIds : null,
      quantity: category.requires_selection ? null : quantity,
    });

  } catch (error) {
    console.error('Initialize error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
           }
