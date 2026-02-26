import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — list notifications
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get('unread') === 'true';

  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

  const where: Record<string, unknown> = {
    userId: session.user.id,
    workspaceId: workspace.id,
  };
  if (unreadOnly) where.read = false;

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, workspaceId: workspace.id, read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH — mark as read
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { notificationId, markAll } = await req.json();

  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

  if (markAll) {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, workspaceId: workspace.id, read: false },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  }

  if (notificationId) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  return NextResponse.json({ success: true });
}
