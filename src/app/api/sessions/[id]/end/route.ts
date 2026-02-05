import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find and update the session
    const therapySession = await prisma.session.findFirst({
      where: {
        id,
        assignment: {
          studentId: session.user.id,
        },
        status: 'IN_PROGRESS',
      },
    });

    if (!therapySession) {
      return NextResponse.json(
        { error: 'Session not found or already ended' },
        { status: 404 }
      );
    }

    // Calculate duration
    const duration = Math.floor(
      (Date.now() - new Date(therapySession.startedAt).getTime()) / 1000
    );

    // Update session status
    await prisma.session.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        duration,
      },
    });

    return NextResponse.json({ message: 'Session ended successfully' });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}
