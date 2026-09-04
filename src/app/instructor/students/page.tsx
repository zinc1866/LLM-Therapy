import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { AssignmentManager } from '@/components/AssignmentManager';
import { StudentRoster } from '@/components/StudentRoster';

export default async function StudentsPage() {
  const session = await getServerSession(authOptions);

  // Every student, archived included — the roster needs both so past students
  // can be reviewed and restored. Pickers below filter to the active ones.
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      id: true,
      name: true,
      email: true,
      archivedAt: true,
      groupMemberships: {
        where: { group: { instructorId: session!.user.id } },
        select: { group: { select: { id: true, name: true } } },
        orderBy: { group: { name: 'asc' } },
      },
      _count: { select: { assignments: true } },
    },
    orderBy: { name: 'asc' },
  });

  const activeStudents = students.filter((s) => !s.archivedAt);

  // This instructor's groups, used for the roster filter and the assignment
  // form's "whole section at once" picker.
  const groups = await prisma.studentGroup.findMany({
    where: { instructorId: session!.user.id },
    include: {
      members: {
        where: { student: { archivedAt: null } },
        select: { studentId: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Get instructor's clients + any shared clients
  const clients = await prisma.client.findMany({
    where: {
      OR: [{ instructorId: session!.user.id }, { isShared: true }],
    },
    orderBy: { name: 'asc' },
  });

  // Existing assignments for any client this instructor can see
  const assignments = await prisma.assignment.findMany({
    where: {
      client: {
        OR: [{ instructorId: session!.user.id }, { isShared: true }],
      },
    },
    include: {
      client: { select: { id: true, name: true } },
      student: { select: { id: true, name: true, email: true } },
      sessions: {
        select: { sessionNumber: true, status: true },
        orderBy: { sessionNumber: 'asc' },
      },
    },
  });

  // Session totals per student, for the roster's "what would archiving hide"
  // context line.
  const sessionCounts = await prisma.session.groupBy({
    by: ['assignmentId'],
    _count: { _all: true },
  });
  const assignmentToStudent = new Map(
    assignments.map((a) => [a.id, a.student.id])
  );
  const sessionCountByStudent = new Map<string, number>();
  for (const row of sessionCounts) {
    const studentId = assignmentToStudent.get(row.assignmentId);
    if (!studentId) continue;
    sessionCountByStudent.set(
      studentId,
      (sessionCountByStudent.get(studentId) ?? 0) + row._count._all
    );
  }

  const groupSummaries = groups.map((g) => ({ id: g.id, name: g.name }));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Student Assignments</h1>

      <StudentRoster
        students={students.map((student) => ({
          id: student.id,
          name: student.name,
          email: student.email,
          archivedAt: student.archivedAt?.toISOString() ?? null,
          groups: student.groupMemberships.map((m) => m.group),
          assignmentCount: student._count.assignments,
          sessionCount: sessionCountByStudent.get(student.id) ?? 0,
        }))}
        groups={groupSummaries}
      />

      {clients.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">
            Create simulated clients first before assigning students.
          </p>
          <a href="/instructor/clients/new" className="btn btn-primary">
            Create a Client
          </a>
        </div>
      ) : activeStudents.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">
            No active students. Share the registration link with your students,
            or restore an archived student above.
          </p>
        </div>
      ) : (
        <AssignmentManager
          students={activeStudents.map((s) => ({
            id: s.id,
            name: s.name,
            email: s.email,
          }))}
          clients={clients}
          assignments={assignments}
          groups={groups.map((g) => ({
            id: g.id,
            name: g.name,
            studentIds: g.members.map((m) => m.studentId),
          }))}
        />
      )}
    </div>
  );
}
