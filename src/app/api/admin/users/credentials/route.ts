import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// GET: List users with credential details
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const query = searchParams.get('q')?.trim();

    const where: any = {};
    if (role && role !== 'ALL') {
      where.role = role;
    }

    if (query) {
      where.OR = [
        { username: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { student: { fullName: { contains: query, mode: 'insensitive' } } },
        { teacher: { fullName: { contains: query, mode: 'insensitive' } } },
        { parent: { fatherName: { contains: query, mode: 'insensitive' } } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        isFirstLogin: true,
        lastLoginAt: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            studentId: true,
            admissionNo: true,
            rollNo: true,
            fullName: true,
            class: { select: { name: true } },
            section: { select: { name: true } },
          },
        },
        teacher: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            phone: true,
            designation: true,
          },
        },
        parent: {
          select: {
            id: true,
            fatherName: true,
            fatherPhone: true,
          },
        },
      },
    });

    const formattedUsers = users.map((u) => {
      let displayName = u.username;
      let extraInfo = '';
      if (u.student) {
        displayName = u.student.fullName;
        extraInfo = `${u.student.class?.name || ''} (Roll ${u.student.rollNo || 'N/A'}) • ID: ${u.student.studentId}`;
      } else if (u.teacher) {
        displayName = u.teacher.fullName;
        extraInfo = `${u.teacher.designation} • ${u.teacher.phone}`;
      } else if (u.parent) {
        displayName = u.parent.fatherName;
        extraInfo = `Phone: ${u.parent.fatherPhone}`;
      }

      return {
        id: u.id,
        username: u.username,
        email: u.email || 'None',
        role: u.role,
        status: u.status,
        displayName,
        extraInfo,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
      };
    });

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error) {
    console.error('Fetch user credentials error:', error);
    return NextResponse.json({ error: 'Failed to fetch user accounts' }, { status: 500 });
  }
}

// PUT: Change user login username, email/gmail, or reset password
export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { userId, newUsername, newEmail, newPassword, newStatus } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: any = {};

    // 1. Update Username if changed
    if (newUsername && newUsername.trim() !== targetUser.username) {
      const trimmedUsername = newUsername.trim();
      const existing = await prisma.user.findUnique({
        where: { username: trimmedUsername },
      });
      if (existing && existing.id !== userId) {
        return NextResponse.json({ error: `Username "${trimmedUsername}" is already taken by another account.` }, { status: 400 });
      }
      updateData.username = trimmedUsername;
    }

    // 2. Update Email / Gmail if changed
    if (newEmail !== undefined) {
      const trimmedEmail = newEmail ? newEmail.trim() : null;
      if (trimmedEmail && trimmedEmail !== targetUser.email) {
        const existing = await prisma.user.findUnique({
          where: { email: trimmedEmail },
        });
        if (existing && existing.id !== userId) {
          return NextResponse.json({ error: `Email "${trimmedEmail}" is already in use by another account.` }, { status: 400 });
        }
      }
      updateData.email = trimmedEmail;
    }

    // 3. Reset or Change Password if provided
    if (newPassword && newPassword.trim()) {
      const trimmedPass = newPassword.trim();
      if (trimmedPass.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
      }
      updateData.passwordHash = await hashPassword(trimmedPass);
      updateData.isFirstLogin = false;
    }

    // 4. Update Status if provided
    if (newStatus && ['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(newStatus)) {
      updateData.status = newStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, message: 'No changes provided' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Audit Log
    await logAuditEvent({
      userId: session.userId,
      userName: session.fullName || 'Admin',
      role: session.role,
      action: 'ADMIN_CHANGED_USER_CREDENTIALS',
      entity: 'User',
      entityId: targetUser.id,
      details: {
        targetUsername: updatedUser.username,
        targetRole: targetUser.role,
        changedFields: Object.keys(updateData),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User credentials updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        status: updatedUser.status,
      },
    });
  } catch (error: any) {
    console.error('Update credentials error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update user credentials' }, { status: 500 });
  }
}
