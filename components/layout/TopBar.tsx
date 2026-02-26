'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Bell, Sun, Moon, Search, Plus, Command, Sparkles, Keyboard } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from 'next-auth/react';
import { useCommandPalette, useNotificationStore, useShortcutsPanel } from '@/store/use-store';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import AIPanel from '@/components/ai/AIPanel';

export default function TopBar() {
  const router = useRouter();
  const { slug } = useParams();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const { setOpen: setCmdOpen } = useCommandPalette();
  const { unreadCount } = useNotificationStore();
  const { toggle: toggleShortcuts } = useShortcutsPanel();
  const [notifOpen, setNotifOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const user = session?.user;
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?';

  return (
    <>
      <header className="sticky top-0 z-40 h-14 bg-background/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* Breadcrumb area - can be used later */}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Search (opens command palette) */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-52 justify-start text-xs text-muted-foreground gap-2 hidden sm:flex"
            onClick={() => setCmdOpen(true)}
          >
            <Search size={13} />
            Search...
            <kbd className="ml-auto text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
              <Command size={9} />K
            </kbd>
          </Button>

          {/* AI Assistant */}
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setAiOpen(true)}>
            <Sparkles size={14} className="text-purple-400" />
          </Button>

          {/* Theme Toggle */}
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={(e) => toggleTheme(e)}>
            {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-400" />}
          </Button>

          {/* Notifications */}
          <Button variant="outline" size="icon" className="h-8 w-8 relative" onClick={() => setNotifOpen(true)}>
            <Bell size={14} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 rounded-full ring-2 ring-background text-[9px] text-white font-bold flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.image || undefined} />
                  <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/w/${slug}/settings`)}>
                Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleShortcuts}>
                <Keyboard size={14} className="mr-2" /> Shortcuts
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="text-destructive">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Panels */}
      <NotificationPanel open={notifOpen} onOpenChange={setNotifOpen} />
      <AIPanel open={aiOpen} onOpenChange={setAiOpen} />
    </>
  );
}
