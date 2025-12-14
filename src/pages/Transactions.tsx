import { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionList } from '@/components/transactions/TransactionList';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { useTransactions, useCategories, useSettings, useBudgets } from '@/hooks/useStore';
import { formatCurrency } from '@/lib/data';
import { StatCard } from '@/components/dashboard/StatCard';

export default function Transactions() {
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const { budgets, updateBudget } = useBudgets();
  const { categories } = useCategories();
  const { currency } = useSettings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddTransaction = (data: Parameters<typeof addTransaction>[0]) => {
    addTransaction(data);
    
    // Update budget spent if expense
    if (data.type === 'expense') {
      const currentMonth = new Date().toISOString().substring(0, 7);
      const budget = budgets.find(
        (b) => b.categoryId === data.categoryId && b.month === currentMonth
      );
      if (budget) {
        updateBudget(budget.id, { spent: budget.spent + data.amount });
      }
    }
  };

  const summary = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthlyTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));

    return {
      total: monthlyTransactions.length,
      income: monthlyTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: monthlyTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">Track your income and expenses</p>
        </div>
        <Button variant="neon" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Transaction
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="This Month Transactions"
          value={summary.total.toString()}
          icon={ArrowLeftRight}
          variant="default"
          delay={0}
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(summary.income, currency)}
          icon={TrendingUp}
          variant="income"
          delay={100}
        />
        <StatCard
          title="Total Expense"
          value={formatCurrency(summary.expense, currency)}
          icon={TrendingDown}
          variant="expense"
          delay={200}
        />
      </div>

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        categories={categories}
        currency={currency}
        onDelete={deleteTransaction}
      />

      {/* Add Dialog */}
      <AddTransactionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={handleAddTransaction}
        categories={categories}
      />
    </div>
  );
}
