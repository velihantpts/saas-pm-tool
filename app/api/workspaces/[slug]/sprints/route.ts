import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendSprintStartedEmail } from '@/lib/email';

// GET — list sprints for a project
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

  const where: Record<string, unknown> = {};
  if (projectId) {
    where.projectId = projectId;
  } else {
    where.project = { workspaceId: workspace.id };
  }

  const sprints = await prisma.sprint.findMany({
    where,
    include: {
      project: { select: { id: true, name: true, key: true } },
      _count: { select: { tasks: true } },
      tasks: {
        select: { status: true, estimate: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Compute sprint stats
  const result = sprints.map((sprint) => {
    const totalTasks = sprint.tasks.length;
    const completedTasks = sprint.tasks.filter((t) => t.status === 'DONE').length;
    const totalPoints = sprint.tasks.reduce((sum, t) => sum + (t.estimate || 0), 0);
    const completedPoints = sprint.tasks.filter((t) => t.status === 'DONE').reduce((sum, t) => sum + (t.estimate || 0), 0);
    const { tasks: _, ...rest } = sprint;
    return { ...rest, totalTasks, completedTasks, totalPoints, completedPoints };
  });

  return NextResponse.json(result);
}

// POST — create sprint
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { name, goal, startDate, endDate, projectId } = await req.json();

  if (!name || !startDate || !endDate || !projectId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const sprint = await prisma.sprint.create({
    data: {
      name,
      goal,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      projectId,
    },
    include: {
      project: { select: { id: true, name: true, key: true } },
      _count: { select: { tasks: true } },
    },
  });

  // Log activity
  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (workspace) {
    await prisma.activity.create({
      data: {
        action: 'created',
        entity: 'sprint',
        entityId: sprint.id,
        details: { name: sprint.name },
        userId: session.user.id,
        workspaceId: workspace.id,
      },
    });
  }

  return NextResponse.json(sprint, { status: 201 });
}

// PATCH — update sprint (start, complete, edit)
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const body = await req.json();
  const { sprintId, ...data } = body;

  if (!sprintId) return NextResponse.json({ error: 'sprintId required' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.goal !== undefined) updateData.goal = data.goal;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
  if (data.retroNotes !== undefined) updateData.retroNotes = data.retroNotes;

  const sprint = await prisma.sprint.update({
    where: { id: sprintId },
    data: updateData,
    include: {
      project: { select: { id: true, name: true, key: true } },
      _count: { select: { tasks: true } },
    },
  });

  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (workspace) {
    await prisma.activity.create({
      data: {
        action: data.status === 'ACTIVE' ? 'started' : data.status === 'COMPLETED' ? 'completed' : 'updated',
        entity: 'sprint',
        entityId: sprint.id,
        details: { name: sprint.name, status: data.status },
        userId: session.user.id,
        workspaceId: workspace.id,
      },
    });

    // Notify workspace members when sprint starts
    if (data.status === 'ACTIVE') {
      const workspaceMembers = await prisma.workspaceMember.findMany({
        where: { workspaceId: workspace.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              emailNotifications: true,
              notifySprintStart: true,
            },
          },
        },
      });

      const sprintUrl = `/w/${slug}/sprints`;
      const projectName = sprint.project.name;

      for (const member of workspaceMembers) {
        if (member.user.notifySprintStart) {
          await prisma.notification.create({
            data: {
              type: 'sprint_started',
              title: `Sprint started: ${sprint.name}`,
              message: `Sprint "${sprint.name}" has started in project ${projectName}.`,
              link: sprintUrl,
              userId: member.user.id,
              workspaceId: workspace.id,
            },
          });
        }

        if (
          member.user.emailNotifications &&
          member.user.notifySprintStart &&
          member.user.email
        ) {
          await sendSprintStartedEmail(
            member.user.email,
            sprint.name,
            projectName,
            `${process.env.NEXT_PUBLIC_APP_URL || ''}${sprintUrl}`
          );
        }
      }
    }
  }

  return NextResponse.json(sprint);
}
