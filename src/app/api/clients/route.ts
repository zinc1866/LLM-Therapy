import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    where: { instructorId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    const client = await prisma.client.create({
      data: {
        instructorId: session.user.id,
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
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
