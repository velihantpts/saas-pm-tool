import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseMentions } from '@/lib/mentions';
import { sendMentionEmail } from '@/lib/email';

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

    // Handle @mentions
    const mentionedNames = parseMentions(content);
    if (mentionedNames.length > 0) {
      const authorName = comment.author.name || 'Someone';
      const taskUrl = `/w/${slug}/tasks/${id}`;

      // Find workspace members matching mentioned names
      const workspaceMembers = await prisma.workspaceMember.findMany({
        where: { workspaceId: workspace.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              emailNotifications: true,
              notifyMentioned: true,
            },
          },
        },
      });

      for (const mentioned of mentionedNames) {
        const matchedMember = workspaceMembers.find(
          (m) => m.user.name?.toLowerCase() === mentioned.toLowerCase()
        );

        if (matchedMember && matchedMember.user.id !== session.user.id) {
          // Create notification
          if (matchedMember.user.notifyMentioned) {
            await prisma.notification.create({
              data: {
                type: 'mention',
                title: `${authorName} mentioned you`,
                message: content.slice(0, 100),
                link: taskUrl,
                userId: matchedMember.user.id,
                workspaceId: workspace.id,
              },
            });
          }

          // Send email if enabled
          if (
            matchedMember.user.emailNotifications &&
            matchedMember.user.notifyMentioned &&
            matchedMember.user.email
          ) {
            await sendMentionEmail(
              matchedMember.user.email,
              authorName,
              content.slice(0, 100),
              `${process.env.NEXT_PUBLIC_APP_URL || ''}${taskUrl}`
            );
          }
        }
      }
    }
  }

  return NextResponse.json(comment, { status: 201 });
}
