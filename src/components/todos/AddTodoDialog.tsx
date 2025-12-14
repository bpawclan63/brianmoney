import { useState } from 'react';
import { X, Plus, CalendarDays } from 'lucide-react';
import { Priority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface AddTodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (todo: { title: string; description?: string; dueDate?: string; priority: Priority }) => void;
}

export function AddTodoDialog({ isOpen, onClose, onAdd }: AddTodoDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      priority,
    });

    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 glass-card p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Add Task</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <Label className="text-muted-foreground">Title</Label>
            <Input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-muted-foreground">Description (optional)</Label>
            <Textarea
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 min-h-[80px]"
            />
          </div>

          {/* Due Date */}
          <div>
            <Label className="text-muted-foreground">Due Date (optional)</Label>
            <div className="relative mt-1.5">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <Label className="text-muted-foreground">Priority</Label>
            <div className="flex gap-2 mt-1.5">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    'flex-1 py-2.5 px-3 text-sm font-medium rounded-lg capitalize transition-all border',
                    priority === p
                      ? p === 'high'
                        ? 'bg-red-500/20 border-red-500/50 text-red-400'
                        : p === 'medium'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-muted/30 border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" variant="neon">
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </form>
      </div>
    </div>
  );
}
