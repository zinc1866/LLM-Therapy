import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  if (!session || session.user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await prisma.client.findFirst({
    where: {
      id,
      instructorId: session.user.id,
    },
  });

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  return NextResponse.json(client);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  if (!session || session.user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    const mode = data.mode === 'DIAGNOSIS' ? 'DIAGNOSIS' : 'THERAPY';

    const client = await prisma.client.updateMany({
      where: {
        id,
        instructorId: session.user.id,
      },
      data: {
        name: data.name,
        presentingConcern: data.presentingConcern,
        age: data.age || null,
        pronouns: data.pronouns || null,
        genderIdentity: data.genderIdentity || null,
        raceEthnicity: data.raceEthnicity || null,
        nationality: data.nationality || null,
        sexualOrientation: data.sexualOrientation || null,
        disability: data.disability || null,
        religion: data.religion || null,
        socioeconomic: data.socioeconomic || null,
        immigrationStatus: data.immigrationStatus || null,
        indigenousIdentity: data.indigenousIdentity || null,
        veteranStatus: data.veteranStatus || null,
        fullBackstory: data.fullBackstory,
        personality: data.personality || null,
        communicationStyle: data.communicationStyle || null,
        resistanceLevel: data.resistanceLevel || 'medium',
        therapeuticGoals: data.therapeuticGoals || null,
        mode,
        targetDiagnosis: data.targetDiagnosis || null,
        dsmCategory: data.dsmCategory || null,
        weekNumber: data.weekNumber ?? null,
        diagnosticCriteriaMap: data.diagnosticCriteriaMap ?? null,
      },
    });

    if (client.count === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Client updated' });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  if (!session || session.user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await prisma.client.deleteMany({
      where: {
        id,
        instructorId: session.user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Client deleted' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
