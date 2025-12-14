import { Category, Transaction, Budget, Todo } from '@/types';

export const defaultCategories: Category[] = [
  { id: 'salary', name: 'Salary', icon: '💰', color: 'emerald', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: 'blue', type: 'income' },
  { id: 'investment', name: 'Investment', icon: '📈', color: 'purple', type: 'income' },
  { id: 'gift', name: 'Gift', icon: '🎁', color: 'pink', type: 'income' },
  { id: 'other-income', name: 'Other Income', icon: '💵', color: 'cyan', type: 'income' },
  { id: 'food', name: 'Food & Dining', icon: '🍔', color: 'orange', type: 'expense' },
  { id: 'transport', name: 'Transportation', icon: '🚗', color: 'blue', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'pink', type: 'expense' },
  { id: 'bills', name: 'Bills & Utilities', icon: '📄', color: 'yellow', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: 'purple', type: 'expense' },
  { id: 'health', name: 'Health', icon: '🏥', color: 'red', type: 'expense' },
  { id: 'education', name: 'Education', icon: '📚', color: 'indigo', type: 'expense' },
  { id: 'other-expense', name: 'Other Expense', icon: '💸', color: 'gray', type: 'expense' },
];

const today = new Date();
const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

export const dummyTransactions: Transaction[] = [
  {
    id: '1',
    date: `${currentMonth}-01`,
    type: 'income',
    categoryId: 'salary',
    amount: 8500000,
    note: 'Monthly salary',
    paymentMethod: 'bank',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    date: `${currentMonth}-03`,
    type: 'expense',
    categoryId: 'food',
    amount: 150000,
    note: 'Lunch with colleagues',
    paymentMethod: 'e-wallet',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    date: `${currentMonth}-05`,
    type: 'expense',
    categoryId: 'transport',
    amount: 500000,
    note: 'Monthly transport pass',
    paymentMethod: 'e-wallet',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    date: `${currentMonth}-07`,
    type: 'income',
    categoryId: 'freelance',
    amount: 2500000,
    note: 'Website project',
    paymentMethod: 'bank',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    date: `${currentMonth}-10`,
    type: 'expense',
    categoryId: 'shopping',
    amount: 750000,
    note: 'New headphones',
    paymentMethod: 'e-wallet',
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    date: `${currentMonth}-12`,
    type: 'expense',
    categoryId: 'bills',
    amount: 1200000,
    note: 'Electricity & Internet',
    paymentMethod: 'bank',
    createdAt: new Date().toISOString(),
  },
  {
    id: '7',
    date: `${currentMonth}-14`,
    type: 'expense',
    categoryId: 'entertainment',
    amount: 200000,
    note: 'Netflix & Spotify',
    paymentMethod: 'e-wallet',
    createdAt: new Date().toISOString(),
  },
  {
    id: '8',
    date: `${lastMonthStr}-15`,
    type: 'income',
    categoryId: 'salary',
    amount: 8500000,
    note: 'Monthly salary',
    paymentMethod: 'bank',
    createdAt: new Date().toISOString(),
  },
  {
    id: '9',
    date: `${lastMonthStr}-20`,
    type: 'expense',
    categoryId: 'food',
    amount: 2100000,
    note: 'Monthly groceries',
    paymentMethod: 'cash',
    createdAt: new Date().toISOString(),
  },
];

export const dummyBudgets: Budget[] = [
  { id: '1', categoryId: 'food', amount: 2500000, month: currentMonth, spent: 150000 },
  { id: '2', categoryId: 'transport', amount: 1000000, month: currentMonth, spent: 500000 },
  { id: '3', categoryId: 'shopping', amount: 1500000, month: currentMonth, spent: 750000 },
  { id: '4', categoryId: 'bills', amount: 1500000, month: currentMonth, spent: 1200000 },
  { id: '5', categoryId: 'entertainment', amount: 500000, month: currentMonth, spent: 200000 },
  { id: '6', categoryId: 'health', amount: 500000, month: currentMonth, spent: 0 },
];

export const dummyTodos: Todo[] = [
  {
    id: '1',
    title: 'Pay electricity bill',
    description: 'Due by end of month',
    dueDate: `${currentMonth}-25`,
    priority: 'high',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Review monthly budget',
    description: 'Check spending vs budget',
    dueDate: `${currentMonth}-28`,
    priority: 'medium',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Cancel unused subscription',
    priority: 'low',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Update investment portfolio',
    description: 'Rebalance quarterly',
    dueDate: `${currentMonth}-30`,
    priority: 'medium',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'File tax documents',
    description: 'Prepare for tax season',
    priority: 'high',
    status: 'done',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
];

export const formatCurrency = (amount: number, currency: string = 'IDR'): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateShort = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
};
