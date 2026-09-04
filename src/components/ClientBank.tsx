'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type BankClient = {
  id: string;
  name: string;
  targetDiagnosis: string | null;
  dsmCategory: string | null;
  weekNumber: number | null;
  presentingConcern: string;
  age: number | null;
  pronouns: string | null;
  raceEthnicity: string | null;
};

type BankStudent = {
  id: string;
  name: string;
  email: string;
};

type BankGroup = {
  id: string;
  name: string;
  studentIds: string[];
};

type AssignedRecord = {
  studentId: string;
  studentName: string;
  clientId: string;
  clientName: string;
};

type SkippedRecord = {
  studentId: string;
  studentName: string;
  reason: string;
};

type Result = {
  assigned: AssignedRecord[];
  skipped: SkippedRecord[];
};

const WEEK_OPTIONS: (number | 'all')[] = ['all', 1, 2, 3, 4, 5];

export function ClientBank({
  clients,
  students,
  groups,
}: {
  clients: BankClient[];
  students: BankStudent[];
  groups: BankGroup[];
}) {
  const router = useRouter();
  const [weekFilter, setWeekFilter] = useState<number | 'all'>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<Result | null>(null);

  const visibleClients = useMemo(() => {
    if (weekFilter === 'all') return clients;
    return clients.filter((c) => c.weekNumber === weekFilter);
  }, [clients, weekFilter]);

  const visibleStudents = useMemo(() => {
    if (groupFilter === 'all') return students;
    if (groupFilter === 'ungrouped') {
      const grouped = new Set(groups.flatMap((g) => g.studentIds));
      return students.filter((s) => !grouped.has(s.id));
    }
    const memberIds = new Set(
      groups.find((g) => g.id === groupFilter)?.studentIds ?? []
    );
    return students.filter((s) => memberIds.has(s.id));
  }, [students, groups, groupFilter]);

  const toggleClient = (id: string) => {
    setSelectedClients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisibleClients = () => {
    setSelectedClients((prev) => {
      const next = new Set(prev);
      for (const c of visibleClients) next.add(c.id);
      return next;
    });
  };

  const clearVisibleClients = () => {
    setSelectedClients((prev) => {
      const next = new Set(prev);
      for (const c of visibleClients) next.delete(c.id);
      return next;
    });
  };

  // Scoped to the group filter, so "select all" while a section is showing
  // picks exactly that section. Selections survive a filter change, which is
  // what lets you build a pool out of two sections.
  const selectAllStudents = () => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      for (const s of visibleStudents) next.add(s.id);
      return next;
    });
  };

  const clearAllStudents = () => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      for (const s of visibleStudents) next.delete(s.id);
      return next;
    });
  };

  const canSubmit =
    selectedClients.size > 0 && selectedStudents.size > 0 && !submitting;

  const handleSubmit = async () => {
    setError('');
    setResult(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/assignments/random', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: Array.from(selectedStudents),
          clientIds: Array.from(selectedClients),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign clients');
      }
      setResult(data as Result);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign clients');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Week Filter */}
      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">Filter:</span>
            {WEEK_OPTIONS.map((w) => (
              <button
                key={String(w)}
                type="button"
                onClick={() => setWeekFilter(w)}
                className={`text-sm px-3 py-1 rounded-full border transition ${
                  weekFilter === w
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {w === 'all' ? 'All weeks' : `Week ${w}`}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            {visibleClients.length} shown · {clients.length} total
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Pool */}
        <div className="card lg:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Client Pool</h2>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={selectAllVisibleClients}
                className="text-primary-600 hover:underline"
              >
                Select all visible
              </button>
              <span className="text-gray-300">·</span>
              <button
                type="button"
                onClick={clearVisibleClients}
                className="text-gray-600 hover:underline"
              >
                Clear visible
              </button>
            </div>
          </div>

          {visibleClients.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              No clients match this filter.
            </p>
          ) : (
            <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
              {visibleClients.map((c) => {
                const checked = selectedClients.has(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer transition ${
                      checked
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleClient(c.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{c.name}</span>
                        {c.weekNumber && (
                          <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">
                            Week {c.weekNumber}
                          </span>
                        )}
                        {c.dsmCategory && (
                          <span className="text-xs text-gray-500">
                            {c.dsmCategory}
                          </span>
                        )}
                      </div>
                      {c.targetDiagnosis && (
                        <p className="text-xs text-gray-600 italic mt-0.5">
                          Target: {c.targetDiagnosis}
                        </p>
                      )}
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                        {c.presentingConcern}
                      </p>
                      <div className="flex gap-3 text-xs text-gray-500 mt-1">
                        {c.age !== null && <span>Age {c.age}</span>}
                        {c.pronouns && <span>{c.pronouns}</span>}
                        {c.raceEthnicity && <span>{c.raceEthnicity}</span>}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Student Picker */}
        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Students</h2>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={selectAllStudents}
                className="text-primary-600 hover:underline"
              >
                Select all
              </button>
              <span className="text-gray-300">·</span>
              <button
                type="button"
                onClick={clearAllStudents}
                className="text-gray-600 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          {groups.length > 0 && (
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="input mb-3 text-sm"
              aria-label="Filter students by group"
            >
              <option value="all">All students ({students.length})</option>
              <option value="ungrouped">Ungrouped</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.studentIds.length})
                </option>
              ))}
            </select>
          )}

          {visibleStudents.length === 0 && (
            <p className="text-sm text-gray-500 py-6 text-center">
              No active students in this group.
            </p>
          )}

          <div className="space-y-1 max-h-[32rem] overflow-y-auto pr-1">
            {visibleStudents.map((s) => {
              const checked = selectedStudents.has(s.id);
              return (
                <label
                  key={s.id}
                  className={`flex items-center gap-3 border rounded-lg p-2 cursor-pointer transition ${
                    checked
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleStudent(s.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {s.email}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="card bg-gray-50 sticky bottom-4 z-10 shadow-md">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="text-sm text-gray-700">
            <strong>{selectedClients.size}</strong> client
            {selectedClients.size === 1 ? '' : 's'} in pool ·{' '}
            <strong>{selectedStudents.size}</strong> student
            {selectedStudents.size === 1 ? '' : 's'} selected
          </div>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Assigning...' : 'Randomly Assign'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Each selected student gets one randomly chosen client from the pool —
          no two students in this batch will share a client. If the pool is
          smaller than the number of students, the extras are skipped.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      {/* Result */}
      {result && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-3">Assignment Results</h2>
          {result.assigned.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-sm text-green-700 mb-2">
                Assigned ({result.assigned.length})
              </h3>
              <ul className="space-y-1 text-sm">
                {result.assigned.map((a) => (
                  <li
                    key={`${a.studentId}:${a.clientId}`}
                    className="flex items-center gap-2"
                  >
                    <span className="text-green-600">✓</span>
                    <span className="font-medium">{a.studentName}</span>
                    <span className="text-gray-400">→</span>
                    <span>{a.clientName}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.skipped.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-amber-700 mb-2">
                Skipped ({result.skipped.length})
              </h3>
              <ul className="space-y-1 text-sm">
                {result.skipped.map((s) => (
                  <li key={s.studentId} className="flex items-center gap-2">
                    <span className="text-amber-600">!</span>
                    <span className="font-medium">{s.studentName}</span>
                    <span className="text-gray-500">— {s.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
