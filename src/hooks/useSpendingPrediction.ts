import { useMemo } from 'react';
import { Expense } from '../context/ExpenseContext';

export const useSpendingPrediction = (expenses: Expense[]) => {
  const prediction = useMemo(() => {
    if (!expenses || expenses.length === 0) return 0;

    // 1. Group expenses by Month (Key: "YYYY-MM")
    const monthlyTotals: Record<string, number> = {};

    expenses.forEach(expense => {
      // Create a key like "2024-03" from the date string
      const monthKey = expense.date.substring(0, 7);
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
    });

    const totals = Object.values(monthlyTotals);
    if (totals.length === 0) return 0;

    // 2. Calculate Average Monthly Spend
    const sum = totals.reduce((a, b) => a + b, 0);
    const average = sum / totals.length;

    // 3. Prediction Logic: Average + 5% buffer (for inflation/safety)
    // You can adjust the multiplier (1.05) to be more or less conservative
    return Math.round(average * 1.05);
  }, [expenses]);

  return { prediction };
};