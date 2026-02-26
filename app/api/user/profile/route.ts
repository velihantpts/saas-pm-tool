import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — get user profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      timezone: true,
      theme: true,
      lang: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

// PATCH — update user profile
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.image !== undefined) data.image = body.image;
  if (body.timezone !== undefined) data.timezone = body.timezone;
  if (body.theme !== undefined) data.theme = body.theme;
  if (body.lang !== undefined) data.lang = body.lang;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      timezone: true,
      theme: true,
      lang: true,
    },
  });

  return NextResponse.json(user);
}
