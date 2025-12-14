export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'bank' | 'e-wallet';
export type Priority = 'low' | 'medium' | 'high';
export type TodoStatus = 'active' | 'done';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType | 'both';
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  categoryId: string;
  amount: number;
  note: string;
  paymentMethod: PaymentMethod;
  tags?: string[];
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM format
  spent: number;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: Priority;
  status: TodoStatus;
  createdAt: string;
  completedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  budgetRemaining: number;
  budgetUsedPercent: number;
}
