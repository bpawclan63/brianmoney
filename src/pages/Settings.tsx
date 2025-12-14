import { useState } from 'react';
import { Settings as SettingsIcon, Trash2, Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings, useTransactions, useBudgets, useTodos, useCategories } from '@/hooks/useStore';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const { currency, setCurrency, initialBalance, setInitialBalance, resetAllData } = useSettings();
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { todos } = useTodos();
  const { categories } = useCategories();

  const [tempCurrency, setTempCurrency] = useState(currency);
  const [tempBalance, setTempBalance] = useState(initialBalance.toString());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    setCurrency(tempCurrency);
    setInitialBalance(parseFloat(tempBalance) || 0);
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated.',
    });
  };

  const exportData = () => {
    const data = {
      transactions,
      budgets,
      todos,
      categories,
      settings: { currency, initialBalance },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeflow-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Data exported',
      description: 'Your data has been downloaded as JSON.',
    });
  };

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note', 'Payment Method'];
    const rows = transactions.map((t) => {
      const category = categories.find((c) => c.id === t.categoryId);
      return [t.date, t.type, category?.name || '', t.amount, t.note, t.paymentMethod].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'CSV exported',
      description: 'Transactions exported as CSV file.',
    });
  };

  const handleReset = () => {
    resetAllData();
    toast({
      title: 'Data reset',
      description: 'All data has been cleared.',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and data</p>
      </div>

      {/* Currency & Balance */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/20">
            <SettingsIcon className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground">General Settings</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label className="text-muted-foreground">Currency</Label>
            <select
              value={tempCurrency}
              onChange={(e) => setTempCurrency(e.target.value)}
              className="w-full mt-1.5 h-10 px-3 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="IDR">IDR - Indonesian Rupiah</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="SGD">SGD - Singapore Dollar</option>
              <option value="MYR">MYR - Malaysian Ringgit</option>
            </select>
          </div>

          <div>
            <Label className="text-muted-foreground">Initial Balance</Label>
            <Input
              type="number"
              value={tempBalance}
              onChange={(e) => setTempBalance(e.target.value)}
              className="mt-1.5"
              placeholder="0"
            />
          </div>
        </div>

        <Button onClick={handleSave} variant="neon">
          Save Settings
        </Button>
      </div>

      {/* Export Data */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-neon-purple/20">
            <Download className="w-5 h-5 text-neon-purple" />
          </div>
          <h2 className="font-semibold text-foreground">Export Data</h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Download your data for backup or to use in other applications.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4" />
            Export JSON
          </Button>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border-destructive/30 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-destructive/20">
            <Trash2 className="w-5 h-5 text-destructive" />
          </div>
          <h2 className="font-semibold text-foreground">Danger Zone</h2>
        </div>

        <p className="text-sm text-muted-foreground">
          This action will permanently delete all your data including transactions, budgets, todos,
          and categories. This cannot be undone.
        </p>

        {showResetConfirm ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-foreground flex-1">Are you sure? This cannot be undone.</p>
            <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleReset}>
              Yes, Delete All
            </Button>
          </div>
        ) : (
          <Button variant="destructive" onClick={() => setShowResetConfirm(true)}>
            <Trash2 className="w-4 h-4" />
            Reset All Data
          </Button>
        )}
      </div>
    </div>
  );
}
