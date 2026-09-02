import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { format } from 'date-fns';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { classId: string; sectionId: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, sectionId } = params;
    const body = await req.json();

    // Verify Teacher authorization
    if (session.role === 'TEACHER') {
      const teacher = await prisma.teacher.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            { email: session.email || '' },
            { employeeId: session.username },
          ],
        },
      });

      if (!teacher) {
        return NextResponse.json({ error: 'Teacher record not found' }, { status: 404 });
      }

      const [hasTimetable, hasAssignment] = await Promise.all([
        prisma.timetable.findFirst({
          where: { teacherId: teacher.id, classId, sectionId },
        }),
        prisma.teacherAssignment.findFirst({
          where: { teacherId: teacher.id, classId, sectionId },
        }),
      ]);

      if (!hasTimetable && !hasAssignment) {
        return NextResponse.json(
          { error: 'Access denied: You are not assigned to this class section' },
          { status: 403 }
        );
      }
    }

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const formattedTime = format(now, 'hh:mm a');

    // Handle single student update or batch
    const updates: { studentId: string; status: string }[] = [];
    if (body.studentId && body.status) {
      updates.push({ studentId: body.studentId, status: body.status });
    } else if (Array.isArray(body.updates)) {
      updates.push(...body.updates);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No attendance updates provided' }, { status: 400 });
    }

    // Execute atomic upserts
    await prisma.$transaction(
      updates.map((u) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: u.studentId,
              date: todayMidnight,
            },
          },
          update: {
            status: u.status,
            time: formattedTime,
            method: 'MANUAL',
            markedById: session.userId,
            remarks: 'Teacher Class Command Center roll call',
          },
          create: {
            studentId: u.studentId,
            date: todayMidnight,
            time: formattedTime,
            status: u.status,
            method: 'MANUAL',
            markedById: session.userId,
            remarks: 'Teacher Class Command Center roll call',
          },
        })
      )
    );

    // Audit log
    await logAuditEvent({
      userId: session.userId,
      userName: session.username || 'Teacher',
      role: session.role,
      action: 'TEACHER_ATTENDANCE_RECORDED',
      entity: 'ATTENDANCE',
      entityId: `${classId}_${sectionId}`,
      details: {
        classId,
        sectionId,
        studentsCount: updates.length,
        date: todayMidnight.toISOString(),
      },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      updatedCount: updates.length,
      time: formattedTime,
      updates,
    });
  } catch (error: any) {
    console.error('Teacher attendance error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record attendance' },
      { status: 500 }
    );
  }
}
