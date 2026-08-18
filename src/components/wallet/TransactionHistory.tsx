import { EmptyState } from '@/components/ui';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  created_at: string;
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
        return (
          <div
            key={tx.id}
            className="flex items-center justify-between rounded-xl border border-white/10 p-3"
          >
            <div>
              <p className="text-sm capitalize text-white">{tx.type}</p>
              <p className="text-xs text-neutral">{new Date(tx.created_at).toLocaleDateString()}</p>
            </div>
            <p className={`text-sm font-semibold ${isCredit ? 'text-green-400' : 'text-white'}`}>
              {isCredit ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}
