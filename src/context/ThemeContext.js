import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors as ThemeColors } from '../constants/theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  const toggleTheme = () => setIsDark(!isDark);

  const colors = isDark ? {
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#334155',
    primary: ThemeColors.primary,
    secondary: ThemeColors.secondary,
    accent: ThemeColors.accent,
    card: '#1E293B',
    input: '#334155',
    success: '#10B981',
    danger: '#EF4444',
  } : {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    primary: ThemeColors.primary,
    secondary: ThemeColors.secondary,
    accent: ThemeColors.accent,
    card: '#FFFFFF',
    input: '#F1F5F9',
    success: '#059669',
    danger: '#DC2626',
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Convenient hook for screens to use
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
