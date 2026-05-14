import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { QUESTIONS, QUIZ_VERSION } from '@/lib/forensic-quiz/questions';
import { topCareers } from '@/lib/forensic-quiz/score';
import { personalizeSuggestions } from '@/lib/forensic-quiz/personalize';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { answers?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const answers = body.answers ?? {};

  // Validate: every question answered with a known option.
  for (const q of QUESTIONS) {
    const oid = answers[q.id];
    if (!oid) {
      return NextResponse.json(
        { error: `Missing answer for question ${q.id}` },
        { status: 400 }
      );
    }
    if (!q.options.find((o) => o.id === oid)) {
      return NextResponse.json(
        { error: `Invalid option for question ${q.id}` },
        { status: 400 }
      );
    }
  }

  const top = topCareers(answers, 5);

  let personalized;
  try {
    personalized = await personalizeSuggestions(top, answers);
  } catch (err) {
    console.error('Forensic quiz personalization failed:', err);
    return NextResponse.json(
      { error: 'Could not generate personalized suggestions. Please try again.' },
      { status: 502 }
    );
  }

  const suggestions = top.map((tc, i) => ({
    careerId: tc.careerId,
    score: tc.score,
    normalized: tc.normalized,
    whyItFits: personalized[i].whyItFits,
  }));

  const submission = await prisma.forensicQuizSubmission.create({
    data: {
      studentId: session.user.id,
      answers,
      quizVersion: QUIZ_VERSION,
      suggestions,
    },
  });

  return NextResponse.json({ id: submission.id }, { status: 201 });
}
