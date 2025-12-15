import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'income' | 'expense' | 'budget';
  className?: string;
  delay?: number;
}

const variantStyles = {
  default: 'from-neon-pink/10 to-transparent border-neon-pink/20',
  income: 'from-emerald-500/10 to-transparent border-emerald-500/20',
  expense: 'from-rose-500/10 to-transparent border-rose-500/20',
  budget: 'from-neon-purple/10 to-transparent border-neon-purple/20',
};

const iconStyles = {
  default: 'bg-neon-pink/20 text-neon-pink',
  income: 'bg-emerald-500/20 text-emerald-400',
  expense: 'bg-rose-500/20 text-rose-400',
  budget: 'bg-neon-purple/20 text-neon-purple',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'glass-card-hover p-6 bg-gradient-to-br',
        variantStyles[variant],
        'opacity-0 animate-fade-in-up',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', iconStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
