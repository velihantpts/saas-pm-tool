'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  BarChart3, CheckSquare, FolderKanban, Users, AlertTriangle,
  TrendingUp, Loader2, Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
} from 'recharts';
import { PRIORITY_CONFIG } from '@/lib/constants';

interface Analytics {
  kpi: {
    totalTasks: number;
    projects: number;
    members: number;
    overdueTasks: number;
    completedThisWeek: number;
    createdThisWeek: number;
  };
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  activityByDate: { date: string; count: number }[];
  completionTrend: { date: string; created: number; completed: number }[];
  workload: { user: { id: string; name: string | null; image: string | null } | null; taskCount: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: '#6b7280',
  TODO: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  IN_REVIEW: '#8b5cf6',
  DONE: '#10b981',
  CANCELLED: '#ef4444',
};

const kpiConfig = [
  { key: 'totalTasks', label: 'Total Tasks', icon: CheckSquare, color: '#6366f1' },
  { key: 'projects', label: 'Active Projects', icon: FolderKanban, color: '#22d3ee' },
  { key: 'members', label: 'Team Members', icon: Users, color: '#10b981' },
  { key: 'overdueTasks', label: 'Overdue', icon: AlertTriangle, color: '#ef4444' },
  { key: 'completedThisWeek', label: 'Completed (Week)', icon: TrendingUp, color: '#10b981' },
  { key: 'createdThisWeek', label: 'Created (Week)', icon: Zap, color: '#f59e0b' },
];

export default function AnalyticsPage() {
  const { slug } = useParams();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    const res = await fetch(`/api/workspaces/${slug}/analytics`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Workspace performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiConfig.map((kpi) => {
          const Icon = kpi.icon;
          const value = data.kpi[kpi.key as keyof typeof data.kpi];
          return (
            <Card key={kpi.key}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}15`, color: kpi.color }}>
                    <Icon size={14} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status — Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.tasksByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                  label={false}
                  labelLine={false}
                >
                  {data.tasksByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tasks by Priority — Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.tasksByPriority}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.tasksByPriority.map((entry) => (
                    <Cell key={entry.priority} fill={PRIORITY_CONFIG[entry.priority as keyof typeof PRIORITY_CONFIG]?.color || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Heatmap — Area Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Activity (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.activityByDate}>
                <defs>
                  <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#activityGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Trend — Line Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Task Trend (2 Weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.completionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Created" />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Workload */}
      {data.workload.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Team Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.workload.map((w, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-32 truncate">{w.user?.name || 'Unassigned'}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min((w.taskCount / Math.max(...data.workload.map((x) => x.taskCount))) * 100, 100)}%` }}
                    />
                  </div>
                  <Badge variant="secondary" className="text-xs">{w.taskCount} tasks</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
