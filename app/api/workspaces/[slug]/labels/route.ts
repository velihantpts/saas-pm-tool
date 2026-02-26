import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — list workspace labels
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

  const labels = await prisma.label.findMany({
    where: { workspaceId: workspace.id },
    include: { _count: { select: { tasks: true } } },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(labels);
}

// POST — create label
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { name, color } = await req.json();

  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

  const label = await prisma.label.create({
    data: { name, color: color || '#6366f1', workspaceId: workspace.id },
  });

  return NextResponse.json(label, { status: 201 });
}

// PATCH — update label
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { labelId, name, color } = await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (name !== undefined) data.name = name;
  if (color !== undefined) data.color = color;

  const label = await prisma.label.update({ where: { id: labelId }, data });

  return NextResponse.json(label);
}

// DELETE — delete label
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const labelId = searchParams.get('labelId');
  if (!labelId) return NextResponse.json({ error: 'labelId required' }, { status: 400 });

  await prisma.label.delete({ where: { id: labelId } });
  return NextResponse.json({ success: true });
}
