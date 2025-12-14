import { useMemo } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickTodoWidget } from '@/components/dashboard/QuickTodoWidget';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { useTransactions, useBudgets, useTodos, useCategories, useSettings } from '@/hooks/useStore';
import { formatCurrency } from '@/lib/data';

export default function Dashboard() {
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { todos, toggleTodo } = useTodos();
  const { categories } = useCategories();
  const { currency, initialBalance } = useSettings();

  const summary = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthlyTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = initialBalance + totalIncome - totalExpense;

    const currentMonthBudgets = budgets.filter((b) => b.month === currentMonth);
    const totalBudget = currentMonthBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = currentMonthBudgets.reduce((sum, b) => sum + b.spent, 0);
    const budgetRemaining = totalBudget - totalSpent;

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      budgetRemaining,
      totalBudget,
    };
  }, [transactions, budgets, initialBalance]);

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
        <SpendingChart transactions={transactions} currency={currency} />
        <CategoryChart transactions={transactions} categories={categories} currency={currency} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickTodoWidget todos={todos} onToggle={toggleTodo} />
        <RecentTransactions
          transactions={transactions}
          categories={categories}
          currency={currency}
        />
      </div>
    </div>
  );
}
