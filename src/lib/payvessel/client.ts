import 'server-only';

const PAYVESSEL_BASE_URL =
  process.env.PAYVESSEL_TEST_MODE === 'true'
    ? 'https://sandbox.payvessel.com'
    : 'https://api.payvessel.com';

const BUSINESS_ID = process.env.PAYVESSEL_BUSINESS_ID!;
const API_KEY = process.env.PAYVESSEL_API_KEY!;
const API_SECRET = process.env.PAYVESSEL_API_SECRET!;

// 9PSB only — matches LogsCity's confirmed provider decision.
const BANK_CODE_9PSB = '120001';

interface CreateReservedAccountParams {
  email: string;
  name: string;
  phoneNumber: string;
  idType: 'bvn' | 'nin';
  idValue: string;
}

interface PayvesselBankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  account_type: string;
  expire_date: string;
  trackingReference: string;
}

interface PayvesselResponse {
  status: boolean;
  service: string;
  business: string;
  banks: PayvesselBankAccount[];
  message?: string;
}

export class PayvesselError extends Error {
  constructor(message: string, public status?: number, public raw?: unknown) {
    super(message);
    this.name = 'PayvesselError';
  }
}

export async function createReservedAccount(
  params: CreateReservedAccountParams
): Promise<PayvesselBankAccount> {
  // PayVessel's docs declare bvn/nin as type "number" — sending them as
  // strings ("073...") is a documented cause of 400 responses.
  const idValueAsNumber = Number(params.idValue);

  const body: Record<string, unknown> = {
    email: params.email,
    name: params.name,
    phoneNumber: params.phoneNumber,
    bankcode: [BANK_CODE_9PSB],
    account_type: 'STATIC',
    businessid: BUSINESS_ID,
  };

  body[params.idType] = idValueAsNumber;

  const response = await fetch(
    `${PAYVESSEL_BASE_URL}/pms/api/external/request/customerReservedAccount/`,
    {
      method: 'POST',
      headers: {
        'api-key': API_KEY,
        'api-secret': `Bearer ${API_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  const rawText = await response.text();
  let data: PayvesselResponse | null = null;
  try {
    data = JSON.parse(rawText);
  } catch {
    // response wasn't JSON — rawText itself becomes the error detail below
  }

  if (!response.ok || !data?.status) {
    throw new PayvesselError(
      data?.message ?? `PayVessel account creation failed (HTTP ${response.status})`,
      response.status,
      data ?? rawText
    );
  }

  const account = data.banks?.[0];
  if (!account) {
    throw new PayvesselError('PayVessel returned no account details', response.status, data);
  }

  return account;
}
