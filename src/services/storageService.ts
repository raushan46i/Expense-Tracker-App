import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types/Expense'; // Ensure this path matches where you keep your types

const EXPENSES_KEY = 'EXPENSES_DATA';

export const saveExpenses = async (expenses: Expense[]) => {
  try {
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Save failed', e);
  }
};

export const loadExpenses = async (): Promise<Expense[]> => {
  try {
    const data = await AsyncStorage.getItem(EXPENSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Load failed', e);
    return [];
  }
};

export const clearExpenses = async () => {
  await AsyncStorage.removeItem(EXPENSES_KEY);
};