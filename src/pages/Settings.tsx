import { useState } from 'react';
import { Settings as SettingsIcon, Trash2, Download, AlertTriangle, Loader2, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDbProfile, useDbTransactions, useDbCategories } from '@/hooks/useSupabaseStore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const { profile, loading, updateProfile } = useDbProfile();
  const { transactions } = useDbTransactions();
  const { categories } = useDbCategories();
  const { user, signOut } = useAuth();

  const [tempCurrency, setTempCurrency] = useState(profile?.currency || 'IDR');
  const [tempBalance, setTempBalance] = useState(profile?.initial_balance?.toString() || '0');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      currency: tempCurrency,
      initial_balance: parseFloat(tempBalance) || 0,
    });
    setSaving(false);
  };

  const exportData = () => {
    const data = {
      transactions,
      categories,
      settings: { currency: profile?.currency, initialBalance: profile?.initial_balance },
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
      const category = categories.find((c) => c.id === t.category_id);
      return [t.date, t.type, category?.name || '', t.amount, t.note || '', t.payment_method].join(',');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and data</p>
      </div>

      {/* Account Info */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/20">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground">Account</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-border flex items-center justify-center text-lg font-bold text-foreground">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium text-foreground">{profile?.name || 'User'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Button variant="outline" onClick={() => signOut()} className="mt-4">
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
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

        <Button onClick={handleSave} variant="neon" disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
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

      {/* Data Info */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-success/20">
            <AlertTriangle className="w-5 h-5 text-success" />
          </div>
          <h2 className="font-semibold text-foreground">Cloud Sync</h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Your data is automatically synced to the cloud and accessible from any device.
          All your transactions, budgets, goals, and todos are securely stored.
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-muted-foreground">Transactions</p>
            <p className="font-semibold text-foreground">{transactions.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-muted-foreground">Categories</p>
            <p className="font-semibold text-foreground">{categories.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
