import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { getSchoolCurrentTime, parseTimeToMinutes } from '@/lib/timetable/period-engine';
import { isTimeOverlapping } from '@/lib/timetable/scheduling-engine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/teacher/class-center
 * High-performance command center endpoint for a teacher's selected class & section.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const subjectId = searchParams.get('subjectId');
    const q = searchParams.get('q')?.trim() || '';
    const filter = searchParams.get('filter') || 'ALL';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!classId || !sectionId) {
      return NextResponse.json({ error: 'classId and sectionId are required' }, { status: 400 });
    }

    // 1. Resolve Teacher Profile
    let teacher = null;
    if (session.role === 'TEACHER') {
      teacher = await prisma.teacher.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            { email: session.email || '' },
            { employeeId: session.username },
          ],
        },
        select: { id: true, fullName: true, employeeId: true },
      });

      if (!teacher) {
        return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
      }

      // Security / RBAC Check: Ensure teacher is assigned to this class in Timetable or TeacherAssignment
      const isAuthorized = await prisma.timetable.findFirst({
        where: {
          teacherId: teacher.id,
          classId,
          sectionId,
          status: 'PUBLISHED',
        },
        select: { id: true },
      }) || await prisma.teacherAssignment.findFirst({
        where: {
          teacherId: teacher.id,
          classId,
          sectionId,
        },
        select: { id: true },
      });

      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'Access denied: You are not assigned to teach this class/section.' },
          { status: 403 }
        );
      }
    }

    // 2. Fetch Class, Section, and Subject details
    const [cls, sec, sub] = await Promise.all([
      prisma.class.findUnique({
        where: { id: classId },
        select: { id: true, name: true, code: true },
      }),
      prisma.section.findUnique({
        where: { id: sectionId },
        select: { id: true, name: true, roomNo: true, capacity: true },
      }),
      subjectId
        ? prisma.subject.findUnique({
            where: { id: subjectId },
            select: { id: true, name: true, code: true },
          })
        : null,
    ]);

    if (!cls || !sec) {
      return NextResponse.json({ error: 'Class or Section not found' }, { status: 404 });
    }

    // 3. Today's Date in School Timezone (Asia/Karachi)
    const schoolTime = getSchoolCurrentTime();
    const todayMidnight = new Date(schoolTime.dateString);

    // 4. Build Student Query Filter
    const studentWhere: any = {
      classId,
      sectionId,
      status: 'ENROLLED',
    };

    if (q) {
      studentWhere.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { studentId: { contains: q, mode: 'insensitive' } },
        { rollNo: { contains: q, mode: 'insensitive' } },
      ];
    }

    // 5. Fetch Students with selective fields
    const [totalStudentsCount, allStudentsInClass] = await Promise.all([
      prisma.student.count({ where: studentWhere }),
      prisma.student.findMany({
        where: studentWhere,
        select: {
          id: true,
          studentId: true,
          admissionNo: true,
          rollNo: true,
          fullName: true,
          photoUrl: true,
          gender: true,
          attendances: {
            where: { date: todayMidnight },
            select: { status: true, time: true, method: true },
            take: 1,
          },
          submissions: {
            where: {
              homework: {
                classId,
                sectionId,
                ...(subjectId ? { subjectId } : {}),
              },
            },
            select: { id: true, status: true },
          },
          testSubmissions: {
            where: {
              test: {
                classId,
                sectionId,
                ...(subjectId ? { subjectId } : {}),
              },
            },
            select: { id: true, status: true, marksObtained: true },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { rollNo: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // 6. Aggregate Attendance Stats for this Class today
    const classAttendanceToday = await prisma.attendance.findMany({
      where: {
        date: todayMidnight,
        student: { classId, sectionId, status: 'ENROLLED' },
      },
      select: { status: true },
    });

    const presentCount = classAttendanceToday.filter((a) => a.status === 'PRESENT').length;
    const lateCount = classAttendanceToday.filter((a) => a.status === 'LATE').length;
    const absentCount = classAttendanceToday.filter((a) => a.status === 'ABSENT').length;
    const totalMarked = classAttendanceToday.length;
    const attendancePercentage =
      totalStudentsCount > 0
        ? Math.round(((presentCount + lateCount) / totalStudentsCount) * 100)
        : 100;

    // 7. Active Homeworks & Upcoming Tests
    const now = new Date();
    const [activeHomeworks, upcomingTests, pendingHomeworkCount, upcomingTestsCount] = await Promise.all([
      prisma.homework.findMany({
        where: {
          classId,
          sectionId,
          ...(subjectId ? { subjectId } : {}),
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          createdAt: true,
          subject: { select: { name: true, code: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { dueDate: 'desc' },
        take: 5,
      }),
      prisma.classTest.findMany({
        where: {
          classId,
          sectionId,
          ...(subjectId ? { subjectId } : {}),
        },
        select: {
          id: true,
          title: true,
          testDate: true,
          durationMinutes: true,
          totalMarks: true,
          status: true,
          subject: { select: { name: true, code: true } },
          _count: { select: { submissions: true } },
        },
        orderBy: { testDate: 'desc' },
        take: 5,
      }),
      prisma.homework.count({
        where: {
          classId,
          sectionId,
          dueDate: { gte: now },
          ...(subjectId ? { subjectId } : {}),
        },
      }),
      prisma.classTest.count({
        where: {
          classId,
          sectionId,
          testDate: { gte: now },
          ...(subjectId ? { subjectId } : {}),
        },
      }),
    ]);

    // 8. Current Period Evaluation
    const todayDayOfWeek = schoolTime.dayOfWeek;
    const classTimetablesToday = await prisma.timetable.findMany({
      where: {
        classId,
        sectionId,
        dayOfWeek: todayDayOfWeek,
        status: 'PUBLISHED',
      },
      include: {
        subject: { select: { name: true, code: true } },
        teacher: { select: { fullName: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    let currentPeriod = null;
    const currentMin = schoolTime.totalMinutes;

    for (const tt of classTimetablesToday) {
      const sMin = parseTimeToMinutes(tt.startTime);
      const eMin = parseTimeToMinutes(tt.endTime);
      if (currentMin >= sMin && currentMin <= eMin) {
        currentPeriod = {
          id: tt.id,
          subjectName: tt.subject.name,
          teacherName: tt.teacher.fullName,
          startTime: tt.startTime,
          endTime: tt.endTime,
          roomNo: tt.roomNo || sec.roomNo || 'Room 101',
          isActive: true,
        };
        break;
      }
    }

    // 9. Process Student Rows with Quick Status Flags
    let studentRows = allStudentsInClass.map((st) => {
      const todayAtt = st.attendances[0]?.status || 'PENDING';
      const submittedHwCount = st.submissions.length;
      const latestTest = st.testSubmissions[0];

      return {
        id: st.id,
        studentId: st.studentId,
        admissionNo: st.admissionNo,
        rollNo: st.rollNo,
        fullName: st.fullName,
        photoUrl: st.photoUrl,
        gender: st.gender,
        attendanceStatus: todayAtt,
        attendanceTime: st.attendances[0]?.time || null,
        attendanceMethod: st.attendances[0]?.method || null,
        homeworkStatus: activeHomeworks.length > 0 ? (submittedHwCount >= activeHomeworks.length ? 'COMPLETED' : 'PENDING') : 'NONE',
        latestTestResult: latestTest ? `${latestTest.marksObtained ?? '-'} pts` : 'N/A',
      };
    });

    // Apply Client Filter if specified
    if (filter === 'PRESENT') {
      studentRows = studentRows.filter((s) => s.attendanceStatus === 'PRESENT');
    } else if (filter === 'ABSENT') {
      studentRows = studentRows.filter((s) => s.attendanceStatus === 'ABSENT');
    } else if (filter === 'LATE') {
      studentRows = studentRows.filter((s) => s.attendanceStatus === 'LATE');
    } else if (filter === 'PENDING') {
      studentRows = studentRows.filter((s) => s.attendanceStatus === 'PENDING');
    } else if (filter === 'HOMEWORK_PENDING') {
      studentRows = studentRows.filter((s) => s.homeworkStatus === 'PENDING');
    }

    return NextResponse.json({
      success: true,
      classInfo: {
        classId: cls.id,
        className: cls.name,
        sectionId: sec.id,
        sectionName: sec.name,
        subjectId: sub?.id || null,
        subjectName: sub?.name || 'All Subjects',
        roomNo: sec.roomNo || 'Main Hall',
        capacity: sec.capacity,
      },
      metrics: {
        totalStudents: totalStudentsCount,
        presentToday: presentCount,
        absentToday: absentCount,
        lateToday: lateCount,
        attendancePercentage,
        pendingHomework: pendingHomeworkCount,
        upcomingTests: upcomingTestsCount,
        pendingMarks: 0,
      },
      currentPeriod,
      students: studentRows,
      activeHomeworks,
      upcomingTests,
      pagination: {
        page,
        limit,
        total: totalStudentsCount,
        totalPages: Math.ceil(totalStudentsCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Class Center Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load class command center' }, { status: 500 });
  }
}
