import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { Navigation } from '@/components/Navigation';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A student archived mid-semester keeps a valid JWT until it expires, so the
  // login check alone isn't enough — re-check on every student page load.
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { archivedAt: true },
    });

    if (user?.archivedAt) {
      redirect('/login?error=archived');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
