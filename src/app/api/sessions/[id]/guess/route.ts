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

  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { studentGuess } = (await request.json()) as {
      studentGuess?: string;
    };

    if (!studentGuess || typeof studentGuess !== 'string' || !studentGuess.trim()) {
      return NextResponse.json(
        { error: 'A diagnostic guess is required' },
        { status: 400 }
      );
    }

    // Verify the session belongs to this student and is in diagnosis mode + completed
    const therapySession = await prisma.session.findFirst({
      where: {
        id,
        assignment: {
          studentId: session.user.id,
          client: { mode: 'DIAGNOSIS' },
        },
        status: 'COMPLETED',
      },
    });

    if (!therapySession) {
      return NextResponse.json(
        { error: 'Session not found, not yours, or not eligible for a diagnostic guess' },
        { status: 404 }
      );
    }

    if (therapySession.studentGuess) {
      return NextResponse.json(
        { error: 'A diagnostic guess has already been submitted for this session' },
        { status: 400 }
      );
    }

    await prisma.session.update({
      where: { id },
      data: { studentGuess: studentGuess.trim() },
    });

    return NextResponse.json({ message: 'Guess recorded' });
  } catch (error) {
    console.error('Error recording guess:', error);
    return NextResponse.json(
      { error: 'Failed to record guess' },
      { status: 500 }
    );
  }
}
