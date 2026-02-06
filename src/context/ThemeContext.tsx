import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

export const themes = {
  light: {
    mode: 'light' as ThemeMode,
    isDark: false,
    colors: {
      primary: { start: '#4F46E5', end: '#7C3AED' }, // Deep Indigo -> Violet
      accent: { start: '#F472B6', end: '#DB2777' },   // Pink -> Rose
      success: { start: '#10B981', end: '#059669' },  // Emerald
      warning: { start: '#F59E0B', end: '#D97706' },  // Amber
      danger: { start: '#EF4444', end: '#DC2626' },   // Red

      background: {
        primary: '#F8FAFC',   // Very light grey-blue (easier on eyes than pure white)
        secondary: '#FFFFFF', // Pure white (for clean contrast)
        tertiary: '#F1F5F9',  // Light grey for inputs/modals
        card: '#FFFFFF',      // Dedicated Card background
      },

      text: {
        primary: '#0F172A',   // Slate 900 (Deep navy, premium text color)
        secondary: '#64748B', // Slate 500
        tertiary: '#94A3B8',  // Slate 400
        inverse: '#FFFFFF',
      },

      // NEW: Premium UI Elements
      border: '#E2E8F0',      // Subtle border for light mode
      glass: 'rgba(255, 255, 255, 0.7)', // Frosted glass effect base
    },
  },
  dark: {
    mode: 'dark' as ThemeMode,
    isDark: true,
    colors: {
      primary: { start: '#6366F1', end: '#8B5CF6' }, // Indigo -> Purple (Neon glow feel)
      accent: { start: '#EC4899', end: '#DB2777' },
      success: { start: '#22C55E', end: '#16A34A' },
      warning: { start: '#F59E0B', end: '#D97706' },
      danger: { start: '#EF4444', end: '#B91C1C' },

      background: {
        primary: '#0F172A',   // Slate 900 (Rich dark blue-black)
        secondary: '#1E293B', // Slate 800 (Lighter panel color)
        tertiary: '#334155',  // Slate 700 (Inputs)
        card: '#1E293B',      // Dark Card background
      },

      text: {
        primary: '#F8FAFC',   // Slate 50
        secondary: '#CBD5E1', // Slate 300
        tertiary: '#64748B',  // Slate 500
        inverse: '#0F172A',
      },

      // NEW: Premium UI Elements
      border: '#334155',      // Subtle border for dark mode
      glass: 'rgba(30, 41, 59, 0.8)', // Dark frosted glass
    },
  },
};

type ThemeContextType = {
  theme: typeof themes.light;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState(themes.light);

  useEffect(() => {
    AsyncStorage.getItem('theme').then(saved => {
      // Default to dark mode if no preference is saved (Trendier for fintech)
      if (saved === 'dark' || !saved) {
        setTheme(themes.dark);
      } else {
        setTheme(themes.light);
      }
    });
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme.mode === 'light' ? themes.dark : themes.light;
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme.mode);
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};