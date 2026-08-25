import 'server-only';

const BASE_URL = 'https://www.emonbestlog.com/api/v1';
const API_KEY = process.env.EMONBESTLOG_API_KEY!;

interface BuyResponse {
  order_id: number;
  product: string;
  quantity: number;
  charge: string;
  keys: string[];
}

interface BalanceResponse {
  balance: string;
  currency: string;
}

interface EmonError {
  error: string;
  detail: string;
}

export class EmonBestLogError extends Error {
  constructor(message: string, public code?: string, public status?: number) {
    super(message);
    this.name = 'EmonBestLogError';
  }
}

async function emonRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as EmonError | null;
    throw new EmonBestLogError(
      errorBody?.detail ?? `EmonBestLog request failed (HTTP ${response.status})`,
      errorBody?.error,
      response.status
    );
  }

  return response.json() as Promise<T>;
}

export async function getEmonBestLogBalance(): Promise<number> {
  const data = await emonRequest<BalanceResponse>('/balance');
  return Number(data.balance);
}

export async function buyFromEmonBestLog(
  productId: number,
  quantity: number
): Promise<BuyResponse> {
  return emonRequest<BuyResponse>('/buy', {
    method: 'POST',
    body: JSON.stringify({ product: productId, quantity }),
  });
}
