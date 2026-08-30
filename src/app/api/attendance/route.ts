import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { format } from 'date-fns';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const studentId = searchParams.get('studentId');

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const dateMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const where: any = {};
    if (dateParam) where.date = dateMidnight;
    if (studentId) where.studentId = studentId;
    if (classId || sectionId) {
      where.student = {};
      if (classId) where.student.classId = classId;
      if (sectionId) where.student.sectionId = sectionId;
    }

    const records = await prisma.attendance.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: {
            class: true,
            section: true,
          },
        },
      },
    });

    // Compute stats
    const totalPresent = records.filter((r) => r.status === 'PRESENT').length;
    const totalLate = records.filter((r) => r.status === 'LATE').length;
    const totalAbsent = records.filter((r) => r.status === 'ABSENT').length;
    const totalExcused = records.filter((r) => r.status === 'EXCUSED').length;

    return NextResponse.json({
      success: true,
      date: format(dateMidnight, 'yyyy-MM-dd'),
      stats: {
        total: records.length,
        present: totalPresent,
        late: totalLate,
        absent: totalAbsent,
        excused: totalExcused,
        attendanceRate: records.length > 0 ? (((totalPresent + totalLate) / records.length) * 100).toFixed(1) : '100.0',
      },
      records,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch attendance data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const { date, records } = await req.json();

    if (!records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Records array is required' }, { status: 400 });
    }

    const targetDate = date ? new Date(date) : new Date();
    const dateMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const formattedTime = format(new Date(), 'hh:mm a');

    for (const item of records) {
      await prisma.attendance.upsert({
        where: {
          studentId_date: {
            studentId: item.studentId,
            date: dateMidnight,
          },
        },
        update: {
          status: item.status,
          remarks: item.remarks || null,
          method: 'MANUAL',
          markedById: session?.userId,
        },
        create: {
          studentId: item.studentId,
          date: dateMidnight,
          time: formattedTime,
          status: item.status,
          method: 'MANUAL',
          markedById: session?.userId,
          remarks: item.remarks || 'Manual class register entry',
        },
      });
    }

    await logAuditEvent({
      userId: session?.userId,
      userName: session?.fullName || 'Teacher/Admin',
      role: session?.role || 'TEACHER',
      action: 'BULK_ATTENDANCE_RECORDED',
      entity: 'Attendance',
      details: `Bulk marked attendance for ${records.length} students on ${format(dateMidnight, 'yyyy-MM-dd')}`,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully saved attendance for ${records.length} students`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to record manual attendance' }, { status: 500 });
  }
}
