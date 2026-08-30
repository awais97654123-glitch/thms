import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { comparePassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { email: username.trim() },
        ],
      },
      include: {
        student: true,
        teacher: true,
        parent: true,
        staff: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account is inactive or suspended' }, { status: 403 });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    let fullName = user.username;
    if (user.student) fullName = user.student.fullName;
    else if (user.teacher) fullName = user.teacher.fullName;
    else if (user.parent) fullName = user.parent.fatherName;
    else if (user.staff) fullName = user.staff.fullName;

    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      email: user.email || undefined,
      fullName,
      studentId: user.student?.id,
      teacherId: user.teacher?.id,
      parentId: user.parent?.id,
      isFirstLogin: user.isFirstLogin,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await logAuditEvent({
      userId: user.id,
      userName: fullName,
      role: user.role,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
    });

    let redirectUrl = '/admin';
    if (user.role === 'TEACHER') redirectUrl = '/teacher';
    else if (user.role === 'STUDENT') redirectUrl = '/student';
    else if (user.role === 'PARENT') redirectUrl = '/parent';
    else if (user.role === 'ACCOUNTANT') redirectUrl = '/admin/fees';
    else if (user.role === 'LIBRARIAN') redirectUrl = '/admin/library';

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName,
        isFirstLogin: user.isFirstLogin,
      },
      redirectUrl,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An unexpected authentication error occurred' }, { status: 500 });
  }
}
