import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Define Types for Type Safety
export interface GradientColors {
  start: string;
  end: string;
}

export interface ThemePalette {
  primary: GradientColors;
  accent: GradientColors;
  success: GradientColors;
  warning: GradientColors;
  danger: GradientColors;
}

// 2. Typed Theme Definitions
export const defaultThemes: Record<string, ThemePalette> = {
  classic: {
    primary: { start: '#667eea', end: '#764ba2' },
    accent: { start: '#f093fb', end: '#f5576c' },
    success: { start: '#4facfe', end: '#00f2fe' },
    warning: { start: '#fa709a', end: '#fee140' },
    danger: { start: '#ff6b6b', end: '#ee5a52' },
  },
  ocean: {
    primary: { start: '#2193b0', end: '#6dd5ed' },
    accent: { start: '#cc2b5e', end: '#753a88' },
    success: { start: '#56ab2f', end: '#a8e063' },
    warning: { start: '#f7971e', end: '#ffd200' },
    danger: { start: '#e53935', end: '#e35d5b' },
  },
};

const KEY = 'customTheme';

// 3. Robust Storage Helpers
export const saveCustomTheme = async (themeKey: string) => {
  try {
    await AsyncStorage.setItem(KEY, themeKey);
  } catch (e) {
    console.warn("Failed to save theme preference", e);
  }
};

export const getCustomTheme = async (): Promise<keyof typeof defaultThemes> => {
  try {
    const value = await AsyncStorage.getItem(KEY);
    // Validate: Ensure the saved key actually exists in our object
    if (value && defaultThemes[value]) {
      return value;
    }
    return 'classic'; // Fallback
  } catch (e) {
    console.warn("Failed to load theme preference", e);
    return 'classic';
  }
};