import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CurrencyCode =
  | 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY'
  | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'KRW';

export interface CurrencyInfo {
  symbol: string;
  name: string;
  rate: number; // relative to USD
}

export const currencies: Record<CurrencyCode, CurrencyInfo> = {
  USD: { symbol: '$', name: 'US Dollar', rate: 1 },
  EUR: { symbol: '€', name: 'Euro', rate: 0.85 },
  GBP: { symbol: '£', name: 'British Pound', rate: 0.73 },
  INR: { symbol: '₹', name: 'Indian Rupee', rate: 83.5 },
  JPY: { symbol: '¥', name: 'Japanese Yen', rate: 110.0 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', rate: 1.35 },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', rate: 1.25 },
  CHF: { symbol: 'Fr', name: 'Swiss Franc', rate: 0.92 },
  CNY: { symbol: '¥', name: 'Chinese Yuan', rate: 6.45 },
  KRW: { symbol: '₩', name: 'Korean Won', rate: 1180.0 },
};

interface CurrencyContextType {
  baseCurrency: CurrencyCode;
  currencies: typeof currencies;
  isLoading: boolean;
  changeBaseCurrency: (currency: CurrencyCode) => Promise<void>;
  convertAmount: (amount: number, from: CurrencyCode, to?: CurrencyCode) => number;
  formatAmount: (amount: number, from?: CurrencyCode, to?: CurrencyCode) => string;
  getCurrencyList: () => Array<{ code: CurrencyCode } & CurrencyInfo>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface ProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<ProviderProps> = ({ children }) => {
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>('USD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrencyPreference();
  }, []);

  const loadCurrencyPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('baseCurrency');
      if (saved && currencies[saved as CurrencyCode]) {
        setBaseCurrency(saved as CurrencyCode);
      }
    } catch (error) {
      console.error('Error loading currency preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeBaseCurrency = async (currency: CurrencyCode) => {
    if (!currencies[currency]) return;
    setBaseCurrency(currency);
    try {
      await AsyncStorage.setItem('baseCurrency', currency);
    } catch (error) {
      console.error('Error saving currency preference:', error);
    }
  };

  const convertAmount = (
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode = baseCurrency
  ): number => {
    if (!currencies[from] || !currencies[to]) return amount;
    const usdValue = amount / currencies[from].rate;
    return usdValue * currencies[to].rate;
  };

  const formatAmount = (
    amount: number,
    from: CurrencyCode = baseCurrency,
    to: CurrencyCode = baseCurrency
  ): string => {
    const converted = convertAmount(amount, from, to);
    const symbol = currencies[to].symbol;
    return `${symbol}${converted.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  const getCurrencyList = () => {
    return Object.entries(currencies).map(([code, data]) => ({
      code: code as CurrencyCode,
      ...data,
    }));
  };

  const value = useMemo(
    () => ({
      baseCurrency,
      currencies,
      isLoading,
      changeBaseCurrency,
      convertAmount,
      formatAmount,
      getCurrencyList,
    }),
    [baseCurrency, isLoading]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
