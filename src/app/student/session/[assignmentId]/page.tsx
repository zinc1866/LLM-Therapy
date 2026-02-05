import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { SessionInterface } from '@/components/SessionInterface';

export default async function SessionPage({
  params,
}: {
  params: { assignmentId: string };
}) {
  const session = await getServerSession(authOptions);
  const { assignmentId } = params;

  // Get assignment with client info
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      studentId: session!.user.id,
    },
    include: {
      client: {
        select: {
          name: true,
          presentingConcern: true,
        },
      },
      sessions: {
        orderBy: { sessionNumber: 'asc' },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
          },
        },
      },
    },
  });

  if (!assignment) {
    notFound();
  }

  // Determine current session
  const completedSessions = assignment.sessions.filter(
    (s) => s.status === 'COMPLETED'
  );
  const inProgressSession = assignment.sessions.find(
    (s) => s.status === 'IN_PROGRESS'
  );

  // If all 3 sessions complete, redirect to dashboard
  if (completedSessions.length >= 3) {
    redirect('/student');
  }

  let currentSession = inProgressSession;
  const nextSessionNumber = inProgressSession
    ? inProgressSession.sessionNumber
    : completedSessions.length + 1;

  // If no in-progress session, create one
  if (!currentSession) {
    currentSession = await prisma.session.create({
      data: {
        assignmentId: assignment.id,
        sessionNumber: nextSessionNumber,
        status: 'IN_PROGRESS',
      },
      include: {
        messages: true,
      },
    });
  }

  // Get previous sessions for context
  const previousSessions = assignment.sessions.filter(
    (s) => s.status === 'COMPLETED' && s.sessionNumber < nextSessionNumber
  );

  return (
    <SessionInterface
      sessionId={currentSession.id}
      sessionNumber={currentSession.sessionNumber}
      clientName={assignment.client.name}
      presentingConcern={assignment.client.presentingConcern}
      existingMessages={currentSession.messages}
      previousSessions={previousSessions.map((s) => ({
        sessionNumber: s.sessionNumber,
        messages: s.messages,
      }))}
    />
  );
}
