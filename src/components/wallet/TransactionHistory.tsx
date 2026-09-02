import { EmptyState } from '@/components/ui';
import { buildWhatsAppChatLink } from '@/lib/constants/whatsapp';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance_after: number | null;
  created_at: string;
  status: 'pending' | 'completed' | 'rejected';
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="lucide:receipt"
        title="No transactions yet"
        description="Your top-ups and purchases will show up here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {transactions.map((tx) => {
        const isCredit = tx.type === 'topup';
        const isPending = tx.status === 'pending';
        const isRejected = tx.status === 'rejected';

        return (
          <div key={tx.id} className="rounded-xl border border-white/10 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm capitalize text-white">{tx.type}</p>
                <p className="text-xs text-neutral">
                  {new Date(tx.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    isRejected
                      ? 'text-red-400 line-through'
                      : isPending
                        ? 'text-amber-400'
                        : isCredit
                          ? 'text-green-400'
                          : 'text-white'
                  }`}
                >
                  {isCredit ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                </p>
                {isPending && <p className="text-xs text-amber-400">Pending</p>}
                {isRejected && <p className="text-xs text-red-400">Rejected</p>}
              </div>
            </div>

            {isRejected && (
              <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-xs text-neutral">
                  The money you sent was rejected. Please confirm if you&apos;ve made the
                  payment. If you have, contact LogsCity and send your receipt to get an
                  automatic top-up.
                </p>
                <a
                  href={buildWhatsAppChatLink(
                    `Hi, my top-up of ₦${Number(tx.amount).toLocaleString()} was rejected but I did send the payment. Here's my receipt:`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-primary"
                >
                  Contact LogsCity on WhatsApp →
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
