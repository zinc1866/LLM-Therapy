import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// Rename a group / edit its description.
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
    const group = await prisma.studentGroup.findFirst({
      where: { id, instructorId: session.user.id },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found or unauthorized' },
        { status: 404 }
      );
    }

    const { name, description } = (await request.json()) as {
      name?: string;
      description?: string;
    };

    const trimmedName = name?.trim();

    if (name !== undefined && !trimmedName) {
      return NextResponse.json(
        { error: 'A group name is required' },
        { status: 400 }
      );
    }

    if (trimmedName && trimmedName !== group.name) {
      const duplicate = await prisma.studentGroup.findFirst({
        where: { instructorId: session.user.id, name: trimmedName },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'You already have a group with that name' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.studentGroup.update({
      where: { id },
      data: {
        ...(trimmedName ? { name: trimmedName } : {}),
        ...(description !== undefined
          ? { description: description.trim() || null }
          : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

// Delete a group. Membership rows go with it; students and their work don't.
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
    const group = await prisma.studentGroup.findFirst({
      where: { id, instructorId: session.user.id },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.studentGroup.delete({ where: { id } });

    return NextResponse.json({ message: 'Group deleted' });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
