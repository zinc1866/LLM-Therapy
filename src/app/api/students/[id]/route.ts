import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// Archive or restore a student.
//
// Archiving is a soft delete: the account can no longer log in and drops out of
// every roster and picker, but assignments, sessions and transcripts are left
// intact so past work stays reviewable. Restoring simply clears the flag.
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  if (!session || session.user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { archived } = (await request.json()) as { archived?: boolean };

    if (typeof archived !== 'boolean') {
      return NextResponse.json(
        { error: 'archived must be true or false' },
        { status: 400 }
      );
    }

    const student = await prisma.user.findFirst({
      where: { id, role: 'STUDENT' },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { archivedAt: archived ? new Date() : null },
      select: { id: true, name: true, email: true, archivedAt: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}
