import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useDbTransactions, useDbBudgets, useDbCategories, useDbProfile } from '@/hooks/useSupabaseStore';
import { formatCurrency } from '@/lib/data';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = [
  'hsl(186 100% 50%)',
  'hsl(270 60% 60%)',
  'hsl(142 76% 46%)',
  'hsl(38 92% 50%)',
  'hsl(0 72% 51%)',
  'hsl(217 91% 60%)',
];

export default function Analytics() {
  const { transactions, loading: loadingTx } = useDbTransactions();
  const { budgets, loading: loadingBudgets } = useDbBudgets();
  const { categories, loading: loadingCat } = useDbCategories();
  const { profile } = useDbProfile();

  const currency = profile?.currency || 'IDR';
  const loading = loadingTx || loadingBudgets || loadingCat;

  const currentMonth = new Date().toISOString().substring(0, 7);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const months: Record<string, { income: number; expense: number; savings: number }> = {};

    transactions.forEach((t) => {
      const month = t.date.substring(0, 7);
      if (!months[month]) {
        months[month] = { income: 0, expense: 0, savings: 0 };
      }
      if (t.type === 'income') {
        months[month].income += Number(t.amount);
      } else {
        months[month].expense += Number(t.amount);
      }
    });

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('id-ID', { month: 'short' }),
        income: data.income,
        expense: data.expense,
        savings: data.income - data.expense,
      }));
  }, [transactions]);

  // Budget vs Actual
  const budgetVsActual = useMemo(() => {
    const monthlyExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.date.startsWith(currentMonth)
    );

    const currentBudgets = budgets.filter((b) => b.month === currentMonth);

    return currentBudgets.map((budget) => {
      const category = categories.find((c) => c.id === budget.category_id);
      const actual = monthlyExpenses
        .filter((t) => t.category_id === budget.category_id)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        name: category?.name || 'Unknown',
        budget: Number(budget.amount),
        actual,
        icon: category?.icon || '📊',
      };
    });
  }, [budgets, transactions, categories, currentMonth]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const monthlyExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.date.startsWith(currentMonth)
    );

    const categoryTotals: Record<string, number> = {};
    monthlyExpenses.forEach((t) => {
      const catId = t.category_id || 'other';
      categoryTotals[catId] = (categoryTotals[catId] || 0) + Number(t.amount);
    });

    return Object.entries(categoryTotals)
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId);
        return {
          name: category?.name || 'Other',
          value: amount,
          icon: category?.icon || '💸',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories, currentMonth]);

  // Insights
  const insights = useMemo(() => {
    const monthlyIncome = transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyExpense = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;

    const overBudgetCategories = budgetVsActual.filter((b) => b.actual > b.budget);
    const topSpendingCategory = categoryBreakdown[0];

    return {
      savingsRate,
      overBudgetCategories,
      topSpendingCategory,
      netFlow: monthlyIncome - monthlyExpense,
    };
  }, [transactions, budgetVsActual, categoryBreakdown, currentMonth]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-border/50">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value, currency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Deep insights into your finances</p>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn('p-2 rounded-lg', insights.savingsRate >= 20 ? 'bg-emerald-500/20' : 'bg-amber-500/20')}>
              <Target className={cn('w-5 h-5', insights.savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400')} />
            </div>
            <span className="text-sm text-muted-foreground">Savings Rate</span>
          </div>
          <p className={cn('text-2xl font-bold', insights.savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400')}>
            {insights.savingsRate.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {insights.savingsRate >= 20 ? 'Excellent!' : 'Try to save more'}
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn('p-2 rounded-lg', insights.netFlow >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20')}>
              {insights.netFlow >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">Net Flow</span>
          </div>
          <p className={cn('text-2xl font-bold', insights.netFlow >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {formatCurrency(insights.netFlow, currency)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-neon-purple/20">
              <span className="text-xl">{insights.topSpendingCategory?.icon || '💸'}</span>
            </div>
            <span className="text-sm text-muted-foreground">Top Spending</span>
          </div>
          <p className="text-lg font-bold text-foreground truncate">
            {insights.topSpendingCategory?.name || 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {insights.topSpendingCategory ? formatCurrency(insights.topSpendingCategory.value, currency) : 'No data'}
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn('p-2 rounded-lg', insights.overBudgetCategories.length > 0 ? 'bg-red-500/20' : 'bg-emerald-500/20')}>
              <AlertTriangle className={cn('w-5 h-5', insights.overBudgetCategories.length > 0 ? 'text-red-400' : 'text-emerald-400')} />
            </div>
            <span className="text-sm text-muted-foreground">Over Budget</span>
          </div>
          <p className={cn('text-2xl font-bold', insights.overBudgetCategories.length > 0 ? 'text-red-400' : 'text-emerald-400')}>
            {insights.overBudgetCategories.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {insights.overBudgetCategories.length > 0 ? 'Categories exceeded' : 'All on track!'}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Trend */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-6">Monthly Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="income" name="Income" stroke="hsl(142 76% 46%)" strokeWidth={3} dot={{ fill: 'hsl(142 76% 46%)', r: 4 }} />
                <Line type="monotone" dataKey="expense" name="Expense" stroke="hsl(0 72% 51%)" strokeWidth={3} dot={{ fill: 'hsl(0 72% 51%)', r: 4 }} />
                <Line type="monotone" dataKey="savings" name="Savings" stroke="hsl(186 100% 50%)" strokeWidth={3} dot={{ fill: 'hsl(186 100% 50%)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget vs Actual */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-6">Budget vs Actual</h3>
          <div className="h-[300px]">
            {budgetVsActual.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No budget data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVsActual} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="actual" name="Actual" fill="hsl(186 100% 50%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown Pie */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-foreground mb-6">Expense Breakdown</h3>
        <div className="h-[350px]">
          {categoryBreakdown.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p className="text-sm">No expense data this month</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="glass-card p-3 border border-border/50">
                          <p className="text-sm font-medium text-foreground">{data.icon} {data.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatCurrency(data.value, currency)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
