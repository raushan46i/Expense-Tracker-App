import { useState } from 'react';

export const useSmartTitle = () => {
  const [generatedTitle, setGeneratedTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const generateTitle = async (
    category: string,
    amount: number,
    date: string
  ) => {
    setLoading(true);

    // Simulate AI delay
    setTimeout(() => {
      let title = '';

      // Simple logic to generate readable titles
      switch (category.toLowerCase()) {
        case 'food':
          title = amount > 500 ? 'Dinner Outing' : 'Quick Snack';
          break;
        case 'travel':
        case 'transport':
          title = 'Commute';
          break;
        case 'shopping':
          title = 'Store Purchase';
          break;
        case 'bills':
          title = 'Utility Bill';
          break;
        default:
          title = `${category} Expense`;
          break;
      }

      // Add Date context if needed (optional)
      // title += ` on ${new Date(date).toLocaleDateString()}`;

      setGeneratedTitle(title);
      setLoading(false);
    }, 600);
  };

  return {
    generatedTitle,
    generateTitle,
    loading,
    error: null, // No errors in local mode
  };
};