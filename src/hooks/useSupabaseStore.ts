import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Types matching database schema
export interface DbTransaction {
  id: string;
  user_id: string;
  date: string;
  type: 'income' | 'expense';
  category_id: string | null;
  amount: number;
  note: string | null;
  payment_method: 'cash' | 'bank' | 'e-wallet';
  tags: string[] | null;
  recurring_id: string | null;
  created_at: string;
}

export interface DbCategory {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  is_default: boolean;
  created_at: string;
}

export interface DbBudget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: string;
  created_at: string;
}

export interface DbTodo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'done';
  created_at: string;
  completed_at: string | null;
}

export interface DbGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  icon: string;
  color: string;
  created_at: string;
  completed_at: string | null;
}

export interface DbRecurring {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  category_id: string | null;
  amount: number;
  payment_method: 'cash' | 'bank' | 'e-wallet';
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_date: string;
  note: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DbNotification {
  id: string;
  user_id: string;
  type: 'bill_reminder' | 'todo_overdue' | 'budget_warning' | 'goal_milestone';
  title: string;
  message: string;
  is_read: boolean;
  reference_id: string | null;
  created_at: string;
}

export interface DbProfile {
  id: string;
  email: string;
  name: string | null;
  currency: string;
  initial_balance: number;
  created_at: string;
  updated_at: string;
}

// Transactions Hook
export function useDbTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<DbTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(async (transaction: Omit<DbTransaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding transaction', description: error.message, variant: 'destructive' });
      return null;
    }

    setTransactions((prev) => [data, ...prev]);
    return data;
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting transaction', description: error.message, variant: 'destructive' });
      return false;
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    return true;
  }, []);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Omit<DbTransaction, 'id' | 'user_id' | 'created_at'>>) => {
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating transaction', description: error.message, variant: 'destructive' });
      return false;
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    toast({ title: 'Transaction updated' });
    return true;
  }, []);

  return { transactions, loading, addTransaction, deleteTransaction, updateTransaction, refetch: fetchTransactions };
}

// Categories Hook
export function useDbCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(async (category: Omit<DbCategory, 'id' | 'user_id' | 'created_at' | 'is_default'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...category,
        user_id: user.id,
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding category', description: error.message, variant: 'destructive' });
      return null;
    }

    setCategories((prev) => [...prev, data]);
    return data;
  }, [user]);

  console.log(categories)
  return { categories, loading, addCategory, refetch: fetchCategories };
}

// Budgets Hook
export function useDbBudgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<DbBudget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching budgets:', error);
    } else {
      setBudgets(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const addBudget = useCallback(async (budget: Omit<DbBudget, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        ...budget,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding budget', description: error.message, variant: 'destructive' });
      return null;
    }

    setBudgets((prev) => [...prev, data]);
    return data;
  }, [user]);

  const deleteBudget = useCallback(async (id: string) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting budget', description: error.message, variant: 'destructive' });
      return false;
    }

    setBudgets((prev) => prev.filter((b) => b.id !== id));
    return true;
  }, []);

  const updateBudget = useCallback(async (id: string, updates: Partial<Omit<DbBudget, 'id' | 'user_id' | 'created_at'>>) => {
    const { error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating budget', description: error.message, variant: 'destructive' });
      return false;
    }

    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    toast({ title: 'Budget updated' });
    return true;
  }, []);

  return { budgets, loading, addBudget, deleteBudget, updateBudget, refetch: fetchBudgets };
}

// Todos Hook
export function useDbTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<DbTodo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = useCallback(async (todo: Omit<DbTodo, 'id' | 'user_id' | 'created_at' | 'completed_at' | 'status'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('todos')
      .insert({
        ...todo,
        user_id: user.id,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding todo', description: error.message, variant: 'destructive' });
      return null;
    }

    setTodos((prev) => [data, ...prev]);
    return data;
  }, [user]);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return false;

    const newStatus = todo.status === 'active' ? 'done' : 'active';
    const completedAt = newStatus === 'done' ? new Date().toISOString() : null;

    const { error } = await supabase
      .from('todos')
      .update({ status: newStatus, completed_at: completedAt })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating todo', description: error.message, variant: 'destructive' });
      return false;
    }

    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: newStatus, completed_at: completedAt } : t
      )
    );
    return true;
  }, [todos]);

  const deleteTodo = useCallback(async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting todo', description: error.message, variant: 'destructive' });
      return false;
    }

    setTodos((prev) => prev.filter((t) => t.id !== id));
    return true;
  }, []);

  return { todos, loading, addTodo, toggleTodo, deleteTodo, refetch: fetchTodos };
}

// Goals Hook
export function useDbGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<DbGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = useCallback(async (goal: Omit<DbGoal, 'id' | 'user_id' | 'created_at' | 'completed_at' | 'current_amount'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('financial_goals')
      .insert({
        ...goal,
        user_id: user.id,
        current_amount: 0,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding goal', description: error.message, variant: 'destructive' });
      return null;
    }

    setGoals((prev) => [data, ...prev]);
    return data;
  }, [user]);

  const updateGoal = useCallback(async (id: string, updates: Partial<DbGoal>) => {
    const { error } = await supabase
      .from('financial_goals')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating goal', description: error.message, variant: 'destructive' });
      return false;
    }

    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
    return true;
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    const { error } = await supabase.from('financial_goals').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting goal', description: error.message, variant: 'destructive' });
      return false;
    }

    setGoals((prev) => prev.filter((g) => g.id !== id));
    return true;
  }, []);

  return { goals, loading, addGoal, updateGoal, deleteGoal, refetch: fetchGoals };
}

// Recurring Transactions Hook
export function useDbRecurring() {
  const { user } = useAuth();
  const [recurring, setRecurring] = useState<DbRecurring[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecurring = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('next_date');

    if (error) {
      console.error('Error fetching recurring transactions:', error);
    } else {
      setRecurring(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRecurring();
  }, [fetchRecurring]);

  const addRecurring = useCallback(async (item: Omit<DbRecurring, 'id' | 'user_id' | 'created_at' | 'is_active'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert({
        ...item,
        user_id: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding recurring transaction', description: error.message, variant: 'destructive' });
      return null;
    }

    setRecurring((prev) => [...prev, data]);
    return data;
  }, [user]);

  const toggleRecurring = useCallback(async (id: string) => {
    const item = recurring.find((r) => r.id === id);
    if (!item) return false;

    const { error } = await supabase
      .from('recurring_transactions')
      .update({ is_active: !item.is_active })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating recurring transaction', description: error.message, variant: 'destructive' });
      return false;
    }

    setRecurring((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    );
    return true;
  }, [recurring]);

  const deleteRecurring = useCallback(async (id: string) => {
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting recurring transaction', description: error.message, variant: 'destructive' });
      return false;
    }

    setRecurring((prev) => prev.filter((r) => r.id !== id));
    return true;
  }, []);

  return { recurring, loading, addRecurring, toggleRecurring, deleteRecurring, refetch: fetchRecurring };
}

// Notifications Hook
export function useDbNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) return false;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    return true;
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return false;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) return false;

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
    return true;
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications };
}

// Profile Hook
export function useDbProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<DbProfile>) => {
    if (!user) return false;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
      return false;
    }

    setProfile((prev) => prev ? { ...prev, ...updates } : null);
    toast({ title: 'Settings saved', description: 'Your preferences have been updated.' });
    return true;
  }, [user]);

  return { profile, loading, updateProfile, refetch: fetchProfile };
}
