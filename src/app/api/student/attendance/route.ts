import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let targetStudentId = '';

    if (session.role === 'STUDENT') {
      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            { studentId: session.username },
          ],
        },
      });
      if (!student) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
      }
      targetStudentId = student.id;
    } else if (session.role === 'PARENT') {
      const { searchParams } = new URL(req.url);
      const childId = searchParams.get('studentId');

      const parent = await prisma.parent.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            { fatherPhone: session.username },
          ],
        },
        include: { students: true },
      });

      if (!parent || parent.students.length === 0) {
        return NextResponse.json({ error: 'No linked children found' }, { status: 404 });
      }

      if (childId && parent.students.some(s => s.id === childId)) {
        targetStudentId = childId;
      } else {
        targetStudentId = parent.students[0].id;
      }
    } else {
      const { searchParams } = new URL(req.url);
      targetStudentId = searchParams.get('studentId') || '';
      if (!targetStudentId) {
        return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
      }
    }

    // Fetch all attendance records for this student
    const attendances = await prisma.attendance.findMany({
      where: { studentId: targetStudentId },
      orderBy: { date: 'desc' },
    });

    const totalDays = attendances.length;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;

    // Monthly breakdown map
    const monthlyMap: Record<string, { month: string; present: number; absent: number; late: number; excused: number; total: number }> = {};

    attendances.forEach((att) => {
      if (att.status === 'PRESENT') presentCount++;
      else if (att.status === 'ABSENT') absentCount++;
      else if (att.status === 'LATE') lateCount++;
      else if (att.status === 'EXCUSED') excusedCount++;

      const monthKey = new Date(att.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, present: 0, absent: 0, late: 0, excused: 0, total: 0 };
      }
      monthlyMap[monthKey].total++;
      if (att.status === 'PRESENT') monthlyMap[monthKey].present++;
      else if (att.status === 'ABSENT') monthlyMap[monthKey].absent++;
      else if (att.status === 'LATE') monthlyMap[monthKey].late++;
      else if (att.status === 'EXCUSED') monthlyMap[monthKey].excused++;
    });

    const attendancePct = totalDays > 0 ? Math.round(((presentCount + lateCount) / totalDays) * 100) : 100;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = attendances.find((a) => new Date(a.date).toISOString().split('T')[0] === todayStr);

    return NextResponse.json({
      success: true,
      statistics: {
        totalDays,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendancePercentage: attendancePct,
        todayStatus: todayRecord ? todayRecord.status : 'NOT_MARKED',
        todayTime: todayRecord ? todayRecord.time : null,
      },
      monthlyBreakdown: Object.values(monthlyMap),
      recentRecords: attendances.slice(0, 30).map((a) => ({
        id: a.id,
        date: a.date,
        status: a.status,
        time: a.time,
        method: a.method,
        remarks: a.remarks,
      })),
    });
  } catch (error: any) {
    console.error('Fetch student attendance error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch attendance' }, { status: 500 });
  }
}
