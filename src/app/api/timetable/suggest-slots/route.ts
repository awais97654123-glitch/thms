import { NextRequest, NextResponse } from 'next/server';
import { suggestOptimalSlots } from '@/lib/timetable/scheduling-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { classId, sectionId, subjectId, requiredWeeklyPeriods, preferredTeacherId, roomNo } = body;

    if (!classId || !sectionId || !subjectId) {
      return NextResponse.json(
        { error: 'classId, sectionId, and subjectId are required' },
        { status: 400 }
      );
    }

    const recommendations = await suggestOptimalSlots({
      classId,
      sectionId,
      subjectId,
      requiredWeeklyPeriods: requiredWeeklyPeriods ? parseInt(requiredWeeklyPeriods, 10) : 5,
      preferredTeacherId,
      roomNo,
    });

    return NextResponse.json({
      success: true,
      ...recommendations,
    });
  } catch (error: any) {
    console.error('Suggest slots error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to suggest optimal timetable slots' },
      { status: 500 }
    );
  }
}
