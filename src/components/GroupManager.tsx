'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export type GroupStudent = {
  id: string;
  name: string;
  email: string;
};

export type StudentGroup = {
  id: string;
  name: string;
  description: string | null;
  members: GroupStudent[];
};

interface Props {
  groups: StudentGroup[];
  students: GroupStudent[];
}

export function GroupManager({ groups, students }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Group whose membership is currently being edited, plus its pending roster.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftMembers, setDraftMembers] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const groupedStudentIds = useMemo(
    () => new Set(groups.flatMap((g) => g.members.map((m) => m.id))),
    [groups]
  );
  const ungroupedCount = students.length - groupedStudentIds.size;

  const handleCreate = async () => {
    if (!name.trim()) return;

    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create group');
      }

      setName('');
      setDescription('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (group: StudentGroup) => {
    const next = prompt('Rename group', group.name);
    if (next === null || next.trim() === group.name) return;

    setError('');

    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: next }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to rename group');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (group: StudentGroup) => {
    if (
      !confirm(
        `Delete "${group.name}"? The students stay on the platform along with all their sessions — only the group itself goes away.`
      )
    ) {
      return;
    }

    setError('');

    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete group');
      }

      if (editingId === group.id) setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const startEditing = (group: StudentGroup) => {
    setEditingId(group.id);
    setDraftMembers(new Set(group.members.map((m) => m.id)));
    setSearch('');
    setError('');
  };

  const toggleDraftMember = (studentId: string) => {
    setDraftMembers((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const handleSaveMembers = async (groupId: string) => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: Array.from(draftMembers) }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save members');
      }

      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const matchingStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query)
    );
  }, [students, search]);

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* New Group */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Create a Group</h2>
        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[16rem]">
            <label htmlFor="group-name" className="label">
              Name
            </label>
            <input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="PSY 501 - Fall 2026"
              className="input"
            />
          </div>
          <div className="flex-1 min-w-[16rem]">
            <label htmlFor="group-description" className="label">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuesday lab section"
              className="input"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>

      {/* Groups */}
      <div className="card">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-xl font-semibold">Your Groups</h2>
          <span className="text-sm text-gray-500">
            {students.length} active student{students.length === 1 ? '' : 's'} ·{' '}
            {ungroupedCount} ungrouped
          </span>
        </div>

        {groups.length === 0 ? (
          <p className="text-gray-500 py-6 text-center">
            No groups yet. Create one above to organize students into cohorts or
            lab sections.
          </p>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {group.name}{' '}
                      <span className="text-sm font-normal text-gray-500">
                        · {group.members.length} student
                        {group.members.length === 1 ? '' : 's'}
                      </span>
                    </h3>
                    {group.description && (
                      <p className="text-sm text-gray-600 mt-0.5">
                        {group.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 text-sm">
                    <button
                      onClick={() =>
                        editingId === group.id
                          ? setEditingId(null)
                          : startEditing(group)
                      }
                      className="text-primary-600 hover:underline"
                    >
                      {editingId === group.id ? 'Cancel' : 'Edit members'}
                    </button>
                    <button
                      onClick={() => handleRename(group)}
                      className="text-gray-600 hover:underline"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => handleDelete(group)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Member chips */}
                {group.members.length > 0 && editingId !== group.id && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {group.members.map((member) => (
                      <span
                        key={member.id}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        title={member.email}
                      >
                        {member.name}
                      </span>
                    ))}
                  </div>
                )}

                {group.members.length === 0 && editingId !== group.id && (
                  <p className="text-sm text-gray-500 mt-3">
                    No students in this group yet.
                  </p>
                )}

                {/* Member editor */}
                {editingId === group.id && (
                  <div className="mt-4 border-t pt-4">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search students..."
                      className="input mb-3"
                    />

                    {matchingStudents.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4 text-center">
                        No students match that search.
                      </p>
                    ) : (
                      <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                        {matchingStudents.map((student) => {
                          const checked = draftMembers.has(student.id);
                          return (
                            <label
                              key={student.id}
                              className={`flex items-center gap-3 border rounded-lg p-2 cursor-pointer transition ${
                                checked
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleDraftMember(student.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {student.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {student.email}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm text-gray-600">
                        {draftMembers.size} selected
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn btn-secondary text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveMembers(group.id)}
                          disabled={saving}
                          className="btn btn-primary text-sm disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save Members'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
