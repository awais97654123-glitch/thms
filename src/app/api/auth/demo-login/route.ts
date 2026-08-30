import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Demo account not found in database' }, { status: 404 });
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

    await logAuditEvent({
      userId: user.id,
      userName: fullName,
      role: user.role,
      action: 'DEMO_FAST_SWITCH',
      entity: 'User',
      entityId: user.id,
      details: `Switched into ${user.role} role via Demo Switcher`,
    });

    let redirectUrl = '/admin';
    if (user.role === 'TEACHER') redirectUrl = '/teacher';
    else if (user.role === 'STUDENT') redirectUrl = '/student';
    else if (user.role === 'PARENT') redirectUrl = '/parent';

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName,
      },
      redirectUrl,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json({ error: 'Failed to authenticate demo account' }, { status: 500 });
  }
}
