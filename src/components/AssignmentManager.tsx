'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Client {
  id: string;
  name: string;
}

interface Assignment {
  id: string;
  client: { id: string; name: string };
  student: { id: string; name: string; email: string };
  sessions: { sessionNumber: number; status: string }[];
}

interface Group {
  id: string;
  name: string;
  studentIds: string[];
}

interface Props {
  students: Student[];
  clients: Client[];
  assignments: Assignment[];
  groups: Group[];
}

export function AssignmentManager({
  students,
  clients,
  assignments,
  groups,
}: Props) {
  const router = useRouter();
  const [groupFilter, setGroupFilter] = useState('all');
  const [assignWholeGroup, setAssignWholeGroup] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === groupFilter) ?? null,
    [groups, groupFilter]
  );

  // Students the filter is currently narrowed to.
  const visibleStudents = useMemo(() => {
    if (groupFilter === 'all') return students;
    if (groupFilter === 'ungrouped') {
      const grouped = new Set(groups.flatMap((g) => g.studentIds));
      return students.filter((s) => !grouped.has(s.id));
    }
    const memberIds = new Set(activeGroup?.studentIds ?? []);
    return students.filter((s) => memberIds.has(s.id));
  }, [students, groups, groupFilter, activeGroup]);

  const visibleStudentIds = useMemo(
    () => new Set(visibleStudents.map((s) => s.id)),
    [visibleStudents]
  );

  const handleGroupFilterChange = (value: string) => {
    setGroupFilter(value);
    setSelectedStudent('');
    setNotice('');
    // "Assign to everyone" only makes sense against a real group.
    if (value === 'all' || value === 'ungrouped') setAssignWholeGroup(false);
  };

  const canAssign = assignWholeGroup
    ? Boolean(selectedClient) && visibleStudents.length > 0
    : Boolean(selectedStudent && selectedClient);

  const handleAssign = async () => {
    if (!canAssign) return;

    setLoading(true);
    setError('');
    setNotice('');

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          assignWholeGroup
            ? {
                studentIds: visibleStudents.map((s) => s.id),
                clientId: selectedClient,
              }
            : { studentId: selectedStudent, clientId: selectedClient }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create assignment');
      }

      if (assignWholeGroup) {
        const parts = [
          `Assigned ${data.clientName} to ${data.assigned.length} student${
            data.assigned.length === 1 ? '' : 's'
          }`,
        ];
        if (data.skipped.length > 0) {
          parts.push(
            `${data.skipped.length} skipped (already assigned to this client)`
          );
        }
        setNotice(`${parts.join(' · ')}.`);
      }

      setSelectedStudent('');
      setSelectedClient('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (assignmentId: string) => {
    if (!confirm('Remove this assignment? Any session data will be lost.')) {
      return;
    }

    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove assignment');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Group assignments by student, honoring the group filter
  const assignmentsByStudent = visibleStudents.map((student) => ({
    student,
    assignments: assignments.filter((a) => a.student.id === student.id),
  }));

  // Assignments belonging to archived students, or to students outside the
  // current filter, still exist — count them so the list isn't silently short.
  const hiddenAssignmentCount = assignments.filter(
    (a) => !visibleStudentIds.has(a.student.id)
  ).length;

  return (
    <div className="space-y-8">
      {/* New Assignment Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        {notice && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">
            {notice}
          </div>
        )}

        {groups.length > 0 && (
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <label htmlFor="group-filter" className="text-sm text-gray-700">
              Group
            </label>
            <select
              id="group-filter"
              value={groupFilter}
              onChange={(e) => handleGroupFilterChange(e.target.value)}
              className="input w-auto"
            >
              <option value="all">All students ({students.length})</option>
              <option value="ungrouped">Ungrouped</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.studentIds.length})
                </option>
              ))}
            </select>

            {activeGroup && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={assignWholeGroup}
                  onChange={(e) => setAssignWholeGroup(e.target.checked)}
                />
                Assign to all {visibleStudents.length} student
                {visibleStudents.length === 1 ? '' : 's'} in this group
              </label>
            )}
          </div>
        )}

        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[14rem]">
            <label htmlFor="student" className="label">
              Student
            </label>
            <select
              id="student"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              disabled={assignWholeGroup}
              className="input disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">
                {assignWholeGroup
                  ? `Everyone in ${activeGroup?.name}`
                  : 'Select a student...'}
              </option>
              {visibleStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[14rem]">
            <label htmlFor="client" className="label">
              Client
            </label>
            <select
              id="client"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="input"
            >
              <option value="">Select a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAssign}
            disabled={!canAssign || loading}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Assigning...'
              : assignWholeGroup
              ? `Assign to ${visibleStudents.length}`
              : 'Assign'}
          </button>
        </div>

        {visibleStudents.length === 0 && groupFilter !== 'all' && (
          <p className="text-sm text-gray-500 mt-3">
            No active students in this group yet.
          </p>
        )}
      </div>

      {/* Current Assignments */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Current Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-gray-500">No assignments yet.</p>
        ) : (
          <div className="space-y-6">
            {assignmentsByStudent
              .filter((s) => s.assignments.length > 0)
              .map(({ student, assignments: studentAssignments }) => (
                <div key={student.id} className="border-b pb-4 last:border-0">
                  <h3 className="font-medium text-lg mb-2">
                    {student.name}{' '}
                    <span className="text-sm text-gray-500 font-normal">
                      ({student.email})
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {studentAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                      >
                        <div>
                          <span className="font-medium">
                            {assignment.client.name}
                          </span>
                          <div className="flex gap-2 mt-1">
                            {[1, 2, 3].map((num) => {
                              const session = assignment.sessions.find(
                                (s) => s.sessionNumber === num
                              );
                              return (
                                <span
                                  key={num}
                                  className={`text-xs px-2 py-1 rounded ${
                                    session?.status === 'COMPLETED'
                                      ? 'bg-green-100 text-green-700'
                                      : session?.status === 'IN_PROGRESS'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-200 text-gray-500'
                                  }`}
                                >
                                  Session {num}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemove(assignment.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {hiddenAssignmentCount > 0 && (
              <p className="text-sm text-gray-500">
                {hiddenAssignmentCount} assignment
                {hiddenAssignmentCount === 1 ? '' : 's'} hidden — belonging to
                archived students
                {groupFilter !== 'all' ? ' or students outside this group' : ''}.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
