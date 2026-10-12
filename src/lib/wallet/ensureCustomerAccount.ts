import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getOrCreateCustomerAccount } from '@/lib/paymonetra';
import type { CustomerAccount } from '@/lib/paymonetra';

interface ProfileRow {
  id: string;
  full_name: string;
  pm_account_number: string | null;
  pm_account_name: string | null;
  pm_bank_name: string | null;
}

export async function ensureCustomerAccount(profile: ProfileRow): Promise<CustomerAccount> {
  if (profile.pm_account_number) {
    return {
      accountNumber: profile.pm_account_number,
      accountName: profile.pm_account_name ?? '',
      bankName: profile.pm_bank_name ?? '',
    };
  }

  const acct = await getOrCreateCustomerAccount(profile.id, profile.full_name);

  await supabaseAdmin
    .from('profiles')
    .update({
      pm_account_number: acct.accountNumber,
      pm_account_name: acct.accountName,
      pm_bank_name: acct.bankName,
    })
    .eq('id', profile.id);

  return acct;
}
