'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FolderKanban, TrendingUp, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import WidgetGrid from '@/components/dashboard/WidgetGrid';
import WidgetSettings from '@/components/dashboard/WidgetSettings';

const DEFAULT_WIDGETS = ['kpi', 'quickActions', 'activity', 'taskChart', 'myTasks', 'sprintProgress'];

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
  tasksByStatus: { status: string; count: number }[];
  myTasks: {
    id: string;
    taskId: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    project: { key: string; color: string };
  }[];
  activeSprint: {
    id: string;
    name: string;
    endDate: string;
    totalTasks: number;
    completedTasks: number;
    totalPoints: number;
    completedPoints: number;
  } | null;
}

function getStorageKey(slug: string | string[]) {
  const s = Array.isArray(slug) ? slug[0] : slug;
  return `nf-dashboard-widgets-${s}`;
}

export default function WorkspaceDashboard() {
  const { slug } = useParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<string[]>(DEFAULT_WIDGETS);

  // Load widget preferences from localStorage
  useEffect(() => {
    if (!slug) return;
    try {
      const stored = localStorage.getItem(getStorageKey(slug));
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWidgets(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [slug]);

  const handleWidgetsChange = useCallback(
    (newWidgets: string[]) => {
      setWidgets(newWidgets);
      if (slug) {
        try {
          localStorage.setItem(getStorageKey(slug), JSON.stringify(newWidgets));
        } catch {
          // ignore storage errors
        }
      }
    },
    [slug]
  );

  const fetchDashboard = useCallback(async () => {
    if (!slug) return;

    try {
      // Fetch analytics, my tasks, and active sprint in parallel
      const [analyticsRes, tasksRes, sprintsRes] = await Promise.all([
        fetch(`/api/workspaces/${slug}/analytics`),
        fetch(`/api/workspaces/${slug}/tasks?limit=5&assignee=me`),
        fetch(`/api/workspaces/${slug}/sprints`),
      ]);

      let analytics = null;
      let myTasks: DashboardData['myTasks'] = [];
      let activeSprint: DashboardData['activeSprint'] = null;

      if (analyticsRes.ok) {
        analytics = await analyticsRes.json();
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        myTasks = Array.isArray(tasksData) ? tasksData : tasksData.tasks || [];
      }

      if (sprintsRes.ok) {
        const sprints = await sprintsRes.json();
        // Find the active sprint
        const active = Array.isArray(sprints)
          ? sprints.find(
              (s: { status?: string }) => s.status === 'ACTIVE'
            )
          : null;
        if (active) {
          activeSprint = {
            id: active.id,
            name: active.name,
            endDate: active.endDate,
            totalTasks: active.totalTasks ?? 0,
            completedTasks: active.completedTasks ?? 0,
            totalPoints: active.totalPoints ?? 0,
            completedPoints: active.completedPoints ?? 0,
          };
        }
      }

      setData({
        kpi: analytics?.kpi || {
          totalTasks: 0,
          projects: 0,
          members: 0,
          overdueTasks: 0,
          completedThisWeek: 0,
          createdThisWeek: 0,
        },
        recentActivity: analytics?.recentActivity || [],
        tasksByStatus: analytics?.tasksByStatus || [],
        myTasks,
        activeSprint,
      });
    } catch {
      // Network error fallback
      setData({
        kpi: {
          totalTasks: 0,
          projects: 0,
          members: 0,
          overdueTasks: 0,
          completedThisWeek: 0,
          createdThisWeek: 0,
        },
        recentActivity: [],
        tasksByStatus: [],
        myTasks: [],
        activeSprint: null,
      });
    }

    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Workspace <span className="font-mono text-primary">/{slug}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <WidgetSettings widgets={widgets} onChange={handleWidgetsChange} />
          <Link href={`/w/${slug}/projects`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <FolderKanban size={13} />
              Projects
            </Button>
          </Link>
          <Link href={`/w/${slug}/analytics`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <TrendingUp size={13} />
              Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Widget Grid */}
      {data && (
        <WidgetGrid
          widgets={widgets}
          dashboardData={data}
          slug={slug as string}
        />
      )}
    </div>
  );
}
