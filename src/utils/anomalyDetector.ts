import { Expense } from '../context/ExpenseContext';

export const detectAnomalies = async (expenses: Expense[]): Promise<string[]> => {
  // Simulate a short delay
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 800);
  });

  const anomalies: string[] = [];
  
  // Need at least a few data points to calculate a meaningful average
  if (!expenses || expenses.length < 5) {
    return ["Add more expenses (at least 5) to detect anomalies."];
  }

  // 1. Calculate Average Transaction
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const average = total / expenses.length;

  // 2. Set Threshold (e.g., 3x the average is considered "High")
  const threshold = average * 3;

  // 3. Identify Outliers
  expenses.forEach(e => {
    if (e.amount > threshold) {
      anomalies.push(`⚠️ **High Value:** "${e.title}" (${e.amount}) is significantly higher than your average transaction of ${Math.round(average)}.`);
    }
  });

  if (anomalies.length === 0) {
    return ["✅ No suspicious or unusual transactions found."];
  }

  return anomalies;
};