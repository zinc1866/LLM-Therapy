import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import Link from 'next/link';
import { CAREERS_BY_ID } from '@/lib/forensic-quiz/careers';

type StoredSuggestion = {
  careerId: string;
  score: number;
  normalized: number;
  whyItFits: string;
};

export default async function InstructorForensicQuizPage() {
  await getServerSession(authOptions);

  // Show every student's most recent submission. (Older attempts are still
  // accessible from the per-student list further down.)
  const submissions = await prisma.forensicQuizSubmission.findMany({
    orderBy: [{ studentId: 'asc' }, { createdAt: 'desc' }],
    include: { student: { select: { id: true, name: true, email: true } } },
  });

  // Reduce to one per student (most recent), and gather counts.
  const seen = new Set<string>();
  const latest: typeof submissions = [];
  const countsByStudent: Record<string, number> = {};
  for (const s of submissions) {
    countsByStudent[s.studentId] = (countsByStudent[s.studentId] ?? 0) + 1;
    if (!seen.has(s.studentId)) {
      seen.add(s.studentId);
      latest.push(s);
    }
  }

  // Tally the most-suggested careers across the class so the instructor can
  // see at a glance where the class is gravitating.
  const tally: Record<string, number> = {};
  for (const s of latest) {
    const sugg = s.suggestions as unknown as StoredSuggestion[];
    for (const item of sugg) {
      tally[item.careerId] = (tally[item.careerId] ?? 0) + 1;
    }
  }
  const topClasswide = Object.entries(tally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Forensic Quiz — Submissions</h1>
      <p className="text-gray-600 mb-8">
        Review each student’s most recent career-quiz results. Students may have taken the quiz more than once; only the latest is shown here.
      </p>

      {latest.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No submissions yet.</p>
        </div>
      ) : (
        <>
          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-3">Most-suggested careers across the class</h2>
            <ul className="space-y-1 text-gray-700">
              {topClasswide.map(([careerId, n]) => {
                const career = CAREERS_BY_ID[careerId];
                return (
                  <li key={careerId} className="flex justify-between">
                    <span>{career?.title ?? careerId}</span>
                    <span className="text-gray-500">
                      {n} student{n === 1 ? '' : 's'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Student</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Most recent</th>
                  <th className="py-2 pr-4">Top suggestion</th>
                  <th className="py-2 pr-4">Attempts</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {latest.map((s) => {
                  const sugg = s.suggestions as unknown as StoredSuggestion[];
                  const top = sugg[0];
                  const career = top ? CAREERS_BY_ID[top.careerId] : null;
                  return (
                    <tr key={s.id} className="border-b last:border-b-0">
                      <td className="py-3 pr-4 font-medium">{s.student.name}</td>
                      <td className="py-3 pr-4 text-gray-600">{s.student.email}</td>
                      <td className="py-3 pr-4 text-gray-600">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">{career?.title ?? '—'}</td>
                      <td className="py-3 pr-4">{countsByStudent[s.studentId]}</td>
                      <td className="py-3 pr-4">
                        <Link
                          href={`/instructor/forensic-quiz/${s.id}`}
                          className="text-primary-600 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
