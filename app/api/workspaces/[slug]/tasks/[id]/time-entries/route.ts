import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — list time entries for a task
export async function GET(req: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug, id } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  const timeEntries = await prisma.timeEntry.findMany({
    where: { taskId: id },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { startTime: 'desc' },
  });

  return NextResponse.json(timeEntries);
}

// POST — create time entry
export async function POST(req: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug, id } = await params;
  const body = await req.json();
  const { startTime, endTime, duration, description } = body;

  if (!startTime) {
    return NextResponse.json({ error: 'startTime is required' }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  // Calculate duration from startTime and endTime if both provided
  let calculatedDuration = duration;
  if (startTime && endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    calculatedDuration = Math.floor((end.getTime() - start.getTime()) / 1000);
  }

  const timeEntry = await prisma.timeEntry.create({
    data: {
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : undefined,
      duration: calculatedDuration,
      description,
      userId: session.user.id,
      taskId: id,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(timeEntry, { status: 201 });
}

// DELETE — delete time entry by entryId query param
export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const entryId = searchParams.get('entryId');

  if (!entryId) {
    return NextResponse.json({ error: 'entryId is required' }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  // Verify user owns the entry
  const timeEntry = await prisma.timeEntry.findUnique({
    where: { id: entryId },
  });

  if (!timeEntry) {
    return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
  }

  if (timeEntry.userId !== session.user.id) {
    return NextResponse.json({ error: 'You can only delete your own time entries' }, { status: 403 });
  }

  await prisma.timeEntry.delete({ where: { id: entryId } });

  return NextResponse.json({ success: true });
}
