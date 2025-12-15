import { Circle, CheckCircle2, Trash2, Clock } from 'lucide-react';
import { Todo } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useConfetti } from '@/hooks/useConfetti';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityStyles = {
  high: 'border-l-rose-400 bg-rose-500/5',
  medium: 'border-l-amber-400 bg-amber-500/5',
  low: 'border-l-emerald-400 bg-emerald-500/5',
};

const priorityBadgeStyles = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const { fireHearts } = useConfetti();
  const isOverdue =
    todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status === 'active';

  const handleToggle = () => {
    // Fire confetti when completing a todo (not when uncompleting)
    if (todo.status === 'active') {
      fireHearts();
    }
    onToggle(todo.id);
  };

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-2xl border-l-4 transition-all duration-200 group',
        'glass-card hover:border-primary/30',
        priorityStyles[todo.priority],
        todo.status === 'done' && 'opacity-60'
      )}
    >
      <button
        onClick={handleToggle}
        className={cn(
          'mt-0.5 transition-all duration-300',
          todo.status === 'done'
            ? 'text-primary scale-110'
            : 'text-muted-foreground hover:text-primary hover:scale-110'
        )}
      >
        {todo.status === 'done' ? (
          <CheckCircle2 className="w-6 h-6" />
        ) : (
          <Circle className="w-6 h-6" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-medium text-foreground',
            todo.status === 'done' && 'line-through text-muted-foreground'
          )}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {todo.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-full border capitalize',
              priorityBadgeStyles[todo.priority]
            )}
          >
            {todo.priority === 'high' ? '🔥 ' : todo.priority === 'medium' ? '⭐ ' : '💫 '}
            {todo.priority}
          </span>
          {todo.dueDate && (
            <span
              className={cn(
                'text-xs flex items-center gap-1',
                isOverdue ? 'text-rose-400' : 'text-muted-foreground'
              )}
            >
              <Clock className="w-3 h-3" />
              {new Date(todo.dueDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
              {isOverdue && ' (Overdue)'}
            </span>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(todo.id)}
        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}