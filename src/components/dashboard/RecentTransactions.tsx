import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Transaction, Category } from '@/types';
import { formatCurrency, formatDateShort } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
}

export function RecentTransactions({ transactions, categories, currency }: RecentTransactionsProps) {
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getCategory = (categoryId: string) =>
    categories.find((c) => c.id === categoryId);

  return (
    <div className="glass-card p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Recent Transactions</h3>
        <Link to="/transactions">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {recentTransactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentTransactions.map((transaction) => {
            const category = getCategory(transaction.categoryId);
            return (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                    transaction.type === 'income'
                      ? 'bg-emerald-500/20'
                      : 'bg-red-500/20'
                  )}
                >
                  {category?.icon || (transaction.type === 'income' ? '💰' : '💸')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {category?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {transaction.note || formatDateShort(transaction.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      'text-sm font-semibold flex items-center gap-1',
                      transaction.type === 'income'
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    )}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {formatCurrency(transaction.amount, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateShort(transaction.date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
