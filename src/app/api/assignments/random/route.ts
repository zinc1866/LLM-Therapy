import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

type AssignedRecord = {
  studentId: string;
  studentName: string;
  clientId: string;
  clientName: string;
};

type SkippedRecord = {
  studentId: string;
  studentName: string;
  reason: string;
};

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { studentIds, clientIds } = (await request.json()) as {
      studentIds?: string[];
      clientIds?: string[];
    };

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one student is required' },
        { status: 400 }
      );
    }
    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one client is required' },
        { status: 400 }
      );
    }

    // Verify all clients are either this instructor's or shared
    const clients = await prisma.client.findMany({
      where: {
        id: { in: clientIds },
        OR: [{ instructorId: session.user.id }, { isShared: true }],
      },
      select: { id: true, name: true },
    });

    if (clients.length !== clientIds.length) {
      return NextResponse.json(
        { error: 'One or more clients not found or unauthorized' },
        { status: 404 }
      );
    }

    // Verify all IDs are active (non-archived) students
    const students = await prisma.user.findMany({
      where: {
        id: { in: studentIds },
        role: 'STUDENT',
        archivedAt: null,
      },
      select: { id: true, name: true },
    });

    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: 'One or more students not found or archived' },
        { status: 404 }
      );
    }

    const studentNameById = new Map(students.map((s) => [s.id, s.name]));
    const clientNameById = new Map(clients.map((c) => [c.id, c.name]));

    // Existing assignments so we don't violate the unique constraint
    const existing = await prisma.assignment.findMany({
      where: {
        studentId: { in: studentIds },
        clientId: { in: clientIds },
      },
      select: { studentId: true, clientId: true },
    });
    const existingKey = new Set(
      existing.map((e) => `${e.studentId}:${e.clientId}`)
    );

    const assigned: AssignedRecord[] = [];
    const skipped: SkippedRecord[] = [];

    // Clients already handed out in THIS batch — used to enforce that no two
    // students in the same batch end up with the same client.
    const usedInBatch = new Set<string>();

    // Shuffle students so that when the pool is smaller than the student set,
    // it isn't always the same students at the end of the list who get skipped.
    const shuffledStudentIds = [...studentIds].sort(() => Math.random() - 0.5);

    for (const studentId of shuffledStudentIds) {
      const eligible = clientIds.filter(
        (cid) =>
          !existingKey.has(`${studentId}:${cid}`) && !usedInBatch.has(cid)
      );

      if (eligible.length === 0) {
        skipped.push({
          studentId,
          studentName: studentNameById.get(studentId) ?? studentId,
          reason:
            'No unique client left in the pool (already assigned, or claimed by another student in this batch)',
        });
        continue;
      }

      const pick = eligible[Math.floor(Math.random() * eligible.length)];

      await prisma.assignment.create({
        data: { studentId, clientId: pick },
      });

      existingKey.add(`${studentId}:${pick}`);
      usedInBatch.add(pick);

      assigned.push({
        studentId,
        studentName: studentNameById.get(studentId) ?? studentId,
        clientId: pick,
        clientName: clientNameById.get(pick) ?? pick,
      });
    }

    return NextResponse.json({ assigned, skipped });
  } catch (error) {
    console.error('Error creating random assignments:', error);
    return NextResponse.json(
      { error: 'Failed to create random assignments' },
      { status: 500 }
    );
  }
}
