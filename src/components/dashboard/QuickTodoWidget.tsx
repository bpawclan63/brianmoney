import { CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Todo } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QuickTodoWidgetProps {
  todos: Todo[];
  onToggle: (id: string) => void;
}

const priorityColors = {
  high: 'text-red-400',
  medium: 'text-amber-400',
  low: 'text-emerald-400',
};

export function QuickTodoWidget({ todos, onToggle }: QuickTodoWidgetProps) {
  const activeTodos = todos
    .filter((t) => t.status === 'active')
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 5);

  return (
    <div className="glass-card p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-neon-cyan" />
          Quick Tasks
        </h3>
        <Link to="/todos">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {activeTodos.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">All tasks completed!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeTodos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <button
                onClick={() => onToggle(todo.id)}
                className="mt-0.5 text-muted-foreground hover:text-primary transition-colors"
              >
                <Circle className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {todo.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={cn(
                      'text-xs font-medium capitalize',
                      priorityColors[todo.priority]
                    )}
                  >
                    {todo.priority}
                  </span>
                  {todo.dueDate && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(todo.dueDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
