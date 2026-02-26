import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — list columns with tasks for Kanban board
export async function GET(req: Request, { params }: { params: Promise<{ slug: string; key: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug, key } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  const project = await prisma.project.findUnique({
    where: { key_workspaceId: { key, workspaceId: workspace.id } },
    include: {
      columns: {
        orderBy: { order: 'asc' },
        include: {
          tasks: {
            where: { parentId: null },
            orderBy: { position: 'asc' },
            include: {
              assignee: { select: { id: true, name: true, image: true } },
              labels: { include: { label: true } },
              _count: { select: { children: true, comments: true } },
            },
          },
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json(project.columns.map((col) => ({
    ...col,
    tasks: col.tasks.map((t) => ({
      ...t,
      taskId: `${key}-${t.number}`,
      subtaskCount: t._count.children,
      commentCount: t._count.comments,
      _count: undefined,
    })),
  })));
}
