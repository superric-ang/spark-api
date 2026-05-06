import React, { createContext, useContext } from 'react';
import { ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#7F77DD',
  primaryLight: '#EEEDFE',
  primaryDark: '#3C3489',
  teal: '#1D9E75',
  coral: '#D85A30',
  amber: '#BA7517',
  pink: '#D4537E',
  text: {
    primary: '#1A1A1A',
    secondary: '#666',
    tertiary: '#999'
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F7FF',
    card: '#F4F3FE'
  },
  border: '#E8E6F0',
  error: '#E24B4A',
  success: '#1D9E75'
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  small: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

interface ThemeContextType {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ colors, typography, spacing }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}