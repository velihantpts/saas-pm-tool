'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, CheckSquare, FolderKanban, MessageSquare, Users,
  Zap, Filter, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ActivityItem {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
  task: { id: string; title: string; number: number; project: { key: string } } | null;
}

const entityIcons: Record<string, typeof Activity> = {
  task: CheckSquare,
  project: FolderKanban,
  comment: MessageSquare,
  sprint: Zap,
  member: Users,
};

const actionColors: Record<string, string> = {
  created: '#10b981',
  updated: '#3b82f6',
  deleted: '#ef4444',
  commented: '#8b5cf6',
  started: '#f59e0b',
  completed: '#10b981',
};

export default function ActivityPage() {
  const { slug } = useParams();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (entityFilter !== 'all') params.set('entity', entityFilter);

    const res = await fetch(`/api/workspaces/${slug}/activity?${params}`);
    if (res.ok) {
      const data = await res.json();
      setActivities(data.activities);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  }, [slug, page, entityFilter]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  // Group activities by date
  const grouped = activities.reduce<Record<string, ActivityItem[]>>((acc, item) => {
    const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Activity Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">Track all workspace activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All</SelectItem>
              <SelectItem value="task" className="text-xs">Tasks</SelectItem>
              <SelectItem value="project" className="text-xs">Projects</SelectItem>
              <SelectItem value="sprint" className="text-xs">Sprints</SelectItem>
              <SelectItem value="comment" className="text-xs">Comments</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center py-12">
            <Activity size={40} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{date}</h3>
              <div className="space-y-1">
                <AnimatePresence>
                  {items.map((item, i) => {
                    const Icon = entityIcons[item.entity] || Activity;
                    const color = actionColors[item.action] || '#6b7280';
                    const taskId = item.task ? `${item.task.project.key}-${item.task.number}` : null;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors group"
                      >
                        <div className="relative flex flex-col items-center">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={item.user.image || undefined} />
                            <AvatarFallback className="text-[9px] font-bold">{item.user.name?.[0]}</AvatarFallback>
                          </Avatar>
                          {i < items.length - 1 && (
                            <div className="w-px flex-1 bg-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium">{item.user.name}</span>{' '}
                            <span style={{ color }} className="font-medium">{item.action}</span>{' '}
                            <span className="text-muted-foreground">{item.entity}</span>
                            {taskId && (
                              <Badge variant="outline" className="ml-1.5 text-[10px] font-mono">{taskId}</Badge>
                            )}
                            {item.task && (
                              <span className="text-muted-foreground ml-1">— {item.task.title}</span>
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(item.createdAt)}</p>
                        </div>
                        <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: `${color}15`, color }}
                        >
                          <Icon size={12} />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" className="h-8" disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={14} />
              </Button>
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" className="h-8" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
