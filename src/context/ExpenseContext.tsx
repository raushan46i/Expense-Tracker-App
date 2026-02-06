import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// FIX: Correct path to utils folder
import { getDate, getCategoryColor, getId } from "../utils/helper";

export interface Category {
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  time?: string;
  color?: string;
  icon?: string;
}

interface AddExpenseInput {
  title: string;
  amount: number;
  category: {
    name: string;
    color: string;
    icon?: string;
  };
}

interface ExpenseContextType {
  expenses: Expense[];
  isLoading: boolean;
  monthlyBudget: number;
  addExpense: (expense: AddExpenseInput) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (updatedExpense: Expense) => void;
  setMonthlyBudget: (amount: number) => void;
  getDailyTotal: () => number;
  getMonthlyTotal: (month?: number, year?: number) => number;
  clearAll: () => Promise<void>;
}

export const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used inside ExpenseProvider");
  }
  return context;
};

interface ProviderProps {
  children: ReactNode;
}

export const ExpenseProvider: React.FC<ProviderProps> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyBudget, setMonthlyBudgetState] = useState<number>(20000);

  /* -------------------- Load from Storage -------------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Expenses
        const storedExpenses = await AsyncStorage.getItem("expenseslist");
        if (storedExpenses) {
          setExpenses(JSON.parse(storedExpenses));
        }

        // Load Budget
        const storedBudget = await AsyncStorage.getItem("user_budget");
        if (storedBudget) {
          setMonthlyBudgetState(Number(storedBudget));
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  /* -------------------- Save to Storage -------------------- */
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem("expenseslist", JSON.stringify(expenses)).catch(err =>
        console.error("Failed to save expenses:", err)
      );
    }
  }, [expenses, isLoading]);

  /* -------------------- Helper Functions -------------------- */

  const setMonthlyBudget = (amount: number) => {
    setMonthlyBudgetState(amount);
    AsyncStorage.setItem("user_budget", amount.toString()).catch(console.error);
  };

  const addExpense = (expense: AddExpenseInput) => {
    const newExpense: Expense = {
      id: getId(),
      title: expense.title,
      amount: Number(expense.amount),
      category: expense.category.name,
      date: getDate(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      color: getCategoryColor(expense.category.color),
      icon: expense.category.icon,
    };

    setExpenses(prev => [...prev, newExpense]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prev =>
      prev.map(item => (item.id === updatedExpense.id ? updatedExpense : item))
    );
  };

  const clearAll = async () => {
    try {
      setExpenses([]);
      await AsyncStorage.removeItem("expenseslist");
    } catch (error) {
      console.error("Failed to clear expenses:", error);
    }
  };

  /* -------------------- Analytics Helpers -------------------- */
  const getDailyTotal = (): number => {
    const today = getDate();
    return expenses
      .filter(e => e.date === today)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getMonthlyTotal = (
    month: number = new Date().getMonth(),
    year: number = new Date().getFullYear()
  ): number => {
    return expenses
      .filter(e => {
        // Note: This assumes e.date is in a format JS Date() can parse (e.g., YYYY-MM-DD)
        const d = new Date(e.date);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  };

  /* -------------------- Memoized Context -------------------- */
  const value = useMemo(
    () => ({
      expenses,
      isLoading,
      monthlyBudget,
      setMonthlyBudget,
      addExpense,
      deleteExpense,
      updateExpense,
      getDailyTotal,
      getMonthlyTotal,
      clearAll,
    }),
    [expenses, isLoading, monthlyBudget]
  );

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};