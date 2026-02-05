'use client';

import { useState } from 'react';
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

interface Props {
  students: Student[];
  clients: Client[];
  assignments: Assignment[];
}

export function AssignmentManager({ students, clients, assignments }: Props) {
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAssign = async () => {
    if (!selectedStudent || !selectedClient) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          clientId: selectedClient,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create assignment');
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

  // Group assignments by student
  const assignmentsByStudent = students.map((student) => ({
    student,
    assignments: assignments.filter((a) => a.student.id === student.id),
  }));

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
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="student" className="label">
              Student
            </label>
            <select
              id="student"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="input"
            >
              <option value="">Select a student...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
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
            disabled={!selectedStudent || !selectedClient || loading}
            className="btn btn-primary"
          >
            {loading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
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
          </div>
        )}
      </div>
    </div>
  );
}
