'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, MessageSquare, UserPlus, AlertTriangle, Zap, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationStore } from '@/store/use-store';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  link: string | null;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  task_assigned: Zap,
  comment: MessageSquare,
  workspace_invite: UserPlus,
  task_overdue: AlertTriangle,
  default: Bell,
};

const typeColors: Record<string, string> = {
  task_assigned: '#6366f1',
  comment: '#22d3ee',
  workspace_invite: '#10b981',
  task_overdue: '#ef4444',
  default: '#6b7280',
};

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NotificationPanel({ open, onOpenChange }: NotificationPanelProps) {
  const { slug } = useParams();
  const { setUnreadCount } = useNotificationStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${slug}/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [slug, setUnreadCount]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Poll for new notifications
  useEffect(() => {
    if (!slug) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/workspaces/${slug}/notifications?unread=true`);
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount);
        }
      } catch { /* ignore */ }
    }, 30000);
    return () => clearInterval(interval);
  }, [slug, setUnreadCount]);

  const markAsRead = async (notificationId: string) => {
    await fetch(`/api/workspaces/${slug}/notifications`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId }),
    });
    setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, read: true } : n));
    setUnreadCount(Math.max(0, notifications.filter((n) => !n.read).length - 1));
  };

  const markAllRead = async () => {
    await fetch(`/api/workspaces/${slug}/notifications`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-sm p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Bell size={16} />
              Notifications
            </SheetTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={markAllRead}>
              <CheckCheck size={12} /> Mark all read
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-2">
            <AnimatePresence>
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type] || typeIcons.default;
                const color = typeColors[notification.type] || typeColors.default;

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      'flex gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                      notification.read ? 'opacity-60' : 'bg-primary/5 hover:bg-primary/10',
                    )}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `${color}15`, color }}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{notification.title}</p>
                      {notification.message && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(notification.createdAt)}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {!loading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell size={32} className="mb-3 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
