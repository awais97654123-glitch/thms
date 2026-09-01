import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = ['SUPER_ADMIN', 'PRINCIPAL', 'ADMIN', 'HR_MANAGER'].includes(session.role);
    if (!isAdmin && session.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const month = searchParams.get('month'); // e.g. "2026-09"
    const userId = searchParams.get('userId');

    const where: any = {};

    // Teachers can only see their own attendance
    if (session.role === 'TEACHER' && !isAdmin) {
      where.userId = session.userId;
    } else if (userId) {
      where.userId = userId;
    }

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.date = { gte: d, lt: next };
    } else if (month) {
      const [year, m] = month.split('-').map(Number);
      const startOfMonth = new Date(year, m - 1, 1);
      const endOfMonth = new Date(year, m, 0, 23, 59, 59);
      where.date = { gte: startOfMonth, lte: endOfMonth };
    }

    const records = await prisma.teacherAttendance.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            teacher: { select: { fullName: true, employeeId: true, designation: true } },
            staff: { select: { fullName: true, employeeId: true, role: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Teacher attendance fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch teacher attendance' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = ['SUPER_ADMIN', 'PRINCIPAL', 'ADMIN', 'HR_MANAGER'].includes(session.role);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only admin/HR can mark teacher attendance' }, { status: 403 });
    }

    const body = await req.json();
    const { records, date } = body;

    if (!records || !Array.isArray(records) || !date) {
      return NextResponse.json({ error: 'Attendance records array and date are required' }, { status: 400 });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];
    for (const record of records) {
      const { userId, status, checkIn, checkOut, remarks } = record;
      if (!userId || !status) continue;

      const existing = await prisma.teacherAttendance.findUnique({
        where: { userId_date: { userId, date: attendanceDate } },
      });

      if (existing) {
        const updated = await prisma.teacherAttendance.update({
          where: { id: existing.id },
          data: { status, checkIn, checkOut, remarks, markedById: session.userId },
        });
        results.push(updated);
      } else {
        const created = await prisma.teacherAttendance.create({
          data: {
            userId,
            date: attendanceDate,
            status,
            checkIn: checkIn || null,
            checkOut: checkOut || null,
            remarks: remarks || null,
            markedById: session.userId,
          },
        });
        results.push(created);
      }
    }

    await logAuditEvent({
      userId: session.userId,
      userName: session.fullName || session.username,
      role: session.role,
      action: 'TEACHER_ATTENDANCE_MARKED',
      entity: 'TeacherAttendance',
      details: `Teacher/staff attendance marked for ${date}: ${results.length} records`,
    });

    return NextResponse.json({
      success: true,
      message: `${results.length} attendance records saved`,
      count: results.length,
    });
  } catch (error) {
    console.error('Teacher attendance save error:', error);
    return NextResponse.json({ error: 'Failed to save teacher attendance' }, { status: 500 });
  }
}
