'use client';

import Link from 'next/link';
import {
  CheckSquare, Zap, Users, ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

import KpiWidget from '@/components/dashboard/widgets/KpiWidget';
import ActivityWidget from '@/components/dashboard/widgets/ActivityWidget';
import TaskChartWidget from '@/components/dashboard/widgets/TaskChartWidget';
import MyTasksWidget from '@/components/dashboard/widgets/MyTasksWidget';
import SprintWidget from '@/components/dashboard/widgets/SprintWidget';

// Widget IDs and their full-width status
const FULL_WIDTH_WIDGETS = new Set(['kpi', 'quickActions']);

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

interface WidgetGridProps {
  widgets: string[];
  dashboardData: DashboardData;
  slug: string;
}

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: '#6b7280',
  TODO: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  IN_REVIEW: '#8b5cf6',
  DONE: '#10b981',
  CANCELLED: '#ef4444',
};

export default function WidgetGrid({ widgets, dashboardData, slug }: WidgetGridProps) {
  const taskChartData = (dashboardData.tasksByStatus || []).map((t) => ({
    name: t.status,
    value: t.count,
    color: STATUS_COLORS[t.status] || '#6b7280',
  }));

  const activityData = (dashboardData.recentActivity || []).map((item) => ({
    id: item.id,
    action: item.action,
    entity: item.entity,
    user: { name: item.user.name, image: item.user.image },
    task: item.task
      ? { title: item.task.title, taskId: `${item.task.project.key}-${item.task.number}` }
      : null,
    createdAt: item.createdAt,
  }));

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'kpi':
        return <KpiWidget data={dashboardData.kpi} />;
      case 'quickActions':
        return <QuickActionsWidget slug={slug} members={dashboardData.kpi.members} />;
      case 'activity':
        return <ActivityWidget activities={activityData} slug={slug} />;
      case 'taskChart':
        return <TaskChartWidget data={taskChartData} />;
      case 'myTasks':
        return <MyTasksWidget tasks={dashboardData.myTasks || []} slug={slug} />;
      case 'sprintProgress':
        return <SprintWidget sprint={dashboardData.activeSprint} />;
      default:
        return null;
    }
  };

  // Separate full-width and half-width widgets
  const fullWidthWidgets = widgets.filter((id) => FULL_WIDTH_WIDGETS.has(id));
  const halfWidthWidgets = widgets.filter((id) => !FULL_WIDTH_WIDGETS.has(id));

  return (
    <div className="space-y-4">
      {/* Full-width widgets */}
      {fullWidthWidgets.map((widgetId) => (
        <div key={widgetId}>{renderWidget(widgetId)}</div>
      ))}

      {/* Half-width widgets in grid */}
      {halfWidthWidgets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {halfWidthWidgets.map((widgetId) => (
            <div key={widgetId}>{renderWidget(widgetId)}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Quick Actions Widget (inline) ─────────────────────
function QuickActionsWidget({ slug, members }: { slug: string; members: number }) {
  return (
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
            <ArrowRight
              size={14}
              className="text-muted-foreground group-hover:text-primary transition-colors"
            />
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
            <ArrowRight
              size={14}
              className="text-muted-foreground group-hover:text-primary transition-colors"
            />
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
              <p className="text-[10px] text-muted-foreground">{members || 0} members</p>
            </div>
            <ArrowRight
              size={14}
              className="text-muted-foreground group-hover:text-primary transition-colors"
            />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
