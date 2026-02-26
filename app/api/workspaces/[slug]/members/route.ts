import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — list workspace members
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;

  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true, createdAt: true } },
    },
    orderBy: { joinedAt: 'asc' },
  });

  return NextResponse.json(members);
}

// POST — invite / add member
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { email, role = 'MEMBER' } = await req.json();

  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Check if already a member
    const existing = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
    });
    if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 409 });

    const member = await prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId: workspace.id, role },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });

    // Create notification for invited user
    await prisma.notification.create({
      data: {
        type: 'workspace_invite',
        title: 'Workspace Invitation',
        message: `You've been added to ${workspace.name}`,
        link: `/w/${slug}`,
        userId: user.id,
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json(member, { status: 201 });
  }

  // Create invite for non-existing user
  const invite = await prisma.workspaceInvite.create({
    data: {
      email,
      workspaceId: workspace.id,
      role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return NextResponse.json({ invite, pending: true }, { status: 201 });
}

// PATCH — update member role
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { memberId, role } = await req.json();

  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

  const member = await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });

  return NextResponse.json(member);
}

// DELETE — remove member
export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId');

  if (!memberId) return NextResponse.json({ error: 'memberId required' }, { status: 400 });

  await prisma.workspaceMember.delete({ where: { id: memberId } });

  return NextResponse.json({ success: true });
}
