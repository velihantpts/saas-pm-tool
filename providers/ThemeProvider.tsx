'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeCtx {
  theme: Theme;
  toggleTheme: (e?: React.MouseEvent) => void;
}

const Ctx = createContext<ThemeCtx>({ theme: 'dark', toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('nf-theme') as Theme | null;
    if (saved === 'light') {
      setTheme('light');
      document.documentElement.classList.add('light');
    }
  }, []);

  const toggleTheme = useCallback((e?: React.MouseEvent) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';

    const update = () => {
      setTheme(next);
      localStorage.setItem('nf-theme', next);
      document.documentElement.classList.toggle('light', next === 'light');
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
  }, [theme]);

  return <Ctx.Provider value={{ theme, toggleTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
