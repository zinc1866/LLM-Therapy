import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import Link from 'next/link';

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);

  const clients = await prisma.client.findMany({
    where: {
      OR: [{ instructorId: session!.user.id }, { isShared: true }],
    },
    include: {
      _count: {
        select: { assignments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const ownerId = session!.user.id;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Simulated Clients</h1>
        <div className="flex gap-2">
          <Link href="/instructor/bank" className="btn btn-secondary">
            Client Bank
          </Link>
          <Link href="/instructor/clients/new" className="btn btn-primary">
            Create New Client
          </Link>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">
            You haven&apos;t created any simulated clients yet.
          </p>
          <Link href="/instructor/clients/new" className="btn btn-primary">
            Create Your First Client
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="card flex justify-between items-start"
            >
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-lg font-semibold">{client.name}</h3>
                  {client.mode === 'DIAGNOSIS' ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">
                      Diagnosis
                      {client.weekNumber ? ` · Week ${client.weekNumber}` : ''}
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                      Therapy
                    </span>
                  )}
                  {client.isShared && (
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                      Shared
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">{client.presentingConcern}</p>
                {client.mode === 'DIAGNOSIS' && client.targetDiagnosis && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Target (hidden from students): {client.targetDiagnosis}
                  </p>
                )}
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  {client.age && <span>Age: {client.age}</span>}
                  {client.pronouns && <span>Pronouns: {client.pronouns}</span>}
                  {client.raceEthnicity && <span>{client.raceEthnicity}</span>}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {client._count.assignments} student
                  {client._count.assignments !== 1 ? 's' : ''} assigned
                </p>
              </div>
              <div className="flex gap-2">
                {client.instructorId === ownerId ? (
                  <Link
                    href={`/instructor/clients/${client.id}`}
                    className="btn btn-secondary text-sm"
                  >
                    Edit
                  </Link>
                ) : (
                  <span
                    className="btn btn-secondary text-sm opacity-60 cursor-not-allowed"
                    title="Only the client's owner can edit or delete"
                  >
                    View-only
                  </span>
                )}
                <Link
                  href={`/instructor/clients/${client.id}/assign`}
                  className="btn btn-primary text-sm"
                >
                  Assign
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
