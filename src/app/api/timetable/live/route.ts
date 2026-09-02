import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getStudentLiveSchedule,
  getTeacherLiveSchedule,
  getCampusLiveOverview,
  getSchoolCurrentTime,
} from '@/lib/timetable/period-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const teacherId = searchParams.get('teacherId');
    const view = searchParams.get('view'); // 'overview' for admin campus monitor
    const dateParam = searchParams.get('date');

    const customDate = dateParam ? new Date(dateParam) : undefined;
    const session = await getCurrentUser();

    // 1. If explicitly requested campus overview or if caller is Admin without specific target
    if (view === 'overview' || (!studentId && !teacherId && (session?.role === 'ADMIN' || session?.role === 'SUPER_ADMIN' || session?.role === 'PRINCIPAL'))) {
      const overview = await getCampusLiveOverview(customDate);
      return NextResponse.json({ success: true, ...overview });
    }

    // 2. Specific Student Schedule (Direct query or authenticated student or parent viewing child)
    const targetStudentId = studentId || session?.studentId;
    if (targetStudentId) {
      const studentSchedule = await getStudentLiveSchedule(targetStudentId, customDate);
      return NextResponse.json({ success: true, role: 'STUDENT', ...studentSchedule });
    }

    // 3. Specific Teacher Schedule (Direct query or authenticated teacher)
    const targetTeacherId = teacherId || session?.teacherId;
    if (targetTeacherId) {
      const teacherSchedule = await getTeacherLiveSchedule(targetTeacherId, customDate);
      return NextResponse.json({ success: true, role: 'TEACHER', ...teacherSchedule });
    }

    // Fallback: Return current school time and basic stats
    const schoolTime = getSchoolCurrentTime(customDate);
    return NextResponse.json({
      success: true,
      schoolTime,
      message: 'No specific student or teacher context provided',
    });
  } catch (error: any) {
    console.error('Error fetching live timetable:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch live timetable' },
      { status: 500 }
    );
  }
}
