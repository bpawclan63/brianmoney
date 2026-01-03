import { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionList } from '@/components/transactions/TransactionList';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { useDbTransactions, useDbCategories, useDbProfile } from '@/hooks/useSupabaseStore';
import { formatCurrency } from '@/lib/data';
import { StatCard } from '@/components/dashboard/StatCard';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Transactions() {
  const { t } = useLanguage();
  const { transactions, loading: loadingTx, addTransaction, deleteTransaction } = useDbTransactions();
  const { categories, loading: loadingCat } = useDbCategories();
  const { profile } = useDbProfile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const currency = profile?.currency || 'IDR';
  const loading = loadingTx || loadingCat;

  // Transform categories for the dialog
  const transformedCategories = useMemo(() => {
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      type: c.type as 'income' | 'expense' | 'both',
    }));
  }, [categories]);

  // Transform transactions for the list
  const transformedTransactions = useMemo(() => {
    return transactions.map((t) => ({
      id: t.id,
      date: t.date,
      type: t.type,
      categoryId: t.category_id || '',
      amount: t.amount,
      note: t.note || '',
      paymentMethod: t.payment_method,
      tags: t.tags || [],
      createdAt: t.created_at,
    }));
  }, [transactions]);

  const handleAddTransaction = async (data: {
    type: 'income' | 'expense';
    categoryId: string;
    amount: number;
    note: string;
    date: string;
    paymentMethod: 'cash' | 'bank' | 'e-wallet';
  }) => {
    await addTransaction({
      type: data.type,
      category_id: data.categoryId || null,
      amount: data.amount,
      note: data.note || null,
      date: data.date,
      payment_method: data.paymentMethod,
      tags: null,
      recurring_id: null,
    });
    setIsDialogOpen(false);
  };

  const summary = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthlyTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));

    return {
      total: monthlyTransactions.length,
      income: monthlyTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
      expense: monthlyTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    };
  }, [transactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('transactions', 'title')}</h1>
          <p className="text-muted-foreground">{t('transactions', 'subtitle')}</p>
        </div>
        <Button variant="neon" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          {t('transactions', 'addTransaction')}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={t('transactions', 'thisMonthTransactions')}
          value={summary.total.toString()}
          icon={ArrowLeftRight}
          variant="default"
          delay={0}
        />
        <StatCard
          title={t('transactions', 'totalIncome')}
          value={formatCurrency(summary.income, currency)}
          icon={TrendingUp}
          variant="income"
          delay={100}
        />
        <StatCard
          title={t('transactions', 'totalExpense')}
          value={formatCurrency(summary.expense, currency)}
          icon={TrendingDown}
          variant="expense"
          delay={200}
        />
      </div>

      {/* Transaction List */}
      <TransactionList
        transactions={transformedTransactions}
        categories={transformedCategories}
        currency={currency}
        onDelete={deleteTransaction}
      />

      {/* Add Dialog */}
      <AddTransactionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={handleAddTransaction}
        categories={transformedCategories}
      />
    </div>
  );
}
