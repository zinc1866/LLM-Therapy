import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// Replace a group's membership with the given set of students. The member
// editor is a checkbox list, so "here is the new roster" is the natural shape.
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
    const group = await prisma.studentGroup.findFirst({
      where: { id, instructorId: session.user.id },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found or unauthorized' },
        { status: 404 }
      );
    }

    const { studentIds } = (await request.json()) as { studentIds?: string[] };

    if (!Array.isArray(studentIds)) {
      return NextResponse.json(
        { error: 'studentIds must be an array' },
        { status: 400 }
      );
    }

    // Ignore anything that isn't an active student.
    const students = await prisma.user.findMany({
      where: { id: { in: studentIds }, role: 'STUDENT', archivedAt: null },
      select: { id: true },
    });
    const nextIds = students.map((s) => s.id);

    // Archived members aren't shown in the editor, so they'd be dropped by a
    // naive replace. Only touch the rows the instructor could actually see.
    await prisma.$transaction([
      prisma.studentGroupMember.deleteMany({
        where: {
          groupId: id,
          student: { archivedAt: null },
          studentId: { notIn: nextIds },
        },
      }),
      prisma.studentGroupMember.createMany({
        data: nextIds.map((studentId) => ({ groupId: id, studentId })),
        skipDuplicates: true,
      }),
    ]);

    const updated = await prisma.studentGroup.findUnique({
      where: { id },
      include: {
        members: {
          where: { student: { archivedAt: null } },
          include: { student: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating group members:', error);
    return NextResponse.json(
      { error: 'Failed to update group members' },
      { status: 500 }
    );
  }
}
