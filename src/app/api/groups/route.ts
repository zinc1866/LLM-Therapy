import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// List the groups this instructor owns.
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const groups = await prisma.studentGroup.findMany({
    where: { instructorId: session.user.id },
    include: {
      members: {
        where: { student: { archivedAt: null } },
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(groups);
}

// Create a group, optionally seeded with members.
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description, studentIds } = (await request.json()) as {
      name?: string;
      description?: string;
      studentIds?: string[];
    };

    const trimmedName = name?.trim();

    if (!trimmedName) {
      return NextResponse.json(
        { error: 'A group name is required' },
        { status: 400 }
      );
    }

    const duplicate = await prisma.studentGroup.findFirst({
      where: { instructorId: session.user.id, name: trimmedName },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: 'You already have a group with that name' },
        { status: 400 }
      );
    }

    const memberIds = await activeStudentIds(studentIds);

    const group = await prisma.studentGroup.create({
      data: {
        instructorId: session.user.id,
        name: trimmedName,
        description: description?.trim() || null,
        members: {
          create: memberIds.map((studentId) => ({ studentId })),
        },
      },
      include: { members: true },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}

// Keep only ids that really are active students, so a bad payload can't add
// instructors or archived accounts to a roster.
async function activeStudentIds(ids?: string[]): Promise<string[]> {
  if (!Array.isArray(ids) || ids.length === 0) return [];

  const students = await prisma.user.findMany({
    where: { id: { in: ids }, role: 'STUDENT', archivedAt: null },
    select: { id: true },
  });

  return students.map((s) => s.id);
}
