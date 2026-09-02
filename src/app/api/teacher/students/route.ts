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

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const query = searchParams.get('q')?.trim() || '';
    const filterStatus = searchParams.get('status')?.toUpperCase() || 'ALL';

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    // RBAC Authorization for TEACHER
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
        return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
      }

      // Check authorization via Timetable or TeacherAssignment
      const [hasTimetable, hasAssignment] = await Promise.all([
        prisma.timetable.findFirst({
          where: {
            teacherId: teacher.id,
            classId,
            ...(sectionId ? { sectionId } : {}),
          },
        }),
        prisma.teacherAssignment.findFirst({
          where: {
            teacherId: teacher.id,
            classId,
            ...(sectionId ? { sectionId } : {}),
          },
        }),
      ]);

      if (!hasTimetable && !hasAssignment) {
        return NextResponse.json(
          { error: 'Access denied: You are not assigned to this class/section' },
          { status: 403 }
        );
      }
    }

    // 1. Fetch all enrolled students in the class/section with lean fields
    const studentWhere: any = {
      classId,
      status: 'ENROLLED',
    };
    if (sectionId) {
      studentWhere.sectionId = sectionId;
    }
    if (query) {
      studentWhere.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { rollNo: { contains: query, mode: 'insensitive' } },
        { studentId: { contains: query, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.student.findMany({
      where: studentWhere,
      select: {
        id: true,
        studentId: true,
        rollNo: true,
        fullName: true,
        photoUrl: true,
        gender: true,
        bloodGroup: true,
        status: true,
        cardStatus: true,
        emergencyPhone: true,
        class: { select: { id: true, name: true, code: true } },
        section: { select: { id: true, name: true } },
        parent: {
          select: {
            fatherName: true,
            fatherPhone: true,
            fatherEmail: true,
          },
        },
      },
      orderBy: { rollNo: 'asc' },
    });

    const studentIds = students.map((s) => s.id);

    // 2. Batched query: Today's attendance for all students in class
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: { in: studentIds },
        date: todayMidnight,
      },
      select: {
        studentId: true,
        status: true,
        time: true,
        method: true,
      },
    });

    const attendanceMap = new Map<string, { status: string; time: string; method: string }>();
    attendanceRecords.forEach((att) => {
      attendanceMap.set(att.studentId, {
        status: att.status,
        time: att.time,
        method: att.method,
      });
    });

    // 3. Batched query: Active homeworks for this class/section
    const activeHomeworks = await prisma.homework.findMany({
      where: {
        classId,
        ...(sectionId ? { sectionId } : {}),
      },
      take: 5,
      orderBy: { dueDate: 'desc' },
      select: { id: true, title: true, dueDate: true },
    });

    const activeHomeworkIds = activeHomeworks.map((h) => h.id);

    // Batched submissions for active homeworks
    const submissions = activeHomeworkIds.length > 0
      ? await prisma.homeworkSubmission.findMany({
          where: {
            homeworkId: { in: activeHomeworkIds },
            studentId: { in: studentIds },
          },
          select: {
            studentId: true,
            homeworkId: true,
            status: true,
            marks: true,
          },
        })
      : [];

    const submissionMap = new Map<string, string>();
    submissions.forEach((sub) => {
      submissionMap.set(`${sub.studentId}_${sub.homeworkId}`, sub.status);
    });

    // 4. Batched query: Recent exam marks for student
    const recentMarks = await prisma.mark.findMany({
      where: { studentId: { in: studentIds } },
      orderBy: { createdAt: 'desc' },
      take: studentIds.length * 2,
      select: {
        studentId: true,
        marksObtained: true,
        totalMarks: true,
        percentage: true,
        grade: true,
      },
    });

    const marksMap = new Map<string, any>();
    recentMarks.forEach((m) => {
      if (!marksMap.has(m.studentId)) {
        marksMap.set(m.studentId, m);
      }
    });

    // Compute class stats server-side
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let pendingAttendanceCount = 0;
    let pendingHomeworkTotal = 0;

    // Attach derived attributes to each student
    const enrichedStudents = students.map((s) => {
      const att = attendanceMap.get(s.id);
      const currentAttendanceStatus = att ? att.status : 'PENDING';

      if (currentAttendanceStatus === 'PRESENT') presentCount++;
      else if (currentAttendanceStatus === 'LATE') lateCount++;
      else if (currentAttendanceStatus === 'ABSENT') absentCount++;
      else pendingAttendanceCount++;

      // Compute homework status
      let studentHomeworkStatus = 'NONE';
      if (activeHomeworkIds.length > 0) {
        const latestHwId = activeHomeworkIds[0];
        const subStatus = submissionMap.get(`${s.id}_${latestHwId}`);
        studentHomeworkStatus = subStatus || 'PENDING';
        if (studentHomeworkStatus === 'PENDING') pendingHomeworkTotal++;
      }

      const latestMark = marksMap.get(s.id) || null;

      return {
        ...s,
        photoUrl: s.photoUrl || '/student-avatar.png',
        todayAttendance: {
          status: currentAttendanceStatus,
          time: att ? att.time : null,
          method: att ? att.method : null,
        },
        homeworkStatus: studentHomeworkStatus,
        latestMark: latestMark
          ? {
              score: `${latestMark.marksObtained}/${latestMark.totalMarks}`,
              pct: `${latestMark.percentage}%`,
              grade: latestMark.grade,
            }
          : null,
      };
    });

    // Filter by attendance / homework status if requested
    let filteredStudents = enrichedStudents;
    if (filterStatus === 'PRESENT') {
      filteredStudents = enrichedStudents.filter((s) => s.todayAttendance.status === 'PRESENT');
    } else if (filterStatus === 'ABSENT') {
      filteredStudents = enrichedStudents.filter((s) => s.todayAttendance.status === 'ABSENT');
    } else if (filterStatus === 'LATE') {
      filteredStudents = enrichedStudents.filter((s) => s.todayAttendance.status === 'LATE');
    } else if (filterStatus === 'PENDING') {
      filteredStudents = enrichedStudents.filter((s) => s.todayAttendance.status === 'PENDING');
    } else if (filterStatus === 'HOMEWORK_PENDING') {
      filteredStudents = enrichedStudents.filter((s) => s.homeworkStatus === 'PENDING');
    }

    const totalStudents = students.length;
    const attendancePct = totalStudents > 0
      ? Math.round(((presentCount + lateCount) / totalStudents) * 100)
      : 100;

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        presentToday: presentCount,
        lateToday: lateCount,
        absentToday: absentCount,
        pendingAttendance: pendingAttendanceCount,
        attendancePct,
        pendingHomework: pendingHomeworkTotal,
        upcomingTests: 1,
        pendingMarks: 0,
      },
      classInfo: {
        classId,
        sectionId,
        activeHomeworksCount: activeHomeworks.length,
      },
      students: filteredStudents,
    });
  } catch (error: any) {
    console.error('Fetch teacher students error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch class roster' },
      { status: 500 }
    );
  }
}
