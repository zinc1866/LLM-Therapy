import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import Link from 'next/link';

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  const assignments = await prisma.assignment.findMany({
    where: { studentId: session!.user.id },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          presentingConcern: true,
          mode: true,
          weekNumber: true,
        },
      },
      sessions: {
        select: {
          id: true,
          sessionNumber: true,
          status: true,
          startedAt: true,
          studentGuess: true,
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
        Practice your clinical skills with your assigned clients below.
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
            const isDiagnosis = assignment.client.mode === 'DIAGNOSIS';
            const maxSessions = isDiagnosis ? 1 : 3;

            const completedSessions = assignment.sessions.filter(
              (s) => s.status === 'COMPLETED'
            );
            const inProgressSession = assignment.sessions.find(
              (s) => s.status === 'IN_PROGRESS'
            );
            const nextSessionNumber = inProgressSession
              ? inProgressSession.sessionNumber
              : completedSessions.length + 1;
            const allComplete = completedSessions.length >= maxSessions;

            // Diagnosis: awaiting-debrief state if session is done but no guess yet
            const diagnosisSession = isDiagnosis ? completedSessions[0] : null;
            const awaitingDebrief =
              isDiagnosis &&
              diagnosisSession !== null &&
              diagnosisSession !== undefined &&
              !diagnosisSession.studentGuess;
            const debriefComplete =
              isDiagnosis &&
              diagnosisSession !== null &&
              diagnosisSession !== undefined &&
              Boolean(diagnosisSession.studentGuess);

            const ctaLabel = isDiagnosis
              ? inProgressSession
                ? 'Resume Intake'
                : awaitingDebrief
                ? 'Go to Debrief'
                : debriefComplete
                ? 'Review Debrief'
                : 'Start Intake'
              : inProgressSession
              ? `Resume Session ${nextSessionNumber}`
              : `Start Session ${nextSessionNumber}`;

            const showCTA = isDiagnosis || !allComplete;

            return (
              <div key={assignment.id} className="card">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-semibold">
                        {assignment.client.name}
                      </h2>
                      {isDiagnosis ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">
                          Intake
                          {assignment.client.weekNumber
                            ? ` · Week ${assignment.client.weekNumber}`
                            : ''}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                          Therapy
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">
                      {isDiagnosis
                        ? `${assignment.client.name} has been scheduled for a 30-minute diagnostic interview. You will need to elicit the presenting concern and symptoms yourself.`
                        : assignment.client.presentingConcern}
                    </p>
                  </div>
                  {showCTA && (
                    <Link
                      href={`/student/session/${assignment.id}`}
                      className="btn btn-primary whitespace-nowrap"
                    >
                      {ctaLabel}
                    </Link>
                  )}
                </div>

                {/* Session Progress */}
                <div className="mt-4 flex gap-3">
                  {isDiagnosis ? (
                    <div
                      className={`flex-1 p-3 rounded-lg text-center ${
                        debriefComplete
                          ? 'bg-green-100 text-green-700'
                          : awaitingDebrief
                          ? 'bg-amber-100 text-amber-800'
                          : inProgressSession
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <div className="text-sm font-medium">Intake</div>
                      <div className="text-xs mt-1">
                        {debriefComplete
                          ? 'Debrief complete'
                          : awaitingDebrief
                          ? 'Awaiting debrief'
                          : inProgressSession
                          ? 'In progress'
                          : 'Not started'}
                      </div>
                    </div>
                  ) : (
                    [1, 2, 3].map((num) => {
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
                    })
                  )}
                </div>

                {!isDiagnosis && allComplete && (
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
