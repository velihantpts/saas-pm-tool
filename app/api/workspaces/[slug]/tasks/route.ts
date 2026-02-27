import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — list tasks (filterable, paginated)
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { searchParams } = new URL(req.url);

  const projectKey = searchParams.get('project') || undefined;
  const status = searchParams.get('status') || undefined;
  const priority = searchParams.get('priority') || undefined;
  const assigneeParam = searchParams.get('assignee') || undefined;
  const assigneeId = assigneeParam === 'me' ? session.user.id : assigneeParam;
  const search = searchParams.get('search') || undefined;
  const label = searchParams.get('label') || undefined;
  const dueDateFrom = searchParams.get('dueDateFrom') || undefined;
  const dueDateTo = searchParams.get('dueDateTo') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    project: { workspaceId: workspace.id },
  };

  if (projectKey) where.project.key = projectKey;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assigneeId) where.assigneeId = assigneeId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (label) {
    const labelIds = label.split(',').filter(Boolean);
    if (labelIds.length > 0) {
      where.labels = { some: { labelId: { in: labelIds } } };
    }
  }
  if (dueDateFrom || dueDateTo) {
    where.dueDate = {};
    if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
    if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        project: { select: { key: true, color: true } },
        labels: { include: { label: true } },
        _count: { select: { children: true, comments: true } },
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return NextResponse.json({
    tasks: tasks.map((t) => ({
      ...t,
      taskId: `${t.project.key}-${t.number}`,
      subtaskCount: t._count.children,
      commentCount: t._count.comments,
      _count: undefined,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

// POST — create task
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const body = await req.json();
  const { title, description, projectId, status, priority, assigneeId, columnId, dueDate, estimate, parentId, sprintId } = body;

  if (!title || !projectId) {
    return NextResponse.json({ error: 'Title and projectId are required' }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  // Atomic task number increment
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { taskCounter: { increment: 1 } },
  });

  const task = await prisma.task.create({
    data: {
      title,
      description,
      number: project.taskCounter,
      status: status || 'BACKLOG',
      priority: priority || 'NONE',
      projectId,
      columnId,
      assigneeId,
      creatorId: session.user.id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimate,
      parentId,
      sprintId,
    },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      project: { select: { key: true, color: true } },
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      action: 'created',
      entity: 'task',
      entityId: task.id,
      userId: session.user.id,
      workspaceId: workspace.id,
      taskId: task.id,
    },
  });

  return NextResponse.json({
    ...task,
    taskId: `${task.project.key}-${task.number}`,
  }, { status: 201 });
}
