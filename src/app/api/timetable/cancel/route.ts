import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import notificationService from '@/lib/firebase/notification-service';
import { emailQueue } from '@/lib/email/queue';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { timetableId, date, reason } = await req.json();

    if (!timetableId || !date || !reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Timetable ID, date, and a valid cancellation reason are mandatory' },
        { status: 400 }
      );
    }

    // 1. Fetch timetable item with class, section, subject, and teacher
    const timetable = await prisma.timetable.findUnique({
      where: { id: timetableId },
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: true,
      },
    });

    if (!timetable) {
      return NextResponse.json({ error: 'Timetable period not found' }, { status: 404 });
    }

    // 2. Authorization check: Only the assigned teacher or an Admin/Principal can cancel
    const isTeacherOfPeriod = session.teacherId && session.teacherId === timetable.teacherId;
    const isAdmin =
      session.role === 'ADMIN' || session.role === 'SUPER_ADMIN' || session.role === 'PRINCIPAL';

    if (!isTeacherOfPeriod && !isAdmin) {
      return NextResponse.json(
        { error: 'You are not authorized to cancel this class period' },
        { status: 403 }
      );
    }

    // Parse target date to midnight UTC/local
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // 3. Upsert PeriodCancellation record
    const cancellation = await prisma.periodCancellation.upsert({
      where: {
        timetableId_date: {
          timetableId: timetable.id,
          date: targetDate,
        },
      },
      update: {
        reason: reason.trim(),
        status: 'CANCELLED',
        cancelledById: session.userId,
        cancelledAt: new Date(),
      },
      create: {
        timetableId: timetable.id,
        date: targetDate,
        reason: reason.trim(),
        cancelledById: session.userId,
        status: 'CANCELLED',
      },
    });

    // 4. Fetch all enrolled students in this section and their parents
    const enrolledStudents = await prisma.student.findMany({
      where: {
        classId: timetable.classId,
        sectionId: timetable.sectionId,
        status: 'ENROLLED',
      },
      include: {
        parent: true,
      },
    });

    const studentUserIds: string[] = [];
    const parentUserIds: string[] = [];

    enrolledStudents.forEach((st) => {
      if (st.userId) studentUserIds.push(st.userId);
      if (st.parent?.userId) parentUserIds.push(st.parent.userId);
    });

    const allRecipientUserIds = Array.from(new Set([...studentUserIds, ...parentUserIds]));

    const notificationTitle = `⚠️ Period Cancelled: ${timetable.subject.name}`;
    const notificationMessage = `Today's ${timetable.subject.name} period (${timetable.startTime} - ${timetable.endTime}) for ${timetable.class.name} (${timetable.section.name}) has been cancelled by ${session.fullName || session.username}. Reason: "${reason.trim()}"`;

    // 5. In-App Notifications for affected students & parents
    if (allRecipientUserIds.length > 0) {
      await prisma.notification.createMany({
        data: allRecipientUserIds.map((uId) => ({
          userId: uId,
          title: notificationTitle,
          message: notificationMessage,
          type: 'ANNOUNCEMENT',
          link: '/timetable',
        })),
      });
    }

    // 6. Push Notifications via FCM
    try {
      if (allRecipientUserIds.length > 0) {
        await notificationService.sendToUsers(allRecipientUserIds, {
          title: notificationTitle,
          body: notificationMessage,
          category: 'ANNOUNCEMENT',
          data: {
            type: 'PERIOD_CANCELLED',
            timetableId: timetable.id,
            date: date,
          },
        });
      }
    } catch (pushErr) {
      console.warn('FCM Push notification warning:', pushErr);
    }

    // 7. Resend/SMTP Email Dispatch
    for (const st of enrolledStudents) {
      if (st.parent?.fatherEmail) {
        await emailQueue.enqueue({
          eventType: 'ANNOUNCEMENT',
          recipientEmail: st.parent.fatherEmail,
          recipientName: st.parent.fatherName || 'Respected Parent',
          subject: notificationTitle,
          bodyHtml: `<p>Dear Parent,</p><p>${notificationMessage}</p><p>Regards,<br>The Hayatabad Model School</p>`,
        }).catch(console.error);
      }
    }

    // 8. Audit Log
    await logAuditEvent({
      userId: session.userId,
      userName: session.fullName || session.username,
      role: session.role,
      action: 'CLASS_PERIOD_CANCELLED',
      entity: 'Timetable',
      entityId: timetable.id,
      details: JSON.stringify({
        subject: timetable.subject.name,
        class: timetable.class.name,
        section: timetable.section.name,
        startTime: timetable.startTime,
        endTime: timetable.endTime,
        reason: reason.trim(),
        date: targetDate,
        affectedStudentsCount: enrolledStudents.length,
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'Class period successfully cancelled. All affected students and parents have been notified in real time.',
      cancellation,
    });
  } catch (error: any) {
    console.error('Error cancelling class period:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel period' },
      { status: 500 }
    );
  }
}
