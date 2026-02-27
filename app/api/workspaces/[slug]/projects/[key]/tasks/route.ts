import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — list tasks for a specific project (Gantt/List/Calendar views)
export async function GET(req: Request, { params }: { params: Promise<{ slug: string; key: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug, key } = await params;
  const { searchParams } = new URL(req.url);

  const status = searchParams.get('status') || undefined;
  const priority = searchParams.get('priority') || undefined;
  const assigneeId = searchParams.get('assigneeId') || undefined;
  const labels = searchParams.get('labels') || undefined;
  const dueDateFrom = searchParams.get('dueDateFrom') || undefined;
  const dueDateTo = searchParams.get('dueDateTo') || undefined;
  const search = searchParams.get('search') || undefined;

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  const project = await prisma.project.findUnique({
    where: { key_workspaceId: { key, workspaceId: workspace.id } },
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    projectId: project.id,
  };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assigneeId) where.assigneeId = assigneeId;

  if (labels) {
    const labelIds = labels.split(',').filter(Boolean);
    if (labelIds.length > 0) {
      where.labels = { some: { labelId: { in: labelIds } } };
    }
  }

  if (dueDateFrom || dueDateTo) {
    where.dueDate = {};
    if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
    if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      labels: { include: { label: { select: { id: true, name: true, color: true } } } },
      column: { select: { id: true, name: true } },
      dependencies: {
        include: {
          blocker: {
            select: { id: true, title: true, number: true, status: true },
          },
        },
      },
      _count: { select: { children: true, comments: true } },
    },
    orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json(
    tasks.map((t) => ({
      ...t,
      taskId: `${project.key}-${t.number}`,
      subtaskCount: t._count.children,
      commentCount: t._count.comments,
      _count: undefined,
    }))
  );
}
