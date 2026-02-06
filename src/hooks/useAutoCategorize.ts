import { useState, useEffect } from 'react';

interface ExpenseData {
  title?: string;
  amount?: number;
}

// Simple keyword mapping for offline AI
const KEYWORDS: Record<string, string[]> = {
  Food: ['burger', 'pizza', 'coffee', 'lunch', 'dinner', 'restaurant', 'cafe', 'starbucks', 'mcdonalds'],
  Transport: ['uber', 'ola', 'taxi', 'bus', 'train', 'metro', 'fuel', 'petrol', 'gas'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'clothes', 'shoes', 'mall', 'store'],
  Bills: ['electricity', 'water', 'internet', 'wifi', 'recharge', 'mobile'],
  Entertainment: ['movie', 'netflix', 'cinema', 'game', 'spotify'],
  Health: ['medicine', 'doctor', 'hospital', 'pharmacy', 'gym'],
};

export const useAutoCategorize = (expenseData?: ExpenseData) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!expenseData?.title) {
        setSuggestions([]);
        return;
      }

      setLoading(true);

      // Simulate "Thinking" time
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 500);
      });


      const titleLower = expenseData.title.toLowerCase();
      const matchedCategories: string[] = [];

      // Check keywords
      Object.entries(KEYWORDS).forEach(([category, words]) => {
        if (words.some(word => titleLower.includes(word))) {
          matchedCategories.push(category);
        }
      });

      // If no match found, suggest top 3 common categories
      if (matchedCategories.length === 0) {
        setSuggestions(['Food', 'Transport', 'Shopping']);
      } else {
        setSuggestions(matchedCategories);
      }

      setLoading(false);
    };

    fetchSuggestions();
  }, [expenseData?.title]);

  return { suggestions, loading };
};