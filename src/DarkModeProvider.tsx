import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ThemePreset = 'graphite' | 'ocean' | 'ember';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  themeMode: ThemeMode;
  themePreset: ThemePreset;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: ThemeMode) => void;
  setThemePreset: (preset: ThemePreset) => void;
  toggleDarkMode: () => void;
}

const THEME_MODE_KEY = 'rf-sidebar-theme-mode';
const THEME_PRESET_KEY = 'rf-sidebar-theme-preset';
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === 'system' || value === 'light' || value === 'dark';

const isThemePreset = (value: string | null): value is ThemePreset =>
  value === 'graphite' || value === 'ocean' || value === 'ember';

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a DarkModeProvider');
  }

  return context;
}

export function useDarkMode() {
  const { resolvedTheme, toggleDarkMode } = useTheme();

  return {
    isDarkMode: resolvedTheme === 'dark',
    toggleDarkMode,
  };
}

interface DarkModeProviderProps {
  children: ReactNode;
}

export function DarkModeProvider({ children }: DarkModeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'system';
    }

    const storedMode = window.localStorage.getItem(THEME_MODE_KEY);
    return isThemeMode(storedMode) ? storedMode : 'system';
  });

  const [themePreset, setThemePreset] = useState<ThemePreset>(() => {
    if (typeof window === 'undefined') {
      return 'graphite';
    }

    const storedPreset = window.localStorage.getItem(THEME_PRESET_KEY);
    return isThemePreset(storedPreset) ? storedPreset : 'graphite';
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const resolvedTheme = themeMode === 'system' ? systemTheme : themeMode;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', onChange);

    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.dataset.theme = themePreset;
    root.style.colorScheme = resolvedTheme;
    window.localStorage.setItem(THEME_MODE_KEY, themeMode);
    window.localStorage.setItem(THEME_PRESET_KEY, themePreset);
  }, [resolvedTheme, themeMode, themePreset]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      themePreset,
      resolvedTheme,
      setThemeMode,
      setThemePreset,
      toggleDarkMode: () => {
        setThemeMode((currentMode) => {
          const activeTheme = currentMode === 'system' ? systemTheme : currentMode;
          return activeTheme === 'dark' ? 'light' : 'dark';
        });
      },
    }),
    [resolvedTheme, systemTheme, themeMode, themePreset]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
