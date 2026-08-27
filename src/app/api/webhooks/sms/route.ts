import { NextRequest, NextResponse } from 'next/server';
import { creditWalletByExactAmount } from '@/lib/wallet/creditByExactAmount';

const SMS_WEBHOOK_SECRET = process.env.SMS_WEBHOOK_SECRET!;

// Matches OPay's real credit alert format:
// "CREDIT ALERT\nAcc:816****907\nAmt:NGN500.00\nBal:NGN500.91\nDate:..."
function extractAmount(smsText: string): number | null {
  const match = smsText.match(/Amt:NGN([\d,]+\.\d{2})/i);
  if (!match) return null;
  return Number(match[1].replace(/,/g, ''));
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-sms-secret');
  if (secret !== SMS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const smsText: string = body.message ?? body.text ?? '';

  const amount = extractAmount(smsText);
  if (!amount) {
    console.error('Could not parse amount from SMS', { smsText });
    return NextResponse.json({ received: true, matched: false });
  }

  const result = await creditWalletByExactAmount(amount, smsText);
  return NextResponse.json({ received: true, matched: result.success });
}
