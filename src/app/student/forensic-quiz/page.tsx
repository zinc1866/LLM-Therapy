import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import Link from 'next/link';
import { QUESTIONS } from '@/lib/forensic-quiz/questions';

export default async function ForensicQuizLanding() {
  const session = await getServerSession(authOptions);

  const submissions = await prisma.forensicQuizSubmission.findMany({
    where: { studentId: session!.user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true },
  });

  const latest = submissions[0];

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Forensic Psychology Career Quiz</h1>
      <p className="text-gray-600 mb-8">
        A short self-reflection to help you think about possible niches in (or related to) the field of forensic psychology.
      </p>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-3">What to expect</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>{QUESTIONS.length} questions, mostly multiple choice.</li>
          <li>About 10–15 minutes.</li>
          <li>No outside research needed — answer based on your own interests and instincts.</li>
          <li>At the end, you’ll see five career suggestions tailored to your specific pattern of answers, with the kinds of credentials each path typically requires and resources to learn more.</li>
          <li>Your answers are saved to your account; your instructor can see your results.</li>
        </ul>
      </div>

      <div className="card mb-6 bg-amber-50 border-amber-200">
        <h2 className="text-lg font-semibold mb-2 text-amber-900">A note before you begin</h2>
        <p className="text-amber-900">
          This quiz is meant as a starting point for self-reflection — not a definitive career assessment. Many forensic psychology careers overlap, and people often reshape their interests several times during their training. Use the suggestions as conversation starters, not conclusions.
        </p>
      </div>

      <div className="flex gap-3 items-center">
        <Link href="/student/forensic-quiz/take" className="btn btn-primary">
          {latest ? 'Take it again' : 'Start the quiz'}
        </Link>
        {latest && (
          <Link
            href={`/student/forensic-quiz/results/${latest.id}`}
            className="btn btn-secondary"
          >
            View most recent results
          </Link>
        )}
      </div>

      {submissions.length > 1 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-3">Past attempts</h2>
          <ul className="space-y-2">
            {submissions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/student/forensic-quiz/results/${s.id}`}
                  className="text-primary-600 hover:underline"
                >
                  {new Date(s.createdAt).toLocaleString()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
