import { useState, useMemo } from 'react';
import { Plus, PiggyBank, AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { useDbBudgets, useDbCategories, useDbProfile, useDbTransactions } from '@/hooks/useSupabaseStore';
import { formatCurrency } from '@/lib/data';
import { StatCard } from '@/components/dashboard/StatCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function Budgets() {
  const { budgets, loading: loadingBudgets, addBudget } = useDbBudgets();
  const { transactions, loading: loadingTx } = useDbTransactions();
  const { categories, loading: loadingCat } = useDbCategories();
  const { profile } = useDbProfile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currency = profile?.currency || 'IDR';
  const loading = loadingBudgets || loadingTx || loadingCat;

  const currentMonth = new Date().toISOString().substring(0, 7);
  const currentMonthBudgets = budgets.filter((b) => b.month === currentMonth);

  // Transform categories
  const transformedCategories = useMemo(() => {
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      type: c.type as 'income' | 'expense' | 'both',
    }));
  }, [categories]);

  // Recalculate spent amounts based on actual transactions
  const budgetsWithActualSpent = useMemo(() => {
    const monthlyExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.date.startsWith(currentMonth)
    );

    return currentMonthBudgets.map((budget) => {
      const spent = monthlyExpenses
        .filter((t) => t.category_id === budget.category_id)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { 
        id: budget.id,
        categoryId: budget.category_id,
        amount: Number(budget.amount),
        month: budget.month,
        spent 
      };
    });
  }, [currentMonthBudgets, transactions, currentMonth]);

  const summary = useMemo(() => {
    const totalBudget = budgetsWithActualSpent.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgetsWithActualSpent.reduce((sum, b) => sum + b.spent, 0);
    const onTrack = budgetsWithActualSpent.filter((b) => b.spent <= b.amount).length;
    const overBudget = budgetsWithActualSpent.filter((b) => b.spent > b.amount).length;

    return { totalBudget, totalSpent, onTrack, overBudget };
  }, [budgetsWithActualSpent]);

  const expenseCategories = transformedCategories.filter((c) => c.type === 'expense' || c.type === 'both');
  const usedCategoryIds = currentMonthBudgets.map((b) => b.category_id);
  const availableCategories = expenseCategories.filter((c) => !usedCategoryIds.includes(c.id));

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !budgetAmount || parseFloat(budgetAmount) <= 0) return;

    setSubmitting(true);
    await addBudget({
      category_id: selectedCategory,
      amount: parseFloat(budgetAmount),
      month: currentMonth,
    });

    setSelectedCategory('');
    setBudgetAmount('');
    setIsDialogOpen(false);
    setSubmitting(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Budgets</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button
          variant="neon"
          onClick={() => setIsDialogOpen(true)}
          disabled={availableCategories.length === 0}
        >
          <Plus className="w-4 h-4" />
          Add Budget
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Budget"
          value={formatCurrency(summary.totalBudget, currency)}
          icon={PiggyBank}
          variant="default"
          delay={0}
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(summary.totalSpent, currency)}
          subtitle={`${((summary.totalSpent / summary.totalBudget) * 100 || 0).toFixed(0)}% of budget`}
          icon={PiggyBank}
          variant="expense"
          delay={100}
        />
        <StatCard
          title="On Track"
          value={summary.onTrack.toString()}
          subtitle="categories"
          icon={CheckCircle}
          variant="income"
          delay={200}
        />
        <StatCard
          title="Over Budget"
          value={summary.overBudget.toString()}
          subtitle="categories"
          icon={AlertTriangle}
          variant="expense"
          delay={300}
        />
      </div>

      {/* Budget Cards */}
      {budgetsWithActualSpent.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <PiggyBank className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No budgets set</h3>
          <p className="text-muted-foreground mb-6">
            Create your first budget to start tracking spending
          </p>
          <Button variant="neon" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Budget
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetsWithActualSpent.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              category={transformedCategories.find((c) => c.id === budget.categoryId)}
              currency={currency}
            />
          ))}
        </div>
      )}

      {/* Add Budget Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDialogOpen(false)}
          />
          <div className="relative w-full max-w-md mx-4 glass-card p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Add Budget</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleAddBudget} className="space-y-5">
              <div>
                <Label className="text-muted-foreground">Category</Label>
                <div className="grid grid-cols-4 gap-2 mt-1.5">
                  {availableCategories.slice(0, 8).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        'p-3 rounded-lg text-2xl transition-all border',
                        selectedCategory === cat.id
                          ? 'bg-primary/20 border-primary/50'
                          : 'bg-muted/30 border-transparent hover:bg-muted/50'
                      )}
                      title={cat.name}
                    >
                      {cat.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Budget Amount</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  min="0"
                  step="100000"
                  className="mt-1.5 text-lg font-semibold"
                  required
                />
              </div>

              <Button type="submit" className="w-full" variant="neon" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <Plus className="w-4 h-4" />
                Add Budget
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
