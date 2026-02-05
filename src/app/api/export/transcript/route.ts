import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = request.nextUrl.searchParams.get('session');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID required' },
      { status: 400 }
    );
  }

  try {
    // Build query based on user role
    const whereClause =
      session.user.role === 'INSTRUCTOR'
        ? {
            id: sessionId,
            assignment: {
              client: { instructorId: session.user.id },
            },
          }
        : {
            id: sessionId,
            assignment: {
              studentId: session.user.id,
            },
          };

    const therapySession = await prisma.session.findFirst({
      where: whereClause,
      include: {
        assignment: {
          include: {
            student: { select: { name: true, email: true } },
            client: { select: { name: true, presentingConcern: true } },
          },
        },
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!therapySession) {
      return NextResponse.json(
        { error: 'Session not found or unauthorized' },
        { status: 404 }
      );
    }

    // Format transcript
    const lines: string[] = [
      '='.repeat(60),
      'THERAPY SESSION TRANSCRIPT',
      '='.repeat(60),
      '',
      `Student: ${therapySession.assignment.student.name}`,
      `Client: ${therapySession.assignment.client.name}`,
      `Presenting Concern: ${therapySession.assignment.client.presentingConcern}`,
      `Session Number: ${therapySession.sessionNumber} of 3`,
      `Date: ${new Date(therapySession.startedAt).toLocaleString()}`,
      `Status: ${therapySession.status}`,
      therapySession.duration
        ? `Duration: ${Math.floor(therapySession.duration / 60)} minutes ${therapySession.duration % 60} seconds`
        : '',
      '',
      '-'.repeat(60),
      'TRANSCRIPT',
      '-'.repeat(60),
      '',
    ];

    for (const message of therapySession.messages) {
      const speaker =
        message.role === 'student'
          ? 'THERAPIST'
          : therapySession.assignment.client.name.toUpperCase();
      const time = new Date(message.timestamp).toLocaleTimeString();

      lines.push(`[${time}] ${speaker}:`);
      lines.push(message.content);
      lines.push('');
    }

    lines.push('-'.repeat(60));
    lines.push('END OF TRANSCRIPT');
    lines.push('-'.repeat(60));

    const transcript = lines.join('\n');

    // Return as downloadable text file
    const filename = `transcript_${therapySession.assignment.student.name.replace(/\s+/g, '_')}_${therapySession.assignment.client.name.replace(/\s+/g, '_')}_session${therapySession.sessionNumber}.txt`;

    return new NextResponse(transcript, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export transcript' },
      { status: 500 }
    );
  }
}
