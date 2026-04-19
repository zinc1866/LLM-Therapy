import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { AssignmentManager } from '@/components/AssignmentManager';

export default async function StudentsPage() {
  const session = await getServerSession(authOptions);

  // Get all students
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Student Assignments</h1>

      {clients.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">
            Create simulated clients first before assigning students.
          </p>
          <a href="/instructor/clients/new" className="btn btn-primary">
            Create a Client
          </a>
        </div>
      ) : students.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">
            No students have registered yet. Share the registration link with
            your students.
          </p>
        </div>
      ) : (
        <AssignmentManager
          students={students}
          clients={clients}
          assignments={assignments}
        />
      )}
    </div>
  );
}
