import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

// Constant-time comparison so a mistyped code can't be brute-forced faster by
// timing how quickly the request fails.
function codesMatch(submitted: string, expected: string): boolean {
  const a = Buffer.from(submitted);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, instructorCode } =
      await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const wantsInstructor = role === 'INSTRUCTOR';

    if (wantsInstructor) {
      const expectedCode = process.env.INSTRUCTOR_REGISTRATION_CODE;

      // Fail closed: an unset env var means "no one can self-register as
      // instructor" rather than accidentally opening the gate to everyone.
      if (
        !expectedCode ||
        typeof instructorCode !== 'string' ||
        !codesMatch(instructorCode, expectedCode)
      ) {
        return NextResponse.json(
          { error: 'Invalid or missing instructor code' },
          { status: 403 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: wantsInstructor ? 'INSTRUCTOR' : 'STUDENT',
      },
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
