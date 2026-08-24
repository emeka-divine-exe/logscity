import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

const API_SECRET = process.env.PAYVESSEL_API_SECRET!;

function isValidSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expectedHash = crypto
    .createHmac('sha512', API_SECRET)
    .update(rawBody)
    .digest('hex');
  return expectedHash === signature;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('payvessel-http-signature');

  if (!isValidSignature(rawBody, signature)) {
    console.error('PayVessel webhook: invalid signature — rejected');
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);

  // Log the full payload on every call, for now, so we can confirm the real
  // shape against a live sandbox transfer before trusting any field blindly.
  console.log('PayVessel webhook payload:', JSON.stringify(payload));

  const amount = Number(payload?.order?.amount);
  const reference = payload?.transaction?.reference;

  // The exact field that names WHICH customer's account got paid isn't
  // confirmed yet from docs alone — trying the most likely candidates.
  // We'll lock this down after seeing one real payload in the logs above.
  const trackingReference =
    payload?.account?.trackingReference ??
    payload?.virtual_account?.trackingReference ??
    payload?.order?.trackingReference ??
    payload?.trackingReference;

  if (!amount || !reference || !trackingReference) {
    console.error('PayVessel webhook: missing expected fields', { payload });
    // Still 200 — PayVessel retries on non-200, and retrying won't fix a
    // payload shape we don't recognize. We handle this manually instead.
    return NextResponse.json({ message: 'Received, but could not process' }, { status: 200 });
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('payvessel_tracking_reference', trackingReference)
    .single();

  if (!profile) {
    console.error('PayVessel webhook: no matching profile', { trackingReference });
    return NextResponse.json({ message: 'Received, no matching account' }, { status: 200 });
  }

  const { error } = await supabaseAdmin.rpc('credit_wallet', {
    p_profile_id: profile.id,
    p_amount: amount,
    p_reference: reference,
  });

  if (error) {
    console.error('PayVessel webhook: credit_wallet failed', { error, profile, amount, reference });
    return NextResponse.json({ message: 'Failed to credit wallet' }, { status: 500 });
  }

  return NextResponse.json({ message: 'success' }, { status: 200 });
                  }
