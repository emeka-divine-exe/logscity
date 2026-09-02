import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { fulfillOrder } from '@/lib/orders/fulfillOrder';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { categoryId, accountIds, quantity } = await req.json();

  const { data: category, error: categoryError } = await supabaseAdmin
    .from('categories')
    .select('id, name, price, requires_selection')
    .eq('id', categoryId)
    .single();

  if (categoryError || !category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

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
  const priceEach = Number(category.price);
  const totalAmount = priceEach * count;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, balance')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  if (Number(profile.balance) < totalAmount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 });
  }

  const reference = `logscity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      profile_id: profile.id,
      total_amount: totalAmount,
      payment_reference: reference,
      payment_status: 'pending',
      metadata: {
        categoryId,
        categoryName: category.name,
        accountIds: category.requires_selection ? accountIds : null,
        quantity: category.requires_selection ? null : quantity,
        priceEach,
      },
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('Order insert error:', orderError);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }

  const { error: deductError } = await supabaseAdmin.rpc('deduct_wallet', {
    p_profile_id: profile.id,
    p_amount: totalAmount,
    p_order_id: order.id,
  });

  if (deductError) {
    console.error('Wallet deduction failed:', deductError);
    await supabaseAdmin.from('orders').update({ payment_status: 'failed' }).eq('id', order.id);
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 });
  }

  try {
    await fulfillOrder({
      orderId: order.id,
      categoryId,
      accountIds: category.requires_selection ? accountIds : null,
      quantity: category.requires_selection ? null : quantity,
      priceEach,
    });
  } catch (err) {
    console.error('Fulfillment failed after wallet deduction, refunding:', err);

    await supabaseAdmin.rpc('credit_wallet', {
      p_profile_id: profile.id,
      p_amount: totalAmount,
      p_reference: `refund-${order.id}`,
    });

    await supabaseAdmin.from('orders').update({ payment_status: 'failed' }).eq('id', order.id);

    return NextResponse.json(
      { error: 'That item just sold out — you have been refunded automatically.' },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true, orderId: order.id });
    }
