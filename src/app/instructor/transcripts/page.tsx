import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import Link from 'next/link';

export default async function TranscriptsPage({
  searchParams,
}: {
  searchParams: { session?: string };
}) {
  const authSession = await getServerSession(authOptions);
  const params = searchParams;

  // Get all sessions for instructor's clients
  const sessions = await prisma.session.findMany({
    where: {
      assignment: {
        client: { instructorId: authSession!.user.id },
      },
    },
    include: {
      assignment: {
        include: {
          student: { select: { name: true, email: true } },
          client: { select: { name: true } },
        },
      },
      messages: {
        orderBy: { timestamp: 'asc' },
      },
    },
    orderBy: { startedAt: 'desc' },
  });

  // If a specific session is selected, show its transcript
  const selectedSession = params.session
    ? sessions.find((s) => s.id === params.session)
    : null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Session Transcripts</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session List */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">All Sessions</h2>
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-sm">No sessions yet.</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {sessions.map((sess) => (
                  <Link
                    key={sess.id}
                    href={`/instructor/transcripts?session=${sess.id}`}
                    className={`block p-3 rounded-lg transition-colors ${
                      selectedSession?.id === sess.id
                        ? 'bg-primary-100 border-primary-300 border'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {sess.assignment.student.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      with {sess.assignment.client.name}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-400">
                        Session {sess.sessionNumber}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          sess.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {sess.status === 'COMPLETED'
                          ? 'Completed'
                          : 'In Progress'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transcript View */}
        <div className="lg:col-span-2">
          <div className="card">
            {selectedSession ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedSession.assignment.student.name} -{' '}
                      {selectedSession.assignment.client.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Session {selectedSession.sessionNumber} |{' '}
                      {new Date(selectedSession.startedAt).toLocaleDateString()}{' '}
                      {new Date(selectedSession.startedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <a
                    href={`/api/export/transcript?session=${selectedSession.id}`}
                    className="btn btn-secondary text-sm"
                  >
                    Export
                  </a>
                </div>

                {selectedSession.messages.length === 0 ? (
                  <p className="text-gray-500">No messages in this session.</p>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {selectedSession.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.role === 'student'
                            ? 'bg-primary-50 ml-8'
                            : 'bg-gray-50 mr-8'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-500">
                            {message.role === 'student'
                              ? 'Therapist'
                              : 'Client'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a session from the list to view its transcript.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
