'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { ACCENT_COLORS, type AccentColor } from '@/lib/constants';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeCtx {
  theme: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  accentColor: AccentColor;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: (e?: React.MouseEvent) => void;
  setAccentColor: (color: AccentColor) => void;
}

const Ctx = createContext<ThemeCtx>({
  theme: 'dark',
  resolvedTheme: 'dark',
  accentColor: 'indigo',
  setThemeMode: () => {},
  toggleTheme: () => {},
  setAccentColor: () => {},
});

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'dark' | 'light' {
  return mode === 'system' ? getSystemTheme() : mode;
}

function applyTheme(resolved: 'dark' | 'light') {
  document.documentElement.classList.toggle('light', resolved === 'light');
}

function applyAccent(color: AccentColor) {
  document.documentElement.style.setProperty('--accent-hue', String(ACCENT_COLORS[color].hue));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [accentColor, setAccentColorState] = useState<AccentColor>('indigo');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  // Initialize from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('nf-theme') as ThemeMode | null;
    const savedAccent = localStorage.getItem('nf-accent') as AccentColor | null;

    const mode = savedTheme || 'dark';
    const accent = savedAccent && ACCENT_COLORS[savedAccent] ? savedAccent : 'indigo';

    setTheme(mode);
    setAccentColorState(accent);

    const resolved = resolveTheme(mode);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    applyAccent(accent);
  }, []);

  // Listen for OS theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    const resolved = resolveTheme(mode);

    const update = () => {
      setTheme(mode);
      setResolvedTheme(resolved);
      localStorage.setItem('nf-theme', mode);
      applyTheme(resolved);
    };

    if (document.startViewTransition) {
      document.startViewTransition(update);
    } else {
      update();
    }
  }, []);

  const toggleTheme = useCallback((e?: React.MouseEvent) => {
    const next: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';

    const update = () => {
      setTheme(next);
      setResolvedTheme(next);
      localStorage.setItem('nf-theme', next);
      applyTheme(next);
    };

    if (e && document.startViewTransition) {
      const x = e.clientX;
      const y = e.clientY;
      const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const transition = document.startViewTransition(update);
      transition.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
          { duration: 500, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
        );
      });
    } else {
      update();
    }
  }, [resolvedTheme]);

  const setAccentColor = useCallback((color: AccentColor) => {
    setAccentColorState(color);
    localStorage.setItem('nf-accent', color);
    applyAccent(color);
  }, []);

  return (
    <Ctx.Provider value={{ theme, resolvedTheme, accentColor, setThemeMode, toggleTheme, setAccentColor }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
