import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

type AssignedRecord = { studentId: string; studentName: string };
type SkippedRecord = {
  studentId: string;
  studentName: string;
  reason: string;
};

// Assign one client to one student, or to a whole group in a single call.
// Accepts `studentId` (single) or `studentIds` (bulk) and always answers with
// per-student results, so a partly-redundant group assignment isn't an error.
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      studentId?: string;
      studentIds?: string[];
      clientId?: string;
    };
    const { clientId } = body;

    const requestedIds = Array.isArray(body.studentIds)
      ? body.studentIds
      : body.studentId
      ? [body.studentId]
      : [];

    if (requestedIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one student is required' },
        { status: 400 }
      );
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'A client is required' },
        { status: 400 }
      );
    }

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

    // Archived students can't take on new work.
    const students = await prisma.user.findMany({
      where: { id: { in: requestedIds }, role: 'STUDENT', archivedAt: null },
      select: { id: true, name: true },
    });

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No active students found for this assignment' },
        { status: 404 }
      );
    }

    const existing = await prisma.assignment.findMany({
      where: { studentId: { in: students.map((s) => s.id) }, clientId },
      select: { studentId: true },
    });
    const alreadyAssigned = new Set(existing.map((e) => e.studentId));

    const assigned: AssignedRecord[] = [];
    const skipped: SkippedRecord[] = [];

    for (const student of students) {
      if (alreadyAssigned.has(student.id)) {
        skipped.push({
          studentId: student.id,
          studentName: student.name,
          reason: 'Already assigned to this client',
        });
        continue;
      }

      await prisma.assignment.create({
        data: { studentId: student.id, clientId },
      });

      assigned.push({ studentId: student.id, studentName: student.name });
    }

    // A single assignment that was already there is a real error for the
    // one-student form, which has nothing else to report.
    if (assigned.length === 0 && requestedIds.length === 1) {
      return NextResponse.json(
        { error: 'This student is already assigned to this client' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { assigned, skipped, clientName: client.name },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
