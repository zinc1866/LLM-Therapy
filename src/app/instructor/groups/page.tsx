import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { GroupManager } from '@/components/GroupManager';

export default async function GroupsPage() {
  const session = await getServerSession(authOptions);

  const [groups, students] = await Promise.all([
    prisma.studentGroup.findMany({
      where: { instructorId: session!.user.id },
      include: {
        members: {
          where: { student: { archivedAt: null } },
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
          orderBy: { student: { name: 'asc' } },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { role: 'STUDENT', archivedAt: null },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Student Groups</h1>
        <p className="text-gray-600 mt-2">
          Organize students into cohorts or lab sections. Groups let you filter
          rosters and select a whole section at once when assigning clients —
          every student still works with their own client.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">
            No students have registered yet. Share the registration link with
            your students, then come back to group them.
          </p>
        </div>
      ) : (
        <GroupManager
          groups={groups.map((group) => ({
            id: group.id,
            name: group.name,
            description: group.description,
            members: group.members.map((m) => m.student),
          }))}
          students={students}
        />
      )}
    </div>
  );
}
