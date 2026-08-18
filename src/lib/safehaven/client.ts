// Safe Haven MFB API client — stub until real API keys + confirmed
// request/response format are available.
//
// Once you have sandbox keys, add these to Vercel:
//   SAFE_HAVEN_CLIENT_ID
//   SAFE_HAVEN_CLIENT_SECRET
//   SAFE_HAVEN_BASE_URL (optional, defaults to sandbox below)

const SAFE_HAVEN_BASE_URL =
  process.env.SAFE_HAVEN_BASE_URL ?? 'https://api.sandbox.safehavenmfb.com';
const SAFE_HAVEN_CLIENT_ID = process.env.SAFE_HAVEN_CLIENT_ID;
const SAFE_HAVEN_CLIENT_SECRET = process.env.SAFE_HAVEN_CLIENT_SECRET;

export function isSafeHavenConfigured() {
  return Boolean(SAFE_HAVEN_CLIENT_ID && SAFE_HAVEN_CLIENT_SECRET);
}

// Placeholder — real implementation needs the confirmed request/response
// shape from safehavenmfb.readme.io/reference/create-virtual-account
export async function createVirtualAccount(_params: {
  profileId: string;
  accountName: string;
}): Promise<{ accountNumber: string }> {
  if (!isSafeHavenConfigured()) {
    throw new Error('Safe Haven API keys are not configured yet');
  }
  throw new Error('createVirtualAccount() is not implemented yet — pending real API docs.');
}
