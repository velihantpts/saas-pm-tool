import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — list templates for workspace
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || undefined;

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { workspaceId: workspace.id };
  if (projectId) where.projectId = projectId;

  const templates = await prisma.taskTemplate.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(templates);
}

// POST — create template
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const body = await req.json();
  const { name, description, priority, estimate, checklist, labelIds, projectId } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  const template = await prisma.taskTemplate.create({
    data: {
      name,
      description,
      priority: priority || 'NONE',
      estimate,
      checklist,
      labelIds: labelIds || [],
      workspaceId: workspace.id,
      projectId,
    },
  });

  return NextResponse.json(template, { status: 201 });
}

// PATCH — update template by templateId query param
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const templateId = searchParams.get('templateId');

  if (!templateId) {
    return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
  }

  const body = await req.json();
  const { name, description, priority, estimate, checklist, labelIds, projectId } = body;

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  // Verify template belongs to this workspace
  const existing = await prisma.taskTemplate.findUnique({
    where: { id: templateId },
  });

  if (!existing || existing.workspaceId !== workspace.id) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (priority !== undefined) data.priority = priority;
  if (estimate !== undefined) data.estimate = estimate;
  if (checklist !== undefined) data.checklist = checklist;
  if (labelIds !== undefined) data.labelIds = labelIds;
  if (projectId !== undefined) data.projectId = projectId;

  const template = await prisma.taskTemplate.update({
    where: { id: templateId },
    data,
  });

  return NextResponse.json(template);
}

// DELETE — delete template by templateId query param
export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const templateId = searchParams.get('templateId');

  if (!templateId) {
    return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  // Verify template belongs to this workspace
  const existing = await prisma.taskTemplate.findUnique({
    where: { id: templateId },
  });

  if (!existing || existing.workspaceId !== workspace.id) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  await prisma.taskTemplate.delete({ where: { id: templateId } });

  return NextResponse.json({ success: true });
}
