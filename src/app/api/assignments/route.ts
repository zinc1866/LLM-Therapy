import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { studentId, clientId } = await request.json();

    // Verify the client is either this instructor's or shared
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        OR: [{ instructorId: session.user.id }, { isShared: true }],
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check if assignment already exists
    const existing = await prisma.assignment.findUnique({
      where: {
        studentId_clientId: {
          studentId,
          clientId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This student is already assigned to this client' },
        { status: 400 }
      );
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        studentId,
        clientId,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
