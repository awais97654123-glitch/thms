import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import notificationService from '@/lib/firebase/notification-service';

export const dynamic = 'force-dynamic';

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
        { error: 'Only administrative faculty can assign substitute teachers' },
        { status: 403 }
      );
    }

    const { timetableId, date, substituteTeacherId, reason } = await req.json();

    if (!timetableId || !date || !substituteTeacherId) {
      return NextResponse.json(
        { error: 'Timetable ID, date, and substitute teacher ID are required' },
        { status: 400 }
      );
    }

    const [timetable, substituteTeacher] = await Promise.all([
      prisma.timetable.findUnique({
        where: { id: timetableId },
        include: {
          class: true,
          section: true,
          subject: true,
          teacher: true,
        },
      }),
      prisma.teacher.findUnique({
        where: { id: substituteTeacherId },
        include: { user: true },
      }),
    ]);

    if (!timetable) {
      return NextResponse.json({ error: 'Timetable period not found' }, { status: 404 });
    }

    if (!substituteTeacher) {
      return NextResponse.json({ error: 'Substitute teacher not found' }, { status: 404 });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Upsert substitute assignment
    const assignment = await prisma.substituteAssignment.upsert({
      where: {
        timetableId_date: {
          timetableId: timetable.id,
          date: targetDate,
        },
      },
      update: {
        substituteTeacherId: substituteTeacher.id,
        originalTeacherId: timetable.teacherId,
        assignedById: session.userId,
        reason: reason?.trim() || null,
        status: 'ACTIVE',
      },
      create: {
        timetableId: timetable.id,
        date: targetDate,
        originalTeacherId: timetable.teacherId,
        substituteTeacherId: substituteTeacher.id,
        assignedById: session.userId,
        reason: reason?.trim() || null,
        status: 'ACTIVE',
      },
      include: {
        substituteTeacher: true,
        originalTeacher: true,
      },
    });

    // Notify substitute teacher
    if (substituteTeacher.userId) {
      await prisma.notification.create({
        data: {
          userId: substituteTeacher.userId,
          title: `📋 Substitute Duty Assigned: ${timetable.subject.name}`,
          message: `You have been assigned to cover ${timetable.class.name} (${timetable.section.name}) for ${timetable.subject.name} on ${timetable.startTime} - ${timetable.endTime} in room ${timetable.roomNo || 'Main'} today.`,
          type: 'INFO',
          link: '/teacher',
        },
      });
    }

    // Notify enrolled students and parents
    const enrolledStudents = await prisma.student.findMany({
      where: {
        classId: timetable.classId,
        sectionId: timetable.sectionId,
        status: 'ENROLLED',
      },
      include: { parent: true },
    });

    const userIds: string[] = [];
    enrolledStudents.forEach((s) => {
      if (s.userId) userIds.push(s.userId);
      if (s.parent?.userId) userIds.push(s.parent.userId);
    });

    if (userIds.length > 0) {
      const noticeTitle = `🔄 Substitute Teacher: ${timetable.subject.name}`;
      const noticeMessage = `${timetable.subject.name} for ${timetable.class.name} (${timetable.section.name}) at ${timetable.startTime} will be instructed today by ${substituteTeacher.fullName}.`;

      await prisma.notification.createMany({
        data: userIds.map((uId) => ({
          userId: uId,
          title: noticeTitle,
          message: noticeMessage,
          type: 'INFO',
          link: '/timetable',
        })),
      });

      notificationService.sendToUsers(userIds, {
        title: noticeTitle,
        body: noticeMessage,
        category: 'GENERAL',
      }).catch(console.warn);
    }

    // Audit Log
    await logAuditEvent({
      userId: session.userId,
      userName: session.fullName || session.username,
      role: session.role,
      action: 'SUBSTITUTE_TEACHER_ASSIGNED',
      entity: 'Timetable',
      entityId: timetable.id,
      details: JSON.stringify({
        subject: timetable.subject.name,
        class: timetable.class.name,
        section: timetable.section.name,
        originalTeacher: timetable.teacher.fullName,
        substituteTeacher: substituteTeacher.fullName,
        startTime: timetable.startTime,
        reason,
        date: targetDate,
      }),
    });

    return NextResponse.json({
      success: true,
      message: `Substitute teacher ${substituteTeacher.fullName} allocated successfully`,
      assignment,
    });
  } catch (error: any) {
    console.error('Error assigning substitute teacher:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to assign substitute' },
      { status: 500 }
    );
  }
}
