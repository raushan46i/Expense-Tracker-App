import { CATEGORIES } from "../constant"; // We will check this file next
import { startOfDay, startOfWeek, startOfMonth, startOfYear, isAfter, isEqual, format, parseISO } from 'date-fns';
import { Expense } from '../context/ExpenseContext';

// 1. Define Types


export interface PieChartData {
  name: string;
  amount: number;
  value: number;
  color: string;
  text: string;
}

export interface GroupedExpense {
  title: string;
  data: Expense[];
}

export type Period = 'all' | 'day' | 'week' | 'month' | 'year';

// 2. Helper Functions

export const getId = (): string => {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
};

export const getDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCategoryColor = (color: string): string => {
  const category = CATEGORIES.find((cat) => cat.color === color);
  return category ? category.color : "#808080";
};

export const processDataForPieChart = (expenses: Expense[]): PieChartData[] => {
  if (!Array.isArray(expenses) || expenses.length === 0) return [];

  const totalSpending = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  if (totalSpending === 0) return [];

  const spendingByCategory: Record<string, number> = expenses.reduce((acc, expense) => {

  const categoryName =
    typeof expense.category === 'object' && expense.category !== null
      ? (expense.category as any).name || 'General'
      : expense.category || 'General';

  acc[categoryName] = (acc[categoryName] || 0) + Number(expense.amount);
  return acc;
}, {} as Record<string, number>);


  return Object.keys(spendingByCategory).map((categoryName) => {
    const amount = spendingByCategory[categoryName];
    const percentage = Math.round((amount / totalSpending) * 100);
    const categoryInfo = CATEGORIES.find((cat) => cat.name === categoryName);

    return {
      name: categoryName,
      amount,
      value: percentage,
      color: categoryInfo?.color || "#808080",
      text: `${percentage}%`,
    };
  });
};

export const getFilteredExpenses = (expenses: Expense[], period: Period): Expense[] => {
  if (period === 'all') return expenses;

  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'day':   startDate = startOfDay(now); break;
    case 'week':  startDate = startOfWeek(now, { weekStartsOn: 1 }); break;
    case 'month': startDate = startOfMonth(now); break;
    case 'year':  startDate = startOfYear(now); break;
    default:      return expenses;
  }

  return expenses.filter(expense => {
    // FIX: Append time to ensure Local Time parsing
    const expenseDate = new Date(expense.date + 'T00:00:00'); 
    return isAfter(expenseDate, startDate) || isEqual(expenseDate, startDate);
  });
};

export const groupExpensesByDate = (expenses: Expense[]): GroupedExpense[] => {
  const grouped = expenses.reduce((acc, expense) => {
    const date = expense.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
  });

  return sortedDates.map(date => {
    // FIX: Prevent Timezone shift by appending time manually
    // This ensures "2024-03-25" is treated as "March 25th 00:00:00 Local Time"
    const localDate = new Date(date + 'T00:00:00');
    
    return {
      title: format(localDate, 'd MMM yyyy'),
      data: grouped[date]
    };
  });
};

export type { Expense };
