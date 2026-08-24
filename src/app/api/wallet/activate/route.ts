import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createReservedAccount, PayvesselError } from '@/lib/payvessel/client';

function isElevenDigits(value: string) {
  return /^\d{11}$/.test(value);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { idType, idValue, phoneNumber } = await req.json();

  if (idType !== 'bvn' && idType !== 'nin') {
    return NextResponse.json({ error: 'idType must be "bvn" or "nin"' }, { status: 400 });
  }
  if (!isElevenDigits(idValue)) {
    return NextResponse.json(
      { error: `${idType.toUpperCase()} must be exactly 11 digits` },
      { status: 400 }
    );
  }
  if (!phoneNumber || !/^0\d{10}$/.test(phoneNumber)) {
    return NextResponse.json(
      { error: 'Enter a valid 11-digit Nigerian phone number' },
      { status: 400 }
    );
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, virtual_account_number')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }
  if (profile.virtual_account_number) {
    return NextResponse.json({ error: 'Wallet already activated' }, { status: 409 });
  }

  try {
    const account = await createReservedAccount({
      email: user.email!, // profiles has no email column — pulled from auth.users
      name: profile.full_name,
      phoneNumber,
      idType,
      idValue, // used only for this call — never persisted, never logged below
    });

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        virtual_account_number: account.accountNumber,
        bank_name: account.bankName,
        account_name: account.accountName,
        payvessel_tracking_reference: account.trackingReference,
        wallet_status: 'active',
      })
      .eq('id', profile.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      accountName: account.accountName,
    });
  } catch (err) {
    // Deliberately never logs idValue, idType, or phoneNumber here.
    console.error('Wallet activation failed', {
      profileId: profile.id,
      message: err instanceof Error ? err.message : 'unknown error',
      status: err instanceof PayvesselError ? err.status : undefined,
    });

    await supabaseAdmin
      .from('profiles')
      .update({ wallet_status: 'failed' })
      .eq('id', profile.id);

    return NextResponse.json(
      { error: 'We could not activate your wallet right now. Please try again in a moment.' },
      { status: 502 }
    );
  }
      }
