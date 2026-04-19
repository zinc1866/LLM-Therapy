'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CriterionRow = {
  criterion: string;
  clientStatement: string;
};

interface Message {
  id: string;
  role: string;
  content: string;
  timestamp: Date | string;
}

interface DiagnosisDebriefProps {
  sessionId: string;
  clientName: string;
  targetDiagnosis: string | null;
  dsmCategory: string | null;
  diagnosticCriteriaMap: CriterionRow[] | null;
  messages: Message[];
  studentGuess: string | null;
}

export function DiagnosisDebrief({
  sessionId,
  clientName,
  targetDiagnosis,
  dsmCategory,
  diagnosticCriteriaMap,
  messages,
  studentGuess: initialGuess,
}: DiagnosisDebriefProps) {
  const router = useRouter();
  const [guess, setGuess] = useState(initialGuess ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState(Boolean(initialGuess));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentGuess: guess.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to record guess');
      }
      setRevealed(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record guess');
    } finally {
      setSubmitting(false);
    }
  };

  if (!revealed) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold mb-2">
            Intake with {clientName} is complete
          </h1>
          <p className="text-gray-600 mb-6">
            Before you see the diagnosis the client was designed to present,
            record your impression. Include the diagnosis you think fits best
            and a brief rationale.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="guess" className="label">
                Your diagnostic impression *
              </label>
              <textarea
                id="guess"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="e.g. Major Depressive Disorder, moderate — client reports 6+ weeks of low mood, anhedonia, early-morning awakening, fatigue, poor concentration..."
                className="input"
                rows={8}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Once submitted, you&apos;ll see the target diagnosis, the
                DSM-5-TR criteria it was built around, and the full transcript
                for comparison.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!guess.trim() || submitting}
              className="btn btn-primary disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit and Reveal Diagnosis'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold mb-1">Debrief: {clientName}</h1>
        <p className="text-gray-600 text-sm">
          Compare your impression to what the client was designed to present.
        </p>
      </div>

      {initialGuess && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">Your Impression</h2>
          <p className="whitespace-pre-wrap text-gray-800 text-sm">
            {initialGuess}
          </p>
        </div>
      )}

      <div className="card border-primary-200 bg-primary-50">
        <h2 className="text-lg font-semibold mb-2">Target Diagnosis</h2>
        {targetDiagnosis ? (
          <>
            <p className="text-xl font-bold text-primary-800">
              {targetDiagnosis}
            </p>
            {dsmCategory && (
              <p className="text-sm text-gray-600 mt-1">
                DSM-5-TR category: {dsmCategory}
              </p>
            )}
          </>
        ) : (
          <p className="text-gray-500 italic">
            No target diagnosis was set for this client.
          </p>
        )}
      </div>

      {diagnosticCriteriaMap && diagnosticCriteriaMap.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">
            Criteria the Client Was Designed to Demonstrate
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            These are the DSM-5-TR criteria the client was scripted to satisfy,
            with an example of the kind of lay-language statement they might
            have made for each. Scroll through the transcript below and look
            for where these symptoms did (or didn&apos;t) come up.
          </p>
          <ul className="space-y-3">
            {diagnosticCriteriaMap.map((row, i) => (
              <li
                key={i}
                className="border-l-4 border-primary-300 pl-3 py-1"
              >
                <p className="text-sm font-semibold text-gray-800">
                  {row.criterion}
                </p>
                <p className="text-sm text-gray-600 italic">
                  &ldquo;{row.clientStatement}&rdquo;
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Full Transcript</h2>
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No messages were exchanged in this session.
          </p>
        ) : (
          <div className="space-y-3 max-h-[32rem] overflow-y-auto">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === 'student' ? 'text-right' : 'text-left'
                }
              >
                <div
                  className={`inline-block max-w-[85%] p-3 rounded-lg ${
                    m.role === 'student'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {m.role === 'student' ? 'You (Clinician)' : clientName}
                  </p>
                  <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            router.push('/student');
            router.refresh();
          }}
          className="btn btn-primary"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
