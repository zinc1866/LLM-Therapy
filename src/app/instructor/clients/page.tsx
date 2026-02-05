import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import Link from 'next/link';

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);

  const clients = await prisma.client.findMany({
    where: { instructorId: session!.user.id },
    include: {
      _count: {
        select: { assignments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Simulated Clients</h1>
        <Link href="/instructor/clients/new" className="btn btn-primary">
          Create New Client
        </Link>
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
                <h3 className="text-lg font-semibold">{client.name}</h3>
                <p className="text-gray-600 mt-1">{client.presentingConcern}</p>
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
                <Link
                  href={`/instructor/clients/${client.id}`}
                  className="btn btn-secondary text-sm"
                >
                  Edit
                </Link>
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
