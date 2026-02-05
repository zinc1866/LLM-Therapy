import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

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
    // Verify the assignment's client belongs to this instructor
    const assignment = await prisma.assignment.findFirst({
      where: {
        id,
        client: { instructorId: session.user.id },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete assignment (cascades to sessions and messages)
    await prisma.assignment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Assignment deleted' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    );
  }
}
