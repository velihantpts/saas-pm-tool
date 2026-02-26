'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, LayoutDashboard, FolderKanban, CheckSquare, BarChart3,
  Activity, Users, Settings, ChevronLeft, ChevronRight, Star,
  Zap, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useSidebarStore } from '@/store/use-store';

export default function Sidebar() {
  const { collapsed, toggle } = useSidebarStore();
  const pathname = usePathname();
  const { slug } = useParams();
  const workspaceSlug = (slug as string) || 'demo';
  const base = `/w/${workspaceSlug}`;

  const navItems = [
    { href: base, icon: LayoutDashboard, label: 'Dashboard' },
    { href: `${base}/projects`, icon: FolderKanban, label: 'Projects' },
    { href: `${base}/my-tasks`, icon: CheckSquare, label: 'My Tasks' },
    { href: `${base}/sprints`, icon: Zap, label: 'Sprints' },
    { href: `${base}/analytics`, icon: BarChart3, label: 'Analytics' },
    { href: `${base}/activity`, icon: Activity, label: 'Activity' },
    { href: `${base}/members`, icon: Users, label: 'Members' },
    { href: `${base}/settings`, icon: Settings, label: 'Settings' },
  ];

  const isActive = (href: string) => {
    if (href === base) return pathname === base;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 h-screen bg-card border-r border-border flex flex-col sidebar-transition',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border shrink-0">
        <Link href={base} className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Layers size={16} className="text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-bold text-foreground whitespace-nowrap overflow-hidden"
              >
                NexusFlow
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const content = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              <item.icon size={18} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return content;
        })}
      </nav>

      {/* Favorites Section */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-border">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
            <Star size={10} /> Favorites
          </p>
          <p className="text-xs text-muted-foreground/60">No favorite projects yet</p>
        </div>
      )}

      {/* AI Badge */}
      {!collapsed && (
        <div className="px-3 py-2 border-t border-border">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-purple-500/5 border border-purple-500/10">
            <Sparkles size={12} className="text-purple-400" />
            <span className="text-[10px] text-purple-400 font-medium">AI Powered</span>
            <Badge variant="secondary" className="text-[8px] ml-auto h-4">Beta</Badge>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-8"
          onClick={toggle}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </Button>
      </div>
    </aside>
  );
}
