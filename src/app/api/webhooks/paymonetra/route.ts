import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface WebhookBody {
  id?: string;
  event?: string;
  data?: {
    id?: string;
    reference?: string;
    customer_reference?: string;
    amount?: string | number;
  };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const signature = req.headers.get('x-paymonetra-signature') ?? '';
  const expected = crypto
    .createHmac('sha512', process.env.PM_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex');

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body: WebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });
  }

  // TEMPORARY: remove after testing (contains payer details)
  console.log('Paymonetra webhook:', rawBody);

  if (body.event !== 'collection.success') {
    return NextResponse.json({ received: true });
  }

  const ref = body.data?.customer_reference;
  const amount = Number(body.data?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ received: true });
  }

  const { data: profile } =
    ref && UUID.test(ref)
      ? await supabaseAdmin.from('profiles').select('id').eq('id', ref).maybeSingle()
      : { data: null };

  if (!profile) {
    await supabaseAdmin.from('unmatched_sms_payments').insert({ amount, raw_sms: rawBody });
    return NextResponse.json({ received: true, credited: false });
  }

  const eventId =
    body.id ??
    body.data?.id ??
    body.data?.reference ??
    crypto.createHash('sha256').update(rawBody).digest('hex');

  const { error } = await supabaseAdmin.rpc('credit_wallet', {
    p_profile_id: profile.id,
    p_amount: amount,
    p_reference: `pm-${eventId}`,
  });

  if (error) {
    console.error('credit_wallet failed', error);
    return NextResponse.json({ error: 'Credit failed' }, { status: 500 }); // Paymonetra retries
  }

  return NextResponse.json({ received: true, credited: true });
                       }
