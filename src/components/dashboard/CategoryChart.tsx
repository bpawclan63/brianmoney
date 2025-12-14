import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction, Category } from '@/types';
import { formatCurrency } from '@/lib/data';

interface CategoryChartProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
}

const COLORS = [
  'hsl(186 100% 50%)',
  'hsl(270 60% 60%)',
  'hsl(142 76% 46%)',
  'hsl(38 92% 50%)',
  'hsl(0 72% 51%)',
  'hsl(217 91% 60%)',
  'hsl(330 80% 60%)',
  'hsl(160 60% 45%)',
];

export function CategoryChart({ transactions, categories, currency }: CategoryChartProps) {
  const chartData = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthlyExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.date.startsWith(currentMonth)
    );

    const categoryTotals: Record<string, number> = {};
    monthlyExpenses.forEach((t) => {
      categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
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
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions, categories]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-3 border border-border/50">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <span>{data.icon}</span>
            {data.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(data.value, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="glass-card p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <h3 className="font-semibold text-foreground mb-6">Spending by Category</h3>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          <p className="text-sm">No expense data this month</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
      <h3 className="font-semibold text-foreground mb-6">Spending by Category</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              innerRadius={40}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value, entry: any) => (
                <span className="text-xs text-muted-foreground">
                  {entry.payload.icon} {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
