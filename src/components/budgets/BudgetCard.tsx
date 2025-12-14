import { Budget, Category } from '@/types';
import { formatCurrency } from '@/lib/data';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface BudgetCardProps {
  budget: Budget;
  category: Category | undefined;
  currency: string;
}

export function BudgetCard({ budget, category, currency }: BudgetCardProps) {
  const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  const remaining = budget.amount - budget.spent;
  const isOverBudget = percentage > 100;
  const isWarning = percentage >= 80 && percentage <= 100;

  const getProgressColor = () => {
    if (isOverBudget) return 'progress-danger';
    if (isWarning) return 'progress-warning';
    return 'progress-safe';
  };

  const getStatusText = () => {
    if (isOverBudget) return 'Over Budget!';
    if (isWarning) return 'Almost at limit';
    return 'On track';
  };

  const getStatusColor = () => {
    if (isOverBudget) return 'text-red-400';
    if (isWarning) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="glass-card-hover p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-2xl">
            {category?.icon || '📊'}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{category?.name || 'Unknown'}</h3>
            <p className={cn('text-sm', getStatusColor())}>{getStatusText()}</p>
          </div>
        </div>
        {isOverBudget && (
          <div className="p-2 rounded-lg bg-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', getProgressColor())}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{percentage.toFixed(0)}% used</span>
          <span>{formatCurrency(budget.amount, currency)}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Spent</p>
          <p className="text-sm font-semibold text-foreground">
            {formatCurrency(budget.spent, currency)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">
            {remaining >= 0 ? 'Remaining' : 'Over by'}
          </p>
          <p
            className={cn(
              'text-sm font-semibold',
              remaining >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {formatCurrency(Math.abs(remaining), currency)}
          </p>
        </div>
      </div>
    </div>
  );
}
