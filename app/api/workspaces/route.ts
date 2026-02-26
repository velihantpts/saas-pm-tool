import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DEFAULT_LABELS } from '@/lib/constants';

// GET — list user's workspaces
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: { _count: { select: { members: true, projects: true } } },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  return NextResponse.json(memberships.map((m) => ({
    ...m.workspace,
    role: m.role,
    memberCount: m.workspace._count.members,
    projectCount: m.workspace._count.projects,
  })));
}

// POST — create workspace
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, slug } = await req.json();

  if (!name || !slug) {
    return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
  }

  // Validate slug
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return NextResponse.json({ error: 'Slug must be lowercase letters, numbers, and hyphens only' }, { status: 400 });
  }

  // Check uniqueness
  const existing = await prisma.workspace.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      members: {
        create: { userId: session.user.id, role: 'OWNER' },
      },
      labels: {
        createMany: { data: DEFAULT_LABELS },
      },
    },
  });

  return NextResponse.json(workspace, { status: 201 });
}
