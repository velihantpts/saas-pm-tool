import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — global search across tasks, projects, members
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const workspaceSlug = searchParams.get('workspace');

  if (!q || q.length < 2) return NextResponse.json({ tasks: [], projects: [], members: [] });

  const workspace = workspaceSlug
    ? await prisma.workspace.findUnique({ where: { slug: workspaceSlug } })
    : null;

  const workspaceId = workspace?.id;

  const [tasks, projects, members] = await Promise.all([
    // Search tasks
    prisma.task.findMany({
      where: {
        ...(workspaceId ? { project: { workspaceId } } : {}),
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        project: { select: { key: true, color: true, name: true } },
        assignee: { select: { id: true, name: true, image: true } },
      },
      take: 8,
      orderBy: { updatedAt: 'desc' },
    }),

    // Search projects
    prisma.project.findMany({
      where: {
        ...(workspaceId ? { workspaceId } : {}),
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { key: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
    }),

    // Search members
    workspaceId
      ? prisma.workspaceMember.findMany({
          where: {
            workspaceId,
            user: {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
          take: 5,
        })
      : [],
  ]);

  return NextResponse.json({
    tasks: tasks.map((t) => ({
      ...t,
      taskId: `${t.project.key}-${t.number}`,
    })),
    projects,
    members,
  });
}
