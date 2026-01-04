'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage or system preference
    const stored = localStorage.getItem('stonepath-theme') as Theme | null;
    if (stored) {
      setThemeState(stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem('stonepath-theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
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

// Theme colors - old money / vintage aesthetic
export const themeColors = {
  light: {
    // Warm cream/parchment background
    bg: '#F5F0E8',
    bgSecondary: '#EDE6DA',
    bgTertiary: '#E5DDCE',

    // Rich brown text
    text: '#2C1810',
    textSecondary: '#5C4033',
    textMuted: '#8B7355',

    // Board - warm tan like aged wood
    board: '#D4B896',
    boardLines: '#6B4423',
    boardAccent: '#8B6914',

    // Accent - burgundy/gold
    accent: '#722F37',
    accentGold: '#B8860B',

    // UI elements
    border: '#C9B896',
    cardBg: '#FDFBF7',
  },
  dark: {
    // Deep forest green study
    bg: '#0F1A14',
    bgSecondary: '#162118',
    bgTertiary: '#1D2B22',

    // Cream text
    text: '#F5F0E8',
    textSecondary: '#C9B896',
    textMuted: '#7A6B5A',

    // Board - rich green felt
    board: '#1E3A2F',
    boardLines: '#C9A962',
    boardAccent: '#D4AF37',

    // Accent - gold
    accent: '#D4AF37',
    accentGold: '#C9A962',

    // UI elements
    border: '#2D4A3A',
    cardBg: '#152019',
  },
};
