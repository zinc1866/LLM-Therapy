import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { SessionInterface } from '@/components/SessionInterface';
import { DiagnosisDebrief } from '@/components/DiagnosisDebrief';

type CriterionRow = { criterion: string; clientStatement: string };

function parseCriteriaMap(raw: unknown): CriterionRow[] | null {
  if (!Array.isArray(raw)) return null;
  const result: CriterionRow[] = [];
  for (const entry of raw) {
    if (
      entry &&
      typeof entry === 'object' &&
      'criterion' in entry &&
      'clientStatement' in entry &&
      typeof (entry as CriterionRow).criterion === 'string' &&
      typeof (entry as CriterionRow).clientStatement === 'string'
    ) {
      result.push(entry as CriterionRow);
    }
  }
  return result.length > 0 ? result : null;
}

export default async function SessionPage({
  params,
}: {
  params: { assignmentId: string };
}) {
  const session = await getServerSession(authOptions);
  const { assignmentId } = params;

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
          mode: true,
          targetDiagnosis: true,
          dsmCategory: true,
          diagnosticCriteriaMap: true,
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

  const isDiagnosis = assignment.client.mode === 'DIAGNOSIS';
  const maxSessions = isDiagnosis ? 1 : 3;

  const completedSessions = assignment.sessions.filter(
    (s) => s.status === 'COMPLETED'
  );
  const inProgressSession = assignment.sessions.find(
    (s) => s.status === 'IN_PROGRESS'
  );

  // Diagnosis mode: single session. If it's completed, show the debrief.
  if (isDiagnosis && completedSessions.length >= 1) {
    const completed = completedSessions[0];
    return (
      <DiagnosisDebrief
        sessionId={completed.id}
        clientName={assignment.client.name}
        targetDiagnosis={assignment.client.targetDiagnosis}
        dsmCategory={assignment.client.dsmCategory}
        diagnosticCriteriaMap={parseCriteriaMap(
          assignment.client.diagnosticCriteriaMap
        )}
        messages={completed.messages}
        studentGuess={completed.studentGuess}
      />
    );
  }

  // Therapy mode: bounce back to dashboard once all 3 are done.
  if (!isDiagnosis && completedSessions.length >= maxSessions) {
    redirect('/student');
  }

  let currentSession = inProgressSession;
  const nextSessionNumber = inProgressSession
    ? inProgressSession.sessionNumber
    : completedSessions.length + 1;

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
      mode={assignment.client.mode === 'DIAGNOSIS' ? 'DIAGNOSIS' : 'THERAPY'}
    />
  );
}
