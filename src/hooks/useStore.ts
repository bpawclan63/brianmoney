import { useState, useEffect, useCallback } from 'react';
import { Transaction, Budget, Todo, Category } from '@/types';
import { defaultCategories, dummyTransactions, dummyBudgets, dummyTodos } from '@/lib/data';

const STORAGE_KEYS = {
  transactions: 'financeflow_transactions',
  budgets: 'financeflow_budgets',
  todos: 'financeflow_todos',
  categories: 'financeflow_categories',
  currency: 'financeflow_currency',
  initialBalance: 'financeflow_initial_balance',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadFromStorage(STORAGE_KEYS.transactions, dummyTransactions)
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.transactions, transactions);
  }, [transactions]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    return newTransaction;
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { transactions, addTransaction, updateTransaction, deleteTransaction, setTransactions };
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>(() =>
    loadFromStorage(STORAGE_KEYS.budgets, dummyBudgets)
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.budgets, budgets);
  }, [budgets]);

  const addBudget = useCallback((budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
    };
    setBudgets((prev) => [...prev, newBudget]);
    return newBudget;
  }, []);

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { budgets, addBudget, updateBudget, deleteBudget, setBudgets };
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() =>
    loadFromStorage(STORAGE_KEYS.todos, dummyTodos)
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.todos, todos);
  }, [todos]);

  const addTodo = useCallback((todo: Omit<Todo, 'id' | 'createdAt' | 'status'>) => {
    const newTodo: Todo = {
      ...todo,
      id: crypto.randomUUID(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    return newTodo;
  }, []);

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === 'active' ? 'done' : 'active',
              completedAt: t.status === 'active' ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { todos, addTodo, updateTodo, toggleTodo, deleteTodo, setTodos };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(() =>
    loadFromStorage(STORAGE_KEYS.categories, defaultCategories)
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.categories, categories);
  }, [categories]);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { categories, addCategory, deleteCategory, setCategories };
}

export function useSettings() {
  const [currency, setCurrencyState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.currency, 'IDR')
  );
  const [initialBalance, setInitialBalanceState] = useState<number>(() =>
    loadFromStorage(STORAGE_KEYS.initialBalance, 0)
  );

  const setCurrency = useCallback((newCurrency: string) => {
    setCurrencyState(newCurrency);
    saveToStorage(STORAGE_KEYS.currency, newCurrency);
  }, []);

  const setInitialBalance = useCallback((balance: number) => {
    setInitialBalanceState(balance);
    saveToStorage(STORAGE_KEYS.initialBalance, balance);
  }, []);

  const resetAllData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    window.location.reload();
  }, []);

  return { currency, setCurrency, initialBalance, setInitialBalance, resetAllData };
}
