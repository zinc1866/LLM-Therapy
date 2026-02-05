import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import Link from 'next/link';

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  // Get student's assignments with client info and session progress
  const assignments = await prisma.assignment.findMany({
    where: { studentId: session!.user.id },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          presentingConcern: true,
        },
      },
      sessions: {
        select: {
          id: true,
          sessionNumber: true,
          status: true,
          startedAt: true,
        },
        orderBy: { sessionNumber: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Welcome, {session!.user.name}</h1>
      <p className="text-gray-600 mb-8">
        Practice your therapy skills with your assigned clients below.
      </p>

      {assignments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">
            You don&apos;t have any clients assigned yet.
          </p>
          <p className="text-sm text-gray-400">
            Your instructor will assign simulated clients for you to practice
            with.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {assignments.map((assignment) => {
            // Determine next session number
            const completedSessions = assignment.sessions.filter(
              (s) => s.status === 'COMPLETED'
            ).length;
            const inProgressSession = assignment.sessions.find(
              (s) => s.status === 'IN_PROGRESS'
            );
            const nextSessionNumber = inProgressSession
              ? inProgressSession.sessionNumber
              : completedSessions + 1;
            const allComplete = completedSessions >= 3;

            return (
              <div key={assignment.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {assignment.client.name}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {assignment.client.presentingConcern}
                    </p>
                  </div>
                  {!allComplete && (
                    <Link
                      href={`/student/session/${assignment.id}`}
                      className="btn btn-primary"
                    >
                      {inProgressSession
                        ? `Resume Session ${nextSessionNumber}`
                        : `Start Session ${nextSessionNumber}`}
                    </Link>
                  )}
                </div>

                {/* Session Progress */}
                <div className="mt-4 flex gap-3">
                  {[1, 2, 3].map((num) => {
                    const sess = assignment.sessions.find(
                      (s) => s.sessionNumber === num
                    );
                    const isCompleted = sess?.status === 'COMPLETED';
                    const isInProgress = sess?.status === 'IN_PROGRESS';

                    return (
                      <div
                        key={num}
                        className={`flex-1 p-3 rounded-lg text-center ${
                          isCompleted
                            ? 'bg-green-100 text-green-700'
                            : isInProgress
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <div className="text-sm font-medium">
                          Session {num}
                        </div>
                        <div className="text-xs mt-1">
                          {isCompleted
                            ? 'Completed'
                            : isInProgress
                            ? 'In Progress'
                            : 'Not Started'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {allComplete && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                    All 3 sessions completed! You can review your transcripts.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
