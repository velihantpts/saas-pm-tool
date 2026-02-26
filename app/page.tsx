import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LandingPage from '@/components/landing/LandingPage';

export default async function Home() {
  const session = await auth();

  // Authenticated → redirect to workspace
  if (session?.user?.id) {
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      include: { workspace: true },
      orderBy: { joinedAt: 'asc' },
    });

    if (membership) {
      redirect(`/w/${membership.workspace.slug}`);
    }
    redirect('/onboarding');
  }

  // Guest → show landing page
  return <LandingPage />;
}
