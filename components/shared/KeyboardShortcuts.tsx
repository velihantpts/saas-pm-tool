'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Keyboard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useShortcutsPanel, useCommandPalette } from '@/store/use-store';

const shortcuts = [
  { category: 'Navigation', items: [
    { keys: ['Ctrl', 'K'], description: 'Open Command Palette' },
    { keys: ['G', 'D'], description: 'Go to Dashboard' },
    { keys: ['G', 'P'], description: 'Go to Projects' },
    { keys: ['G', 'M'], description: 'Go to Members' },
    { keys: ['G', 'A'], description: 'Go to Analytics' },
    { keys: ['G', 'S'], description: 'Go to Settings' },
  ]},
  { category: 'Tasks', items: [
    { keys: ['C'], description: 'Create new task' },
    { keys: ['Esc'], description: 'Close modal / Cancel' },
  ]},
  { category: 'General', items: [
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['T'], description: 'Toggle theme' },
  ]},
];

export default function KeyboardShortcuts() {
  const router = useRouter();
  const { slug } = useParams();
  const { open, setOpen, toggle } = useShortcutsPanel();
  const { setOpen: setCmdOpen } = useCommandPalette();

  useEffect(() => {
    let lastKey = '';
    let lastTime = 0;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Command palette shortcut is handled in CommandPalette component
      if (isInput) return;

      const now = Date.now();
      const key = e.key.toLowerCase();
      const base = `/w/${slug}`;

      // Single key shortcuts
      if (key === '?' && !e.shiftKey) {
        e.preventDefault();
        toggle();
        return;
      }

      if (key === 't' && !e.ctrlKey && !e.metaKey) {
        // Theme toggle handled elsewhere via custom event
        document.dispatchEvent(new CustomEvent('toggle-theme'));
        return;
      }

      // G + key combos (press G, then another key within 500ms)
      if (lastKey === 'g' && now - lastTime < 500) {
        e.preventDefault();
        switch (key) {
          case 'd': router.push(base); break;
          case 'p': router.push(`${base}/projects`); break;
          case 'm': router.push(`${base}/members`); break;
          case 'a': router.push(`${base}/analytics`); break;
          case 's': router.push(`${base}/settings`); break;
        }
        lastKey = '';
        return;
      }

      lastKey = key;
      lastTime = now;
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [slug, router, toggle]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard size={18} />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {shortcuts.map((group) => (
            <div key={group.category}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {group.category}
              </h4>
              <div className="space-y-1.5">
                {group.items.map((shortcut) => (
                  <div key={shortcut.description} className="flex items-center justify-between py-1">
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((k) => (
                        <kbd key={k} className="px-2 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
