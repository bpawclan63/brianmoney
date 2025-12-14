import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/data';

interface SpendingChartProps {
  transactions: Transaction[];
  currency: string;
}

export function SpendingChart({ transactions, currency }: SpendingChartProps) {
  const chartData = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
      const month = t.date.substring(0, 7);
      if (!months[month]) {
        months[month] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        months[month].income += t.amount;
      } else {
        months[month].expense += t.amount;
      }
    });

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('id-ID', {
          month: 'short',
        }),
        income: data.income,
        expense: data.expense,
      }));
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-border/50">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-xs"
              style={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value, currency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <h3 className="font-semibold text-foreground mb-6">Income vs Expense Trend</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span className="text-xs text-muted-foreground capitalize">{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="hsl(142 76% 46%)"
              strokeWidth={3}
              dot={{ fill: 'hsl(142 76% 46%)', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(142 76% 46%)', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="hsl(0 72% 51%)"
              strokeWidth={3}
              dot={{ fill: 'hsl(0 72% 51%)', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(0 72% 51%)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
