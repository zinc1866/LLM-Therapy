'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type SafeOption = { id: string; label: string };
type SafeQuestion = {
  id: string;
  prompt: string;
  helper?: string;
  options: SafeOption[];
};

export function QuizClient({ questions }: { questions: SafeQuestion[] }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = questions[index];
  const total = questions.length;
  const answered = Object.keys(answers).length;
  const allAnswered = answered === total;

  const progressPct = useMemo(
    () => Math.round((index / total) * 100),
    [index, total]
  );

  function selectOption(optionId: string) {
    setAnswers((a) => ({ ...a, [current.id]: optionId }));
  }

  function next() {
    if (index < total - 1) setIndex(index + 1);
  }

  function prev() {
    if (index > 0) setIndex(index - 1);
  }

  async function submit() {
    if (!allAnswered) {
      // Jump to the first unanswered question.
      const firstMissing = questions.findIndex((q) => !answers[q.id]);
      if (firstMissing >= 0) {
        setIndex(firstMissing);
        setError('Please answer every question before submitting.');
      }
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/forensic-quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const { id } = await res.json();
      router.push(`/student/forensic-quiz/results/${id}`);
    } catch (e: any) {
      setError(e.message || 'Something went wrong submitting the quiz.');
      setSubmitting(false);
    }
  }

  const selected = answers[current.id];

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <div className="flex justify-between items-baseline mb-2">
          <h1 className="text-2xl font-bold">Forensic Psychology Career Quiz</h1>
          <span className="text-sm text-gray-500">
            {index + 1} / {total}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-1">{current.prompt}</h2>
        {current.helper && (
          <p className="text-sm text-gray-500 mb-4">{current.helper}</p>
        )}

        <div className="space-y-2 mt-4">
          {current.options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => selectOption(opt.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  isSelected
                    ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-gray-900">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={prev}
          disabled={index === 0 || submitting}
          className="btn btn-secondary disabled:opacity-50"
        >
          Back
        </button>

        {index < total - 1 ? (
          <button
            type="button"
            onClick={next}
            disabled={!selected || submitting}
            className="btn btn-primary disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="btn btn-primary disabled:opacity-50"
          >
            {submitting ? 'Generating your suggestions…' : 'See my results'}
          </button>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500">
        {answered} of {total} answered
      </div>
    </div>
  );
}
