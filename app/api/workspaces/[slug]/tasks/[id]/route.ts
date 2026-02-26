import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — task detail
export async function GET(req: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true, image: true, email: true } },
      creator: { select: { id: true, name: true, image: true } },
      project: { select: { key: true, color: true, name: true } },
      column: { select: { id: true, name: true } },
      sprint: { select: { id: true, name: true } },
      labels: { include: { label: true } },
      children: {
        include: {
          assignee: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      comments: {
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: 'asc' },
      },
      _count: { select: { children: true, comments: true, attachments: true } },
    },
  });

  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  return NextResponse.json({
    ...task,
    taskId: `${task.project.key}-${task.number}`,
  });
}

// PATCH — update task
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug, id } = await params;
  const body = await req.json();

  const { title, description, status, priority, assigneeId, columnId, dueDate, startDate, estimate, sprintId, position } = body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (status !== undefined) data.status = status;
  if (priority !== undefined) data.priority = priority;
  if (assigneeId !== undefined) data.assigneeId = assigneeId || null;
  if (columnId !== undefined) data.columnId = columnId;
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
  if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
  if (estimate !== undefined) data.estimate = estimate;
  if (sprintId !== undefined) data.sprintId = sprintId || null;
  if (position !== undefined) data.position = position;

  const task = await prisma.task.update({
    where: { id },
    data,
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      project: { select: { key: true, color: true } },
    },
  });

  // Log activity
  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (workspace) {
    await prisma.activity.create({
      data: {
        action: 'updated',
        entity: 'task',
        entityId: task.id,
        details: body,
        userId: session.user.id,
        workspaceId: workspace.id,
        taskId: task.id,
      },
    });
  }

  return NextResponse.json({ ...task, taskId: `${task.project.key}-${task.number}` });
}

// DELETE — delete task
export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  await prisma.task.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
