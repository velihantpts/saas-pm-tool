import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — list comments for a task
export async function GET(req: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const comments = await prisma.comment.findMany({
    where: { taskId: id },
    include: {
      author: { select: { id: true, name: true, image: true, email: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(comments);
}

// POST — create comment
export async function POST(req: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug, id } = await params;
  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      taskId: id,
      authorId: session.user.id,
    },
    include: {
      author: { select: { id: true, name: true, image: true, email: true } },
    },
  });

  // Log activity
  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (workspace) {
    await prisma.activity.create({
      data: {
        action: 'commented',
        entity: 'task',
        entityId: id,
        details: { commentId: comment.id, preview: content.slice(0, 100) },
        userId: session.user.id,
        workspaceId: workspace.id,
        taskId: id,
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
}
