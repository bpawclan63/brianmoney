import { useState } from 'react';
import { X, Plus, CalendarDays } from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Transaction, TransactionType, PaymentMethod, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AddTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  categories: Category[];
}

export function AddTransactionDialog({ isOpen, onClose, onAdd, categories }: AddTransactionDialogProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('e-wallet');

  const filteredCategories = categories.filter((c) => c.type === type || c.type === 'both');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount || parseFloat(amount) <= 0) return;

    onAdd({
      type,
      categoryId,
      amount: parseFloat(amount),
      note,
      date,
      paymentMethod,
    });

    // Reset form
    setType('expense');
    setCategoryId('');
    setAmount('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('e-wallet');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 glass-card p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Add Transaction</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          {/* Amount */}
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

          {/* Category */}
          <div>
            <Label className="text-muted-foreground">Category</Label>
            <div className="grid grid-cols-4 gap-2 mt-1.5">
              {filteredCategories.slice(0, 8).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={cn(
                    'p-3 rounded-lg text-2xl transition-all border flex items-center justify-center',
                    categoryId === cat.id
                      ? 'bg-primary/20 border-primary/50'
                      : 'bg-muted/30 border-transparent hover:bg-muted/50'
                  )}
                  title={cat.name}
                >
                  <CategoryIcon iconName={cat.icon} className="w-6 h-6" />
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <Label className="text-muted-foreground">Date</Label>
            <div className="relative mt-1.5">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="text-muted-foreground">Payment Method</Label>
            <div className="flex gap-2 mt-1.5">
              {(['cash', 'bank', 'e-wallet'] as PaymentMethod[]).map((method) => (
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

          {/* Note */}
          <div>
            <Label className="text-muted-foreground">Note (optional)</Label>
            <Input
              placeholder="Add a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <Button type="submit" className="w-full" variant="neon">
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        </form>
      </div>
    </div>
  );
}
