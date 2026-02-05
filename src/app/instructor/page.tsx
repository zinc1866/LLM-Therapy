import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import Link from 'next/link';

export default async function InstructorDashboard() {
  const session = await getServerSession(authOptions);

  // Get instructor's stats
  const [clientCount, studentCount, sessionCount] = await Promise.all([
    prisma.client.count({
      where: { instructorId: session!.user.id },
    }),
    prisma.assignment.count({
      where: {
        client: { instructorId: session!.user.id },
      },
    }),
    prisma.session.count({
      where: {
        assignment: {
          client: { instructorId: session!.user.id },
        },
      },
    }),
  ]);

  // Get recent sessions
  const recentSessions = await prisma.session.findMany({
    where: {
      assignment: {
        client: { instructorId: session!.user.id },
      },
    },
    include: {
      assignment: {
        include: {
          student: { select: { name: true } },
          client: { select: { name: true } },
        },
      },
    },
    orderBy: { startedAt: 'desc' },
    take: 5,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Instructor Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Simulated Clients
          </h3>
          <p className="text-3xl font-bold">{clientCount}</p>
          <Link
            href="/instructor/clients"
            className="text-sm text-primary-600 hover:underline"
          >
            Manage clients
          </Link>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Active Assignments
          </h3>
          <p className="text-3xl font-bold">{studentCount}</p>
          <Link
            href="/instructor/students"
            className="text-sm text-primary-600 hover:underline"
          >
            Manage students
          </Link>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Total Sessions
          </h3>
          <p className="text-3xl font-bold">{sessionCount}</p>
          <Link
            href="/instructor/transcripts"
            className="text-sm text-primary-600 hover:underline"
          >
            View transcripts
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link href="/instructor/clients/new" className="btn btn-primary">
            Create New Client
          </Link>
          <Link href="/instructor/students" className="btn btn-secondary">
            Assign Students
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
        {recentSessions.length === 0 ? (
          <p className="text-gray-500">No sessions yet.</p>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((sess) => (
              <div
                key={sess.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {sess.assignment.student.name} with{' '}
                    {sess.assignment.client.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Session {sess.sessionNumber} -{' '}
                    {sess.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                  </p>
                </div>
                <Link
                  href={`/instructor/transcripts?session=${sess.id}`}
                  className="text-sm text-primary-600 hover:underline"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
