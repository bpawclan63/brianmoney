import { useState, useMemo } from 'react';
import { Plus, Target, TrendingUp, CheckCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDbGoals, useDbProfile } from '@/hooks/useSupabaseStore';
import { formatCurrency } from '@/lib/data';
import { StatCard } from '@/components/dashboard/StatCard';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const goalIcons = ['🎯', '🏠', '🚗', '✈️', '💻', '📚', '💍', '🏖️', '💰', '🎓'];
const goalColors = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export default function Goals() {
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useDbGoals();
  const { profile } = useDbProfile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingFunds, setIsAddingFunds] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState('#06b6d4');
  const [submitting, setSubmitting] = useState(false);

  const currency = profile?.currency || 'IDR';

  const stats = useMemo(() => {
    const active = goals.filter((g) => !g.completed_at).length;
    const completed = goals.filter((g) => g.completed_at).length;
    const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);

    return { total: goals.length, active, completed, totalSaved, totalTarget };
  }, [goals]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || parseFloat(targetAmount) <= 0) return;

    setSubmitting(true);
    await addGoal({
      name,
      target_amount: parseFloat(targetAmount),
      deadline: deadline || null,
      icon: selectedIcon,
      color: selectedColor,
    });

    setName('');
    setTargetAmount('');
    setDeadline('');
    setSelectedIcon('🎯');
    setSelectedColor('#06b6d4');
    setIsDialogOpen(false);
    setSubmitting(false);
  };

  const handleAddFunds = async (goalId: string) => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) return;

    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const newAmount = goal.current_amount + parseFloat(fundAmount);
    const isComplete = newAmount >= goal.target_amount;

    await updateGoal(goalId, {
      current_amount: newAmount,
      completed_at: isComplete ? new Date().toISOString() : null,
    });

    if (isComplete) {
      toast({
        title: '🎉 Goal achieved!',
        description: `Congratulations! You've reached your ${goal.name} goal!`,
      });
    }

    setFundAmount('');
    setIsAddingFunds(null);
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
          <h1 className="text-2xl font-bold text-foreground">Financial Goals</h1>
          <p className="text-muted-foreground">Track your savings targets and milestones</p>
        </div>
        <Button variant="neon" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Goals"
          value={stats.total.toString()}
          icon={Target}
          variant="default"
          delay={0}
        />
        <StatCard
          title="In Progress"
          value={stats.active.toString()}
          icon={TrendingUp}
          variant="budget"
          delay={100}
        />
        <StatCard
          title="Completed"
          value={stats.completed.toString()}
          icon={CheckCircle}
          variant="income"
          delay={200}
        />
        <StatCard
          title="Total Saved"
          value={formatCurrency(stats.totalSaved, currency)}
          icon={Target}
          variant="default"
          delay={300}
        />
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Target className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No goals yet</h3>
          <p className="text-muted-foreground mb-6">
            Set your first financial goal to start saving
          </p>
          <Button variant="neon" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            const isComplete = goal.completed_at !== null;
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div
                key={goal.id}
                className={cn(
                  'glass-card-hover p-5',
                  isComplete && 'border-success/30'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      {goal.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{goal.name}</h3>
                      {goal.deadline && (
                        <p className="text-xs text-muted-foreground">
                          {isComplete
                            ? 'Completed!'
                            : daysLeft && daysLeft > 0
                            ? `${daysLeft} days left`
                            : 'Overdue'}
                        </p>
                      )}
                    </div>
                  </div>
                  {isComplete && (
                    <CheckCircle className="w-5 h-5 text-success" />
                  )}
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground font-medium">
                      {formatCurrency(goal.current_amount, currency)}
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(goal.target_amount, currency)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {progress.toFixed(0)}% complete
                  </p>
                </div>

                {/* Actions */}
                {!isComplete && (
                  <div className="flex gap-2">
                    {isAddingFunds === goal.id ? (
                      <div className="flex gap-2 w-full">
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={fundAmount}
                          onChange={(e) => setFundAmount(e.target.value)}
                          className="flex-1"
                          min="0"
                        />
                        <Button size="sm" variant="neon" onClick={() => handleAddFunds(goal.id)}>
                          Add
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsAddingFunds(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setIsAddingFunds(goal.id)}
                        >
                          <Plus className="w-4 h-4" />
                          Add Funds
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDialogOpen(false)}
          />
          <div className="relative w-full max-w-md mx-4 glass-card p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Add Goal</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-5">
              <div>
                <Label className="text-muted-foreground">Goal Name</Label>
                <Input
                  placeholder="e.g., New Car, Emergency Fund"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label className="text-muted-foreground">Target Amount</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  min="0"
                  step="100000"
                  className="mt-1.5 text-lg font-semibold"
                  required
                />
              </div>

              <div>
                <Label className="text-muted-foreground">Deadline (Optional)</Label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-muted-foreground">Icon</Label>
                <div className="grid grid-cols-5 gap-2 mt-1.5">
                  {goalIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={cn(
                        'p-3 rounded-lg text-2xl transition-all border',
                        selectedIcon === icon
                          ? 'bg-primary/20 border-primary/50'
                          : 'bg-muted/30 border-transparent hover:bg-muted/50'
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Color</Label>
                <div className="flex gap-2 mt-1.5">
                  {goalColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'w-8 h-8 rounded-full transition-all border-2',
                        selectedColor === color
                          ? 'border-foreground scale-110'
                          : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" variant="neon" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <Plus className="w-4 h-4" />
                Add Goal
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
