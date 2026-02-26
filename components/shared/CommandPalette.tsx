'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  FolderKanban, CheckSquare, Users, BarChart3, Settings,
  Activity, Search, Plus, LayoutDashboard, Keyboard,
  Moon, Sun, Sparkles, Zap,
} from 'lucide-react';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command';
import { useCommandPalette, useShortcutsPanel } from '@/store/use-store';
import { useTheme } from '@/providers/ThemeProvider';

interface SearchResult {
  tasks: { id: string; taskId: string; title: string; project: { key: string; color: string } }[];
  projects: { id: string; name: string; key: string; color: string }[];
}

export default function CommandPalette() {
  const router = useRouter();
  const { slug } = useParams();
  const { open, setOpen } = useCommandPalette();
  const { toggle: toggleShortcuts } = useShortcutsPanel();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ tasks: [], projects: [] });
  const [searching, setSearching] = useState(false);

  // Global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, setOpen]);

  // Search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ tasks: [], projects: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&workspace=${slug}`);
        if (res.ok) setResults(await res.json());
      } catch { /* ignore */ }
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, slug]);

  const go = useCallback((path: string) => {
    router.push(path);
    setOpen(false);
    setQuery('');
  }, [router, setOpen]);

  const base = `/w/${slug}`;

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: base },
    { icon: FolderKanban, label: 'Projects', path: `${base}/projects` },
    { icon: CheckSquare, label: 'My Tasks', path: `${base}/my-tasks` },
    { icon: Activity, label: 'Activity', path: `${base}/activity` },
    { icon: BarChart3, label: 'Analytics', path: `${base}/analytics` },
    { icon: Users, label: 'Members', path: `${base}/members` },
    { icon: Settings, label: 'Settings', path: `${base}/settings` },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search tasks, projects, or type a command..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {searching ? 'Searching...' : 'No results found.'}
        </CommandEmpty>

        {/* Search Results */}
        {results.tasks.length > 0 && (
          <CommandGroup heading="Tasks">
            {results.tasks.map((task) => (
              <CommandItem key={task.id} onSelect={() => go(`${base}/projects/${task.project.key}/board`)}>
                <CheckSquare size={14} className="mr-2 text-muted-foreground" />
                <span className="font-mono text-xs mr-2" style={{ color: task.project.color }}>{task.taskId}</span>
                <span className="truncate">{task.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.projects.length > 0 && (
          <CommandGroup heading="Projects">
            {results.projects.map((project) => (
              <CommandItem key={project.id} onSelect={() => go(`${base}/projects/${project.key}/board`)}>
                <FolderKanban size={14} className="mr-2" style={{ color: project.color }} />
                <span>{project.name}</span>
                <span className="ml-2 text-xs font-mono text-muted-foreground">{project.key}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem key={item.path} onSelect={() => go(item.path)}>
              <item.icon size={14} className="mr-2 text-muted-foreground" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Actions */}
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => { toggleTheme(); setOpen(false); }}>
            {theme === 'dark' ? <Sun size={14} className="mr-2 text-amber-400" /> : <Moon size={14} className="mr-2 text-indigo-400" />}
            <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => { toggleShortcuts(); setOpen(false); }}>
            <Keyboard size={14} className="mr-2 text-muted-foreground" />
            <span>Keyboard Shortcuts</span>
          </CommandItem>
          <CommandItem onSelect={() => go(`${base}/projects`)}>
            <Plus size={14} className="mr-2 text-muted-foreground" />
            <span>New Project</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
