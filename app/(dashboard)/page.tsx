import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function DashboardRoot() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Find user's first workspace
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { joinedAt: 'asc' },
  });

  if (membership) {
    redirect(`/w/${membership.workspace.slug}`);
  }

  // No workspace → onboarding
  redirect('/onboarding');
}
