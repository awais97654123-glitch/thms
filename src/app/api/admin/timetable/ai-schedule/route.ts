import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { generateAiTeacherSchedule, commitBatchApprovedSchedule } from '@/lib/timetable/scheduling-engine';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/timetable/ai-schedule
 * Analyzes real school data and proposes conflict-free timetable slots for a teacher.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      teacherName,
      qualifiedSubjects,
      workingDays,
      availableFrom,
      availableTo,
      maxDailyPeriods,
      maxWeeklyPeriods,
      teacherId,
    } = body;

    if (!teacherName || !qualifiedSubjects || !Array.isArray(qualifiedSubjects) || qualifiedSubjects.length === 0) {
      return NextResponse.json(
        { error: 'Teacher name and at least one qualified subject are required.' },
        { status: 400 }
      );
    }

    const result = await generateAiTeacherSchedule({
      teacherName,
      qualifiedSubjects,
      workingDays,
      availableFrom,
      availableTo,
      maxDailyPeriods: Number(maxDailyPeriods) || 6,
      maxWeeklyPeriods: Number(maxWeeklyPeriods) || 30,
      teacherId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Schedule generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI timetable proposals.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/timetable/ai-schedule
 * Atomically commits human-approved timetable proposals into official database records.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const { teacherId, approvedSlots, academicSessionId } = body;

    if (!teacherId || !approvedSlots || !Array.isArray(approvedSlots) || approvedSlots.length === 0) {
      return NextResponse.json(
        { error: 'Teacher ID and approved slot list are required for timetable commitment.' },
        { status: 400 }
      );
    }

    const result = await commitBatchApprovedSchedule({
      teacherId,
      approvedSlots,
      adminUserId: session.userId,
      academicSessionId,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully scheduled ${result.count} periods for teacher into central timetable.`,
      records: result.records,
    });
  } catch (error: any) {
    console.error('Commit AI schedule error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to commit approved timetable slots to database.' },
      { status: 500 }
    );
  }
}
