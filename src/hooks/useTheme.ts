import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'system' | 'dark' | 'light';

const STORAGE_KEY = 'job_matcher_theme_mode';

/**
 * Custom Hook: System Preference Match Media Theme Detector & Manager
 * Automatically tracks window.matchMedia('(prefers-color-scheme: dark)')
 * and enables seamless switching between system, dark, and light themes.
 */
export function useTheme() {
  // Read initial preference from localStorage, default to 'system'
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved && (saved === 'system' || saved === 'dark' || saved === 'light')) {
        return saved;
      }
    } catch (_err) {
      // Ignore storage errors
    }
    return 'system';
  });

  // Track system preference match media
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // Default to dark if SSR/unknown
  });

  // Determine actual rendered theme
  const resolvedTheme: 'dark' | 'light' = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  // Listen to system matchMedia changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Initial sync
    setSystemIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    // Modern and legacy event listener support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else if (mediaQuery.addListener) {
      // Legacy Safari / older web views
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  // Synchronize documentElement class and meta theme-color with resolvedTheme
  useEffect(() => {
    const root = document.documentElement;
    
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    // Dynamic PWA theme color update
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#0f172a' : '#ffffff');
    }
  }, [resolvedTheme]);

  // Set theme mode and persist to localStorage
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (_err) {
      // Ignore
    }
  }, []);

  // Quick toggle between system -> dark -> light -> system
  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      let next: ThemeMode;
      if (prev === 'system') {
        next = 'light';
      } else if (prev === 'light') {
        next = 'dark';
      } else {
        next = 'system';
      }
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (_err) {
        // Ignore
      }
      return next;
    });
  }, []);

  return {
    theme,
    resolvedTheme,
    systemIsDark,
    setTheme,
    toggleTheme
  };
}
