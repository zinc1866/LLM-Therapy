import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CAREERS_BY_ID } from '@/lib/forensic-quiz/careers';

type StoredSuggestion = {
  careerId: string;
  score: number;
  normalized: number;
  whyItFits: string;
};

export default async function ResultsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  const submission = await prisma.forensicQuizSubmission.findUnique({
    where: { id: params.id },
  });

  if (!submission || submission.studentId !== session!.user.id) {
    notFound();
  }

  const suggestions = submission.suggestions as unknown as StoredSuggestion[];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Forensic Psychology Career Suggestions</h1>
        <p className="text-gray-600">
          Based on your answers from {new Date(submission.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="card mb-8 bg-blue-50 border-blue-200">
        <h2 className="text-lg font-semibold mb-2 text-blue-900">How to read this</h2>
        <p className="text-blue-900 text-sm">
          These are five careers that, taken together, most closely match the pattern of interests, comfort, and skills you indicated. They are not ranked from "best" to "worst" — think of them as five doors worth peeking through.
        </p>
      </div>

      <div className="space-y-6">
        {suggestions.map((s, i) => {
          const career = CAREERS_BY_ID[s.careerId];
          if (!career) return null;
          return (
            <div key={s.careerId} className="card">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-sm font-medium text-primary-600">
                  Suggestion {i + 1}
                </span>
              </div>
              <h2 className="text-2xl font-semibold mb-2">{career.title}</h2>
              <p className="text-gray-700 italic mb-4">{career.shortPitch}</p>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-1">Why this might fit you</h3>
                <p className="text-gray-700">{s.whyItFits}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-1">What the work looks like</h3>
                <p className="text-gray-700">{career.description}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-1">Credentials typically needed</h3>
                <p className="text-gray-700">{career.credentials}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Where to learn more</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {career.resources.map((r, ri) => (
                    <li key={ri}>
                      <span className="font-medium">{r.label}</span> — {r.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex gap-3">
        <Link href="/student/forensic-quiz" className="btn btn-secondary">
          Back to quiz home
        </Link>
        <Link href="/student/forensic-quiz/take" className="btn btn-primary">
          Take the quiz again
        </Link>
      </div>
    </div>
  );
}
