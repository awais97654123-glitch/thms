import { NextRequest, NextResponse } from 'next/server';
import { validateTimetableAssignment } from '@/lib/timetable/scheduling-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
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
      allowOverride,
      excludeTimetableId,
    } = body;

    if (!classId || !sectionId || !subjectId || !teacherId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required scheduling parameters for conflict analysis' },
        { status: 400 }
      );
    }

    const result = await validateTimetableAssignment({
      classId,
      sectionId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      roomNo,
      allowOverride,
      excludeTimetableId,
    });

    return NextResponse.json({
      success: true,
      status: result.valid ? 'AVAILABLE' : 'CONFLICT',
      valid: result.valid,
      conflicts: result.conflicts,
      warnings: result.warnings,
      message: result.valid
        ? 'Slot is available with zero hard scheduling conflicts'
        : `${result.conflicts.length} scheduling conflict(s) detected`,
    });
  } catch (error: any) {
    console.error('Conflict check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to perform conflict check' },
      { status: 500 }
    );
  }
}
