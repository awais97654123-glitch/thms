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

import { assignTimetableTransactional } from '@/lib/timetable/scheduling-engine';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const body = await req.json();
    const {
      classId,
      sectionId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      roomNo,
      version,
      effectiveFrom,
      allowOverride,
      id,
    } = body;

    if (!classId || !sectionId || !subjectId || !teacherId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const result = await assignTimetableTransactional(
      {
        classId,
        sectionId,
        subjectId,
        teacherId,
        dayOfWeek,
        startTime,
        endTime,
        roomNo,
        version: version || '1.0',
        effectiveFrom,
        allowOverride: !!allowOverride,
        excludeTimetableId: id,
      },
      session?.userId
    );

    return NextResponse.json({
      success: true,
      timetable: result.timetable,
      warnings: result.warnings,
      message: 'Timetable period scheduled successfully without hard conflicts',
    });
  } catch (error: any) {
    console.error('Timetable scheduling error:', error);
    const isConflict =
      error.message &&
      (error.message.includes('Conflict') ||
        error.message.includes('Limit') ||
        error.message.includes('booked') ||
        error.message.includes('Invalid Time'));

    return NextResponse.json(
      { error: error.message || 'Failed to create timetable entry' },
      { status: isConflict ? 409 : 500 }
    );
  }
}
