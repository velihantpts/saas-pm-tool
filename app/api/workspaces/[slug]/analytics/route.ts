import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — workspace analytics
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;

  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

  // Gather all analytics in parallel
  const [
    totalTasks,
    tasksByStatus,
    tasksByPriority,
    projects,
    members,
    recentActivity,
    overdueTasks,
    completedThisWeek,
    createdThisWeek,
  ] = await Promise.all([
    // Total tasks
    prisma.task.count({ where: { project: { workspaceId: workspace.id } } }),

    // Tasks by status
    prisma.task.groupBy({
      by: ['status'],
      where: { project: { workspaceId: workspace.id } },
      _count: true,
    }),

    // Tasks by priority
    prisma.task.groupBy({
      by: ['priority'],
      where: { project: { workspaceId: workspace.id } },
      _count: true,
    }),

    // Project count
    prisma.project.count({ where: { workspaceId: workspace.id, archived: false } }),

    // Member count
    prisma.workspaceMember.count({ where: { workspaceId: workspace.id } }),

    // Recent activity (last 7 days)
    prisma.activity.findMany({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),

    // Overdue tasks
    prisma.task.count({
      where: {
        project: { workspaceId: workspace.id },
        dueDate: { lt: new Date() },
        status: { notIn: ['DONE', 'CANCELLED'] },
      },
    }),

    // Completed this week
    prisma.task.count({
      where: {
        project: { workspaceId: workspace.id },
        status: 'DONE',
        updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),

    // Created this week
    prisma.task.count({
      where: {
        project: { workspaceId: workspace.id },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  // Build daily activity for the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dailyActivities = await prisma.activity.groupBy({
    by: ['createdAt'],
    where: {
      workspaceId: workspace.id,
      createdAt: { gte: thirtyDaysAgo },
    },
    _count: true,
  });

  // Aggregate by date
  const activityByDate: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    activityByDate[d.toISOString().split('T')[0]] = 0;
  }
  dailyActivities.forEach((a) => {
    const date = new Date(a.createdAt).toISOString().split('T')[0];
    activityByDate[date] = (activityByDate[date] || 0) + a._count;
  });

  // Task completion trend (per day for last 14 days)
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const completionActivities = await prisma.activity.findMany({
    where: {
      workspaceId: workspace.id,
      action: { in: ['created', 'updated'] },
      entity: 'task',
      createdAt: { gte: twoWeeksAgo },
    },
    select: { createdAt: true, action: true },
  });

  const completionTrend: { date: string; created: number; completed: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const dayActivities = completionActivities.filter(
      (a) => new Date(a.createdAt).toISOString().split('T')[0] === dateStr
    );
    completionTrend.push({
      date: dateStr,
      created: dayActivities.filter((a) => a.action === 'created').length,
      completed: dayActivities.filter((a) => a.action === 'updated').length,
    });
  }

  // Workload per member
  const workload = await prisma.task.groupBy({
    by: ['assigneeId'],
    where: {
      project: { workspaceId: workspace.id },
      status: { notIn: ['DONE', 'CANCELLED'] },
      assigneeId: { not: null },
    },
    _count: true,
  });

  const assigneeIds = workload.map((w) => w.assigneeId).filter(Boolean) as string[];
  const assignees = await prisma.user.findMany({
    where: { id: { in: assigneeIds } },
    select: { id: true, name: true, image: true },
  });

  const workloadData = workload.map((w) => {
    const user = assignees.find((a) => a.id === w.assigneeId);
    return { user, taskCount: w._count };
  });

  return NextResponse.json({
    kpi: {
      totalTasks,
      projects,
      members,
      overdueTasks,
      completedThisWeek,
      createdThisWeek,
    },
    tasksByStatus: tasksByStatus.map((t) => ({ status: t.status, count: t._count })),
    tasksByPriority: tasksByPriority.map((t) => ({ priority: t.priority, count: t._count })),
    recentActivity,
    activityByDate: Object.entries(activityByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    completionTrend,
    workload: workloadData,
  });
}
