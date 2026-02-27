import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// GET — list attachments for a task
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

  const attachments = await prisma.attachment.findMany({
    where: { taskId: id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(attachments);
}

// POST — upload file attachment
export async function POST(req: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug, id: taskId } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', taskId);
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  const relativeUrl = `/uploads/${taskId}/${fileName}`;

  const attachment = await prisma.attachment.create({
    data: {
      name: file.name,
      url: relativeUrl,
      size: file.size,
      type: file.type,
      taskId,
    },
  });

  return NextResponse.json(attachment, { status: 201 });
}

// DELETE — delete attachment by attachmentId query param
export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const attachmentId = searchParams.get('attachmentId');

  if (!attachmentId) {
    return NextResponse.json({ error: 'attachmentId is required' }, { status: 400 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: { members: { where: { userId: session.user.id } } },
  });

  if (!workspace || workspace.members.length === 0) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment) {
    return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
  }

  // Delete file from disk
  try {
    const filePath = path.join(process.cwd(), 'public', attachment.url);
    await unlink(filePath);
  } catch {
    // File may not exist on disk, continue with DB deletion
  }

  // Delete DB record
  await prisma.attachment.delete({ where: { id: attachmentId } });

  return NextResponse.json({ success: true });
}
