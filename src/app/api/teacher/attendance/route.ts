import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// GET /api/teacher/attendance - Fetch attendance records for a specific class/section/date
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const targetDate = new Date(dateStr);
    targetDate.setUTCHours(0, 0, 0, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        date: targetDate,
        student: {
          classId,
          ...(sectionId ? { sectionId } : {}),
        },
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            rollNo: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      date: dateStr,
      records: attendances.map(a => ({
        id: a.id,
        studentId: a.studentId,
        status: a.status,
        method: a.method,
        time: a.time,
        remarks: a.remarks,
        studentName: a.student.fullName,
        rollNo: a.student.rollNo,
      })),
    });
  } catch (error: any) {
    console.error('Fetch teacher attendance error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch attendance' }, { status: 500 });
  }
}

// POST /api/teacher/attendance - Save teacher attendance records
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { classId, sectionId, date, records } = body;

    if (!classId || !date || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'Class ID, date, and attendance records array are required' },
        { status: 400 }
      );
    }

    // If teacher, verify assignment
    if (session.role === 'TEACHER') {
      const teacher = await prisma.teacher.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            { email: session.email || '' },
            { employeeId: session.username },
          ],
        },
        include: {
          assignments: true,
          managedSections: true,
          subjects: true,
        },
      });

      if (!teacher) {
        return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
      }

      const isAuthorized = teacher.assignments.some(
        a => a.classId === classId && (!sectionId || a.sectionId === sectionId)
      ) || teacher.managedSections.some(
        s => s.classId === classId && (!sectionId || s.id === sectionId)
      ) || teacher.subjects.some(
        sub => sub.classId === classId
      );

      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'Access denied: You are not assigned to take attendance for this class/section' },
          { status: 403 }
        );
      }
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    const nowTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Execute atomic transaction for all student attendance records
    const savedCount = await prisma.$transaction(async (tx) => {
      let count = 0;

      for (const rec of records) {
        const { studentId, status, remarks } = rec;
        if (!studentId || !status) continue;

        // Upsert record for studentId and date
        await tx.attendance.upsert({
          where: {
            studentId_date: {
              studentId,
              date: targetDate,
            },
          },
          update: {
            status,
            method: 'MANUAL',
            markedById: session.userId,
            remarks: remarks || null,
            time: nowTime,
            updatedAt: new Date(),
          },
          create: {
            studentId,
            date: targetDate,
            time: nowTime,
            status,
            method: 'MANUAL',
            markedById: session.userId,
            remarks: remarks || null,
          },
        });
        count++;
      }

      return count;
    });

    await logAuditEvent({
      userName: session.username || session.fullName || 'Teacher',
      role: session.role,
      action: 'ATTENDANCE_MARKED',
      entity: 'Attendance',
      entityId: classId,
      details: `Marked attendance for ${savedCount} students in class ${classId} on ${date}`,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully saved attendance for ${savedCount} students`,
      savedCount,
      date,
    });
  } catch (error: any) {
    console.error('Save teacher attendance error:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to save attendance. Please try again.' },
      { status: 500 }
    );
  }
}
