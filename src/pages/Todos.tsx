import { useState, useMemo } from 'react';
import { Plus, CheckCircle2, Clock, ListTodo, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TodoItem } from '@/components/todos/TodoItem';
import { AddTodoDialog } from '@/components/todos/AddTodoDialog';
import { useTodos } from '@/hooks/useStore';
import { StatCard } from '@/components/dashboard/StatCard';
import { cn } from '@/lib/utils';
import { TodoStatus, Priority } from '@/types';

type FilterStatus = 'all' | TodoStatus;
type SortOption = 'priority' | 'dueDate' | 'created';

export default function Todos() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('priority');

  const stats = useMemo(() => {
    const active = todos.filter((t) => t.status === 'active').length;
    const completed = todos.filter((t) => t.status === 'done').length;
    const overdue = todos.filter(
      (t) => t.status === 'active' && t.dueDate && new Date(t.dueDate) < new Date()
    ).length;

    return { total: todos.length, active, completed, overdue };
  }, [todos]);

  const filteredAndSortedTodos = useMemo(() => {
    let filtered = todos;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [todos, statusFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Todo List</h1>
          <p className="text-muted-foreground">Manage your tasks and stay organized</p>
        </div>
        <Button variant="neon" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={stats.total.toString()}
          icon={ListTodo}
          variant="default"
          delay={0}
        />
        <StatCard
          title="Active"
          value={stats.active.toString()}
          icon={Clock}
          variant="budget"
          delay={100}
        />
        <StatCard
          title="Completed"
          value={stats.completed.toString()}
          icon={CheckCircle2}
          variant="income"
          delay={200}
        />
        <StatCard
          title="Overdue"
          value={stats.overdue.toString()}
          icon={Clock}
          variant="expense"
          delay={300}
        />
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'done'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all',
                  statusFilter === status
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-muted/30 text-muted-foreground hover:text-foreground border border-transparent'
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="priority">Sort by Priority</option>
            <option value="dueDate">Sort by Due Date</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>
      </div>

      {/* Todo List */}
      {filteredAndSortedTodos.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ListTodo className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {statusFilter === 'all' ? 'No tasks yet' : `No ${statusFilter} tasks`}
          </h3>
          <p className="text-muted-foreground mb-6">
            {statusFilter === 'all'
              ? 'Create your first task to get started'
              : `You have no ${statusFilter} tasks`}
          </p>
          {statusFilter === 'all' && (
            <Button variant="neon" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <AddTodoDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={addTodo}
      />
    </div>
  );
}
