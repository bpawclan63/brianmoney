import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Trash2, Search, Filter } from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Transaction, Category, TransactionType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getEmojiForCategory, iconToEmoji } from '@/lib/categoryEmojis';
import { useLanguage } from '@/contexts/LanguageContext';
 
interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, categories, currency, onDelete }: TransactionListProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const getCategory = (categoryId: string) =>
    categories.find((c) => c.id === categoryId);

  const filteredTransactions = transactions
    .filter((t) => {
      const category = getCategory(t.categoryId);
      const matchesSearch =
        category?.name.toLowerCase().includes(search.toLowerCase()) ||
        t.note?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || t.categoryId === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groupedByDate = filteredTransactions.reduce((acc, transaction) => {
    const date = transaction.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('transactions', 'searchTransactions')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'all')}
              className="h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">{t('transactions', 'allTypes')}</option>
              <option value="income">{t('transactions', 'income')}</option>
              <option value="expense">{t('transactions', 'expense')}</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">{t('transactions', 'allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {(iconToEmoji[cat.icon] || '✨')} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Filter className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">{t('transactions', 'noTransactions')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, dayTransactions]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground px-2">
                {formatDate(date)}
              </h3>
              <div className="glass-card divide-y divide-border/50">
                {dayTransactions.map((transaction) => {
                  const category = getCategory(transaction.categoryId);
                  // Get emoji from category icon or name
                  const emoji = category?.icon
                    ? (iconToEmoji[category.icon] || getEmojiForCategory(category.name))
                    : '💸';
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group"
                    >
                      <div
                        className={cn(
                          'w-12 h-12 rounded-2xl flex items-center justify-center text-xl',
                          transaction.type === 'income'
                            ? 'bg-emerald-500/20'
                            : 'bg-rose-500/20'
                        )}
                      >
                        {category?.icon ? (
                          <CategoryIcon iconName={category.icon} className="w-6 h-6" />
                        ) : (
                          emoji
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">
                          {category?.name || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground capitalize px-2 py-0.5 bg-muted/50 rounded">
                            {transaction.paymentMethod}
                          </span>
                          {transaction.note && (
                            <span className="text-xs text-muted-foreground truncate">
                              {transaction.note}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p
                            className={cn(
                              'font-semibold flex items-center gap-1',
                              transaction.type === 'income'
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            )}
                          >
                            {transaction.type === 'income' ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                            {formatCurrency(transaction.amount, currency)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(transaction.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
