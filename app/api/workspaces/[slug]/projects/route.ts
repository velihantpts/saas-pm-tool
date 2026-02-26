import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DEFAULT_COLUMNS } from '@/lib/constants';

// GET — list projects in workspace
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      members: { where: { userId: session.user.id } },
      projects: {
        where: { archived: false },
        include: {
          _count: { select: { tasks: true } },
          favorites: { where: { userId: session.user.id } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  return NextResponse.json(workspace.projects.map((p) => ({
    ...p,
    taskCount: p._count.tasks,
    isFavorite: p.favorites.length > 0,
    favorites: undefined,
    _count: undefined,
  })));
}

// POST — create project
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { name, description, key, color } = await req.json();

  if (!name || !key) {
    return NextResponse.json({ error: 'Name and key are required' }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  // Check key uniqueness in workspace
  const existingProject = await prisma.project.findUnique({
    where: { key_workspaceId: { key: key.toUpperCase(), workspaceId: workspace.id } },
  });

  if (existingProject) {
    return NextResponse.json({ error: 'Project key already exists' }, { status: 409 });
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      key: key.toUpperCase(),
      color: color || '#6366f1',
      workspaceId: workspace.id,
      columns: {
        createMany: { data: DEFAULT_COLUMNS },
      },
    },
  });

  return NextResponse.json(project, { status: 201 });
}
