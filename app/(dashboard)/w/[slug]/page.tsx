'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, CheckSquare, AlertTriangle, TrendingUp,
  FolderKanban, Users, Zap, ArrowRight, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface DashboardData {
  kpi: {
    totalTasks: number;
    projects: number;
    members: number;
    overdueTasks: number;
    completedThisWeek: number;
    createdThisWeek: number;
  };
  recentActivity: {
    id: string;
    action: string;
    entity: string;
    createdAt: string;
    user: { id: string; name: string | null; image: string | null };
    task: { id: string; title: string; number: number; project: { key: string } } | null;
  }[];
}

const kpiConfig = [
  { key: 'projects', label: 'Active Projects', icon: FolderKanban, color: '#6366f1' },
  { key: 'totalTasks', label: 'Open Tasks', icon: CheckSquare, color: '#22d3ee' },
  { key: 'overdueTasks', label: 'Overdue', icon: AlertTriangle, color: '#ef4444' },
  { key: 'completedThisWeek', label: 'Completed (Week)', icon: TrendingUp, color: '#10b981' },
];

export default function WorkspaceDashboard() {
  const { slug } = useParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    const res = await fetch(`/api/workspaces/${slug}/analytics`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Workspace <span className="font-mono text-primary">/{slug}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/w/${slug}/projects`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs"><FolderKanban size={13} />Projects</Button>
          </Link>
          <Link href={`/w/${slug}/analytics`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs"><TrendingUp size={13} />Analytics</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiConfig.map((kpi) => {
          const Icon = kpi.icon;
          const value = data?.kpi[kpi.key as keyof typeof data.kpi] ?? 0;
          return (
            <Card key={kpi.key} className="hover:-translate-y-0.5 transition-all duration-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">
                      {kpi.label}
                    </p>
                    <p className="text-3xl font-bold text-foreground">{value}</p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${kpi.color}15`, color: kpi.color }}
                  >
                    <Icon size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/w/${slug}/my-tasks`}>
          <Card className="hover:-translate-y-0.5 transition-all cursor-pointer group">
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckSquare size={16} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">My Tasks</p>
                <p className="text-[10px] text-muted-foreground">View and manage your tasks</p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href={`/w/${slug}/sprints`}>
          <Card className="hover:-translate-y-0.5 transition-all cursor-pointer group">
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Zap size={16} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sprints</p>
                <p className="text-[10px] text-muted-foreground">Manage sprint cycles</p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href={`/w/${slug}/members`}>
          <Card className="hover:-translate-y-0.5 transition-all cursor-pointer group">
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Users size={16} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Team</p>
                <p className="text-[10px] text-muted-foreground">{data?.kpi.members || 0} members</p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Recent Activity</CardTitle>
          <Link href={`/w/${slug}/activity`}>
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              View all <ArrowRight size={12} />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data?.recentActivity && data.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.slice(0, 8).map((item) => {
                const taskId = item.task ? `${item.task.project.key}-${item.task.number}` : null;
                return (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src={item.user.image || undefined} />
                      <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                        {item.user.name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-muted-foreground flex-1">
                      <span className="font-medium text-foreground">{item.user.name}</span>{' '}
                      {item.action} {item.entity}
                      {taskId && <Badge variant="outline" className="ml-1 text-[10px] font-mono">{taskId}</Badge>}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">{timeAgo(item.createdAt)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
