import { useMemo } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickTodoWidget } from '@/components/dashboard/QuickTodoWidget';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { useDbTransactions, useDbBudgets, useDbTodos, useDbCategories, useDbProfile } from '@/hooks/useSupabaseStore';
import { formatCurrency } from '@/lib/data';

export default function Dashboard() {
  const { transactions, loading: loadingTransactions } = useDbTransactions();
  const { budgets, loading: loadingBudgets } = useDbBudgets();
  const { todos, toggleTodo, loading: loadingTodos } = useDbTodos();
  const { categories, loading: loadingCategories } = useDbCategories();
  const { profile, loading: loadingProfile } = useDbProfile();

  const currency = profile?.currency || 'IDR';
  const initialBalance = profile?.initial_balance || 0;

  const loading = loadingTransactions || loadingBudgets || loadingTodos || loadingCategories || loadingProfile;

  // Transform db data to match component expectations
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

  const transformedCategories = useMemo(() => {
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      type: c.type as 'income' | 'expense' | 'both',
    }));
  }, [categories]);

  const transformedTodos = useMemo(() => {
    return todos.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || undefined,
      dueDate: t.due_date || undefined,
      priority: t.priority,
      status: t.status,
      createdAt: t.created_at,
      completedAt: t.completed_at || undefined,
    }));
  }, [todos]);

  const summary = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthlyTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyExpense = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalBalance = Number(initialBalance) + totalIncome - totalExpense;

    const currentMonthBudgets = budgets.filter((b) => b.month === currentMonth);
    const totalBudget = currentMonthBudgets.reduce((sum, b) => sum + Number(b.amount), 0);
    
    // Calculate actual spent from transactions
    const totalSpent = monthlyExpense;
    const budgetRemaining = totalBudget - totalSpent;

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      budgetRemaining,
      totalBudget,
    };
  }, [transactions, budgets, initialBalance]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(summary.totalBalance, currency)}
          icon={Wallet}
          variant="default"
          delay={0}
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(summary.monthlyIncome, currency)}
          icon={TrendingUp}
          variant="income"
          delay={100}
        />
        <StatCard
          title="Monthly Expense"
          value={formatCurrency(summary.monthlyExpense, currency)}
          icon={TrendingDown}
          variant="expense"
          delay={200}
        />
        <StatCard
          title="Budget Remaining"
          value={formatCurrency(summary.budgetRemaining, currency)}
          subtitle={`of ${formatCurrency(summary.totalBudget, currency)}`}
          icon={PiggyBank}
          variant="budget"
          delay={300}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart transactions={transformedTransactions} currency={currency} />
        <CategoryChart transactions={transformedTransactions} categories={transformedCategories} currency={currency} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickTodoWidget todos={transformedTodos} onToggle={toggleTodo} />
        <RecentTransactions
          transactions={transformedTransactions}
          categories={transformedCategories}
          currency={currency}
        />
      </div>
    </div>
  );
}
