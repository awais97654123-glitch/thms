import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const teacherId = searchParams.get('teacherId');

    const where: any = {};
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (teacherId) where.teacherId = teacherId;

    const timetables = await prisma.timetable.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: true,
      },
    });

    return NextResponse.json({ success: true, timetables });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const { classId, sectionId, subjectId, teacherId, dayOfWeek, startTime, endTime, roomNo } = await req.json();

    if (!classId || !sectionId || !subjectId || !teacherId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 1. Conflict Check: Teacher double-booked at the same day & time
    const teacherConflict = await prisma.timetable.findFirst({
      where: {
        teacherId,
        dayOfWeek,
        startTime,
      },
      include: { class: true, section: true, teacher: true },
    });

    if (teacherConflict) {
      return NextResponse.json({
        error: `Teacher Conflict: ${teacherConflict.teacher.fullName} is already scheduled for ${teacherConflict.class.name} (${teacherConflict.section.name}) on ${dayOfWeek} at ${startTime}.`,
      }, { status: 409 });
    }

    // 2. Conflict Check: Room double-booked
    if (roomNo) {
      const roomConflict = await prisma.timetable.findFirst({
        where: {
          roomNo,
          dayOfWeek,
          startTime,
        },
        include: { class: true, section: true },
      });

      if (roomConflict) {
        return NextResponse.json({
          error: `Room Conflict: ${roomNo} is already occupied by ${roomConflict.class.name} (${roomConflict.section.name}) on ${dayOfWeek} at ${startTime}.`,
        }, { status: 409 });
      }
    }

    // 3. Conflict Check: Same section double-booked
    const sectionConflict = await prisma.timetable.findFirst({
      where: {
        classId,
        sectionId,
        dayOfWeek,
        startTime,
      },
      include: { subject: true },
    });

    if (sectionConflict) {
      return NextResponse.json({
        error: `Section Conflict: This class/section already has ${sectionConflict.subject.name} on ${dayOfWeek} at ${startTime}.`,
      }, { status: 409 });
    }

    const timetable = await prisma.timetable.create({
      data: {
        classId,
        sectionId,
        subjectId,
        teacherId,
        dayOfWeek,
        startTime,
        endTime,
        roomNo,
      },
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: true,
      },
    });

    await logAuditEvent({
      userId: session?.userId,
      userName: session?.fullName || 'Admin',
      role: session?.role || 'ADMIN',
      action: 'TIMETABLE_CREATED',
      entity: 'Timetable',
      entityId: timetable.id,
      details: `Scheduled ${timetable.subject.name} for ${timetable.class.name} (${timetable.section.name}) on ${dayOfWeek} ${startTime}-${endTime}`,
    });

    return NextResponse.json({ success: true, timetable });
  } catch (error) {
    console.error('Timetable conflict error:', error);
    return NextResponse.json({ error: 'Failed to create timetable entry' }, { status: 500 });
  }
}
