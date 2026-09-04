'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export type RosterStudent = {
  id: string;
  name: string;
  email: string;
  archivedAt: string | null;
  groups: { id: string; name: string }[];
  assignmentCount: number;
  sessionCount: number;
};

interface Props {
  students: RosterStudent[];
  groups: { id: string; name: string }[];
}

export function StudentRoster({ students, groups }: Props) {
  const router = useRouter();
  const [showArchived, setShowArchived] = useState(false);
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const active = useMemo(
    () => students.filter((s) => !s.archivedAt),
    [students]
  );
  const archived = useMemo(
    () => students.filter((s) => s.archivedAt),
    [students]
  );

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (showArchived ? archived : active).filter((student) => {
      if (groupFilter === 'ungrouped' && student.groups.length > 0) {
        return false;
      }
      if (
        groupFilter !== 'all' &&
        groupFilter !== 'ungrouped' &&
        !student.groups.some((g) => g.id === groupFilter)
      ) {
        return false;
      }
      if (
        query &&
        !student.name.toLowerCase().includes(query) &&
        !student.email.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [showArchived, archived, active, groupFilter, search]);

  const setArchived = async (student: RosterStudent, archive: boolean) => {
    if (archive) {
      const work =
        student.sessionCount > 0
          ? `Their ${student.sessionCount} session${
              student.sessionCount === 1 ? '' : 's'
            } and all transcripts are kept.`
          : 'Nothing they have done is deleted.';

      if (
        !confirm(
          `Archive ${student.name}?\n\nThey'll no longer be able to log in and will drop off your rosters and pickers. ${work} You can restore them at any time.`
        )
      ) {
        return;
      }
    }

    setPendingId(student.id);
    setError('');

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: archive }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update student');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-xl font-semibold">
          Student Roster{' '}
          <span className="text-sm font-normal text-gray-500">
            ({active.length} active
            {archived.length > 0 ? `, ${archived.length} archived` : ''})
          </span>
        </h2>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setShowArchived(false)}
            className={`px-3 py-1 rounded-full border transition ${
              !showArchived
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setShowArchived(true)}
            className={`px-3 py-1 rounded-full border transition ${
              showArchived
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Archived ({archived.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="input flex-1 min-w-[14rem]"
        />
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="input w-auto"
          aria-label="Filter by group"
        >
          <option value="all">All groups</option>
          <option value="ungrouped">Ungrouped</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="text-gray-500 py-6 text-center">
          {showArchived
            ? 'No archived students match this filter.'
            : 'No students match this filter.'}
        </p>
      ) : (
        <div className="space-y-2">
          {visible.map((student) => (
            <div
              key={student.id}
              className="flex justify-between items-center gap-4 bg-gray-50 p-3 rounded-lg flex-wrap"
            >
              <div className="min-w-0">
                <div className="font-medium">
                  {student.name}{' '}
                  <span className="text-sm text-gray-500 font-normal">
                    ({student.email})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {student.groups.map((group) => (
                    <span
                      key={group.id}
                      className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium"
                    >
                      {group.name}
                    </span>
                  ))}
                  <span className="text-xs text-gray-500">
                    {student.assignmentCount} assignment
                    {student.assignmentCount === 1 ? '' : 's'} ·{' '}
                    {student.sessionCount} session
                    {student.sessionCount === 1 ? '' : 's'}
                  </span>
                  {student.archivedAt && (
                    <span className="text-xs text-gray-500">
                      archived{' '}
                      {new Date(student.archivedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setArchived(student, !student.archivedAt)}
                disabled={pendingId === student.id}
                className={`text-sm disabled:opacity-50 ${
                  student.archivedAt
                    ? 'text-primary-600 hover:text-primary-800'
                    : 'text-red-600 hover:text-red-800'
                }`}
              >
                {pendingId === student.id
                  ? 'Saving...'
                  : student.archivedAt
                  ? 'Restore'
                  : 'Archive'}
              </button>
            </div>
          ))}
        </div>
      )}

      {showArchived && archived.length > 0 && (
        <p className="text-xs text-gray-500 mt-4">
          Archived students keep their assignments and transcripts — those stay
          visible under Transcripts. They just can&apos;t log in or be assigned
          new clients until restored.
        </p>
      )}
    </div>
  );
}
