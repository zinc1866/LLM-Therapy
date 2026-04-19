import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { ClientBank } from '@/components/ClientBank';

export default async function BankPage() {
  const session = await getServerSession(authOptions);

  const [clients, students] = await Promise.all([
    prisma.client.findMany({
      where: {
        instructorId: session!.user.id,
        mode: 'DIAGNOSIS',
      },
      select: {
        id: true,
        name: true,
        targetDiagnosis: true,
        dsmCategory: true,
        weekNumber: true,
        presentingConcern: true,
        age: true,
        pronouns: true,
        raceEthnicity: true,
      },
      orderBy: [{ weekNumber: 'asc' }, { name: 'asc' }],
    }),
    prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Client Bank</h1>
        <p className="text-gray-600 mt-2">
          Pick a pool of diagnostic intake clients, pick students, and randomly
          assign one client from the pool to each selected student.
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">
            You don&apos;t have any diagnosis clients yet. Run{' '}
            <code className="bg-gray-100 px-1 rounded">npm run db:seed</code>{' '}
            or create one manually.
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No students have registered yet.</p>
        </div>
      ) : (
        <ClientBank clients={clients} students={students} />
      )}
    </div>
  );
}
