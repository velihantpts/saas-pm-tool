'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <TooltipProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </TooltipProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
