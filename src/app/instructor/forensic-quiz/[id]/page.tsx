import prisma from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CAREERS_BY_ID } from '@/lib/forensic-quiz/careers';
import { QUESTIONS } from '@/lib/forensic-quiz/questions';

type StoredSuggestion = {
  careerId: string;
  score: number;
  normalized: number;
  whyItFits: string;
};

export default async function InstructorSubmissionDetail({
  params,
}: {
  params: { id: string };
}) {
  const submission = await prisma.forensicQuizSubmission.findUnique({
    where: { id: params.id },
    include: { student: { select: { name: true, email: true } } },
  });

  if (!submission) notFound();

  const suggestions = submission.suggestions as unknown as StoredSuggestion[];
  const answers = submission.answers as Record<string, string>;

  // List the student's other attempts for quick navigation.
  const otherAttempts = await prisma.forensicQuizSubmission.findMany({
    where: { studentId: submission.studentId, NOT: { id: submission.id } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true },
  });

  return (
    <div className="max-w-4xl">
      <Link
        href="/instructor/forensic-quiz"
        className="text-sm text-primary-600 hover:underline"
      >
        &larr; Back to all submissions
      </Link>

      <h1 className="text-3xl font-bold mt-2 mb-1">
        {submission.student.name}
      </h1>
      <p className="text-gray-600 mb-8">
        {submission.student.email} · submitted {new Date(submission.createdAt).toLocaleString()}
      </p>

      {otherAttempts.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Other attempts by this student</h2>
          <ul className="space-y-1">
            {otherAttempts.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/instructor/forensic-quiz/${a.id}`}
                  className="text-primary-600 hover:underline text-sm"
                >
                  {new Date(a.createdAt).toLocaleString()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Career suggestions</h2>
      <div className="space-y-6 mb-10">
        {suggestions.map((s, i) => {
          const career = CAREERS_BY_ID[s.careerId];
          if (!career) return null;
          return (
            <div key={s.careerId} className="card">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm font-medium text-primary-600">
                  Suggestion {i + 1}
                </span>
                <span className="text-xs text-gray-400">score: {s.score.toFixed(1)}</span>
              </div>
              <h3 className="text-xl font-semibold mb-1">{career.title}</h3>
              <p className="text-gray-700 italic mb-3">{career.shortPitch}</p>
              <div className="mb-2">
                <span className="font-semibold">Why it fits this student: </span>
                <span className="text-gray-700">{s.whyItFits}</span>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="text-2xl font-bold mb-4">Answers</h2>
      <div className="card">
        <ol className="space-y-4">
          {QUESTIONS.map((q, i) => {
            const oid = answers[q.id];
            const opt = q.options.find((o) => o.id === oid);
            return (
              <li key={q.id}>
                <div className="text-sm text-gray-500">Q{i + 1}</div>
                <div className="font-medium text-gray-900">{q.prompt}</div>
                <div className="text-gray-700 mt-1">
                  &rarr; {opt?.label ?? <span className="italic text-gray-400">(no answer)</span>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
