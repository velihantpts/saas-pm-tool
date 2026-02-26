import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — workspace settings
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      _count: { select: { members: true, projects: true } },
    },
  });

  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

  return NextResponse.json(workspace);
}

// PATCH — update workspace
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const body = await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.logo !== undefined) data.logo = body.logo;

  const workspace = await prisma.workspace.update({
    where: { slug },
    data,
  });

  return NextResponse.json(workspace);
}
