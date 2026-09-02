import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import notificationService from '@/lib/firebase/notification-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') !== 'false';

    const now = new Date();
    const where: any = {};
    if (activeOnly) {
      where.endDate = { gte: new Date(now.setHours(0, 0, 0, 0)) };
    }

    const closures = await prisma.schoolClosure.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json({ success: true, closures });
  } catch (error: any) {
    console.error('Error fetching closures:', error);
    return NextResponse.json({ error: 'Failed to fetch closures' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin =
      session.role === 'ADMIN' || session.role === 'SUPER_ADMIN' || session.role === 'PRINCIPAL';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only administrative faculty can declare school closures or emergency mode' },
        { status: 403 }
      );
    }

    const {
      title,
      reason,
      closureType = 'FULL_DAY',
      startDate,
      endDate,
      targetAudience = 'ALL',
      isEmergency = false,
      affectsTimetable = true,
      affectsAttendance = true,
    } = await req.json();

    if (!title || !reason || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, reason, start date, and end date are mandatory' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const closure = await prisma.schoolClosure.create({
      data: {
        title: title.trim(),
        reason: reason.trim(),
        closureType,
        startDate: start,
        endDate: end,
        targetAudience,
        isEmergency,
        affectsTimetable,
        affectsAttendance,
        createdById: session.userId,
      },
    });

    // Broadcast in-app notification to all active users matching audience
    const userRoleFilter: any = {};
    if (targetAudience === 'STUDENTS') userRoleFilter.role = 'STUDENT';
    else if (targetAudience === 'PARENTS') userRoleFilter.role = 'PARENT';
    else if (targetAudience === 'TEACHERS') userRoleFilter.role = 'TEACHER';

    const activeUsers = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        ...userRoleFilter,
      },
      select: { id: true },
    });

    const prefix = isEmergency ? '🚨 EMERGENCY CLOSURE' : '🏛️ NOTICE OF SCHOOL CLOSURE';
    const noticeMessage = `${title}: ${reason}. Effective from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}. Classes and normal campus operations will remain suspended.`;

    if (activeUsers.length > 0) {
      await prisma.notification.createMany({
        data: activeUsers.map((u) => ({
          userId: u.id,
          title: `${prefix}: ${title}`,
          message: noticeMessage,
          type: 'ANNOUNCEMENT',
        })),
      });

      notificationService.sendToUsers(
        activeUsers.map((u) => u.id),
        {
          title: `${prefix}: ${title}`,
          body: noticeMessage,
          category: 'ANNOUNCEMENT',
          data: {
            type: 'SCHOOL_CLOSURE',
            closureId: closure.id,
            isEmergency: String(isEmergency),
          },
        }
      ).catch(console.warn);
    }

    // Audit Log
    await logAuditEvent({
      userId: session.userId,
      userName: session.fullName || session.username,
      role: session.role,
      action: isEmergency ? 'EMERGENCY_SCHOOL_CLOSURE' : 'SCHOOL_CLOSURE_ANNOUNCED',
      entity: 'SchoolClosure',
      entityId: closure.id,
      details: JSON.stringify({
        title,
        reason,
        closureType,
        startDate: start,
        endDate: end,
        targetAudience,
        isEmergency,
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'School closure declared and broadcast to all community portals.',
      closure,
    });
  } catch (error: any) {
    console.error('Error creating school closure:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to announce school closure' },
      { status: 500 }
    );
  }
}
