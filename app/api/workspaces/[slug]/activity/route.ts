import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — list workspace activities
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '30');
  const entity = searchParams.get('entity');
  const userId = searchParams.get('userId');

  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

  const where: Record<string, unknown> = { workspaceId: workspace.id };
  if (entity) where.entity = entity;
  if (userId) where.userId = userId;

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, image: true } },
        task: { select: { id: true, title: true, number: true, project: { select: { key: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activity.count({ where }),
  ]);

  return NextResponse.json({ activities, total, page, totalPages: Math.ceil(total / limit) });
}
