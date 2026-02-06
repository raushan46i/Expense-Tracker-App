import { Expense } from '../context/ExpenseContext';

export const generateInsights = async (expenses: Expense[]): Promise<string[]> => {
  // Simulate a short delay to give it a "Thinking..." feel
   await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 800);
  });

  const insights: string[] = [];
  if (!expenses || expenses.length === 0) {
    return ["Start adding expenses to get personalized insights!"];
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  // 1. Analyze Top Spending Category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
  // Handle both object and string categories safely
  const catName =
    typeof e.category === 'object' && e.category !== null
      ? (e.category as any).name || 'General'
      : e.category || 'General';

  categoryTotals[catName] = (categoryTotals[catName] || 0) + e.amount;
});


  // Sort categories by amount descending
  const sortedCats = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);
  const topCategory = sortedCats[0];

  if (topCategory) {
    const amount = categoryTotals[topCategory];
    const percentage = Math.round((amount / total) * 100);
    
    insights.push(`📊 **Top Category:** You spent ${percentage}% of your total budget on ${topCategory}.`);

    if (percentage > 40) {
        insights.push(`💡 **Tip:** Your spending on ${topCategory} is quite high. Consider setting a specific budget limit for this.`);
    }
  }

  // 2. Analyze Transaction Frequency
  if (expenses.length > 5) {
    const avgTransaction = Math.round(total / expenses.length);
    insights.push(`💳 **Average Cost:** On average, you spend about ${avgTransaction} per transaction.`);
  }

  // 3. Weekend vs Weekday (Fun Insight)
  const weekendSpend = expenses.filter(e => {
    const date = new Date(e.date);
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }).reduce((sum, e) => sum + e.amount, 0);

  if (weekendSpend > (total * 0.4)) {
    insights.push(`📅 **Weekend Warrior:** You tend to spend a significant portion of your money (${Math.round((weekendSpend/total)*100)}%) on weekends.`);
  } else {
    insights.push(`📅 **Steady Spender:** Your spending is well-distributed throughout the week.`);
  }

  return insights;
};