export type ExpenseType = 'income' | 'expense';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  type: ExpenseType;
  note?: string;
  createdAt: number;
}
