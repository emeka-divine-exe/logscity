import 'server-only';

const BASE = 'https://api.paymonetra.com/v1';

export interface CustomerAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
}

interface RawAccount {
  account_number?: string | number;
  account_name?: string;
  bank?: string;
  bank_name?: string;
}

function pm(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.PM_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  });
}

function parse(d: RawAccount): CustomerAccount {
  return {
    accountNumber: String(d.account_number),
    accountName: d.account_name ?? '',
    bankName: d.bank ?? d.bank_name ?? 'Payrep MFB',
  };
}

export async function getOrCreateCustomerAccount(reference: string, name: string) {
  const existing = await pm(`/customer_accounts/${reference}`);
  if (existing.ok) {
    const d = (await existing.json()) as RawAccount;
    if (d.account_number) return parse(d);
  }

  const res = await pm('/customer_accounts', {
    method: 'POST',
    body: JSON.stringify({ customer_reference: reference, customer_name: name }),
  });
  if (!res.ok) {
    throw new Error(`Paymonetra create account failed (${res.status}): ${await res.text()}`);
  }
  const d = (await res.json()) as RawAccount;
  if (!d.account_number) throw new Error('Paymonetra returned no account number');
  return parse(d);
}
