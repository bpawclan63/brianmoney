import { useState, useMemo } from 'react';
import { Plus, Repeat, CalendarDays, X, Loader2, Pause, Play, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDbRecurring, useDbCategories, useDbProfile } from '@/hooks/useSupabaseStore';
import { formatCurrency, formatDate } from '@/lib/data';
import { StatCard } from '@/components/dashboard/StatCard';
import { cn } from '@/lib/utils';

const intervals = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export default function Recurring() {
  const { recurring, loading, addRecurring, toggleRecurring, deleteRecurring } = useDbRecurring();
  const { categories } = useDbCategories();
  const { profile } = useDbProfile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'e-wallet'>('bank');
  const [interval, setInterval] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [nextDate, setNextDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currency = profile?.currency || 'IDR';

  const filteredCategories = categories.filter((c) => c.type === type || c.type === 'both');

  const stats = useMemo(() => {
    const active = recurring.filter((r) => r.is_active);
    const monthlyIncome = active
      .filter((r) => r.type === 'income' && r.interval === 'monthly')
      .reduce((sum, r) => sum + r.amount, 0);
    const monthlyExpense = active
      .filter((r) => r.type === 'expense' && r.interval === 'monthly')
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      total: recurring.length,
      active: active.length,
      monthlyIncome,
      monthlyExpense,
    };
  }, [recurring]);

  const handleAddRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || parseFloat(amount) <= 0) return;

    setSubmitting(true);
    await addRecurring({
      name,
      type,
      category_id: categoryId || null,
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      interval,
      next_date: nextDate,
      note: note || null,
    });

    setName('');
    setType('expense');
    setCategoryId('');
    setAmount('');
    setPaymentMethod('bank');
    setInterval('monthly');
    setNextDate(new Date().toISOString().split('T')[0]);
    setNote('');
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
          <h1 className="text-2xl font-bold text-foreground">Recurring Transactions</h1>
          <p className="text-muted-foreground">Manage your regular income and expenses</p>
        </div>
        <Button variant="neon" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Recurring
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Recurring"
          value={stats.total.toString()}
          icon={Repeat}
          variant="default"
          delay={0}
        />
        <StatCard
          title="Active"
          value={stats.active.toString()}
          icon={CalendarDays}
          variant="budget"
          delay={100}
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(stats.monthlyIncome, currency)}
          icon={TrendingUp}
          variant="income"
          delay={200}
        />
        <StatCard
          title="Monthly Expense"
          value={formatCurrency(stats.monthlyExpense, currency)}
          icon={TrendingDown}
          variant="expense"
          delay={300}
        />
      </div>

      {/* Recurring List */}
      {recurring.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Repeat className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No recurring transactions</h3>
          <p className="text-muted-foreground mb-6">
            Add recurring income or expenses like salary, subscriptions, or bills
          </p>
          <Button variant="neon" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Recurring
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {recurring.map((item) => {
            const category = categories.find((c) => c.id === item.category_id);
            const isUpcoming = new Date(item.next_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            return (
              <div
                key={item.id}
                className={cn(
                  'glass-card-hover p-4',
                  !item.is_active && 'opacity-60'
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center text-xl',
                      item.type === 'income' ? 'bg-success/20' : 'bg-destructive/20'
                    )}
                  >
                    {category?.icon || (item.type === 'income' ? '💰' : '💸')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                      {!item.is_active && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                          Paused
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="capitalize">{item.interval}</span>
                      <span>•</span>
                      <span className={cn(isUpcoming && item.is_active && 'text-warning')}>
                        Next: {formatDate(item.next_date)}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p
                      className={cn(
                        'font-bold',
                        item.type === 'income' ? 'text-success' : 'text-destructive'
                      )}
                    >
                      {item.type === 'income' ? '+' : '-'}
                      {formatCurrency(item.amount, currency)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{item.payment_method}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleRecurring(item.id)}
                      title={item.is_active ? 'Pause' : 'Resume'}
                    >
                      {item.is_active ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteRecurring(item.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDialogOpen(false)}
          />
          <div className="relative w-full max-w-md mx-4 glass-card p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Add Recurring</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleAddRecurring} className="space-y-5">
              {/* Type Toggle */}
              <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-medium rounded-md transition-all',
                    type === 'expense'
                      ? 'bg-red-500/20 text-red-400'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-medium rounded-md transition-all',
                    type === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Income
                </button>
              </div>

              <div>
                <Label className="text-muted-foreground">Name</Label>
                <Input
                  placeholder="e.g., Monthly Salary, Netflix Subscription"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="1000"
                  className="mt-1.5 text-lg font-semibold"
                  required
                />
              </div>

              <div>
                <Label className="text-muted-foreground">Category</Label>
                <div className="grid grid-cols-4 gap-2 mt-1.5">
                  {filteredCategories.slice(0, 8).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={cn(
                        'p-3 rounded-lg text-2xl transition-all border',
                        categoryId === cat.id
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
                <Label className="text-muted-foreground">Interval</Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {intervals.map((int) => (
                    <button
                      key={int.value}
                      type="button"
                      onClick={() => setInterval(int.value)}
                      className={cn(
                        'py-2.5 text-sm font-medium rounded-lg transition-all border',
                        interval === int.value
                          ? 'bg-primary/20 border-primary/50 text-foreground'
                          : 'bg-muted/30 border-transparent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {int.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Next Date</Label>
                <Input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label className="text-muted-foreground">Payment Method</Label>
                <div className="flex gap-2 mt-1.5">
                  {(['cash', 'bank', 'e-wallet'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={cn(
                        'flex-1 py-2 px-3 text-sm rounded-lg capitalize transition-all border',
                        paymentMethod === method
                          ? 'bg-primary/20 border-primary/50 text-foreground'
                          : 'bg-muted/30 border-transparent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Note (optional)</Label>
                <Input
                  placeholder="Add a note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <Button type="submit" className="w-full" variant="neon" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <Plus className="w-4 h-4" />
                Add Recurring
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
