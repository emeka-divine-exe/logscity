const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Paystack verify failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data as {
    status: string;
    amount: number;
    reference: string;
    customer: { email: string };
  };
}
