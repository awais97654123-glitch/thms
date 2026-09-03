import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { getSchoolCurrentTime, parseTimeToMinutes } from '@/lib/timetable/period-engine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/student/classes
 * Returns all subjects and classroom hubs the student is currently enrolled in.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Resolve Student Record
    let student = null;
    if (session.role === 'STUDENT') {
      student = await prisma.student.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            { studentId: session.username },
          ],
        },
        include: {
          class: true,
          section: true,
        },
      });
    } else {
      // Demo / fallback student
      student = await prisma.student.findFirst({
        include: {
          class: true,
          section: true,
        },
      });
    }

    if (!student) {
      return NextResponse.json({ error: 'Enrolled student record not found' }, { status: 404 });
    }

    // 2. Query Central Timetable for all subjects and teachers assigned to student's class and section
    const timetableSlots = await prisma.timetable.findMany({
      where: {
        classId: student.classId,
        sectionId: student.sectionId,
        status: 'PUBLISHED',
      },
      include: {
        subject: true,
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            photoUrl: true,
            designation: true,
            department: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    // Also get subjects registered directly under class if not yet scheduled in timetable
    const classSubjects = await prisma.subject.findMany({
      where: { classId: student.classId },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            photoUrl: true,
            designation: true,
            department: true,
          },
        },
      },
    });

    // 3. Current Period Evaluation
    const schoolTime = getSchoolCurrentTime();
    const currentMin = schoolTime.totalMinutes;
    const todayDay = schoolTime.dayOfWeek;

    // 4. Counts of Homeworks, Tests, Study Materials for each subject
    const now = new Date();
    const [allActiveHw, allUpcomingTests, allStudyMaterials] = await Promise.all([
      prisma.homework.findMany({
        where: {
          classId: student.classId,
          sectionId: student.sectionId,
        },
        select: { id: true, subjectId: true, dueDate: true },
      }),
      prisma.classTest.findMany({
        where: {
          classId: student.classId,
          sectionId: student.sectionId,
        },
        select: { id: true, subjectId: true, testDate: true },
      }),
      prisma.studyMaterial.findMany({
        where: { classId: student.classId },
        select: { id: true, subjectId: true },
      }),
    ]);

    // 5. Build Classrooms Map
    const classroomsMap: Record<string, any> = {};

    // First populate from classSubjects
    classSubjects.forEach((sub) => {
      classroomsMap[sub.id] = {
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code,
        className: student.class.name,
        sectionName: student.section.name,
        teacher: sub.teacher || {
          fullName: 'Assigned Faculty',
          designation: 'Subject Teacher',
          photoUrl: null,
        },
        activeHomeworkCount: allActiveHw.filter((h) => h.subjectId === sub.id && new Date(h.dueDate) >= now).length,
        upcomingTestCount: allUpcomingTests.filter((t) => t.subjectId === sub.id && new Date(t.testDate) >= now).length,
        studyMaterialCount: allStudyMaterials.filter((m) => m.subjectId === sub.id).length,
        weeklySchedule: [],
        currentPeriodStatus: 'IDLE', // 'NOW', 'UPCOMING_TODAY', 'IDLE'
        todayTime: null,
      };
    });

    // Enrich with Timetable data
    timetableSlots.forEach((slot) => {
      const subId = slot.subjectId;
      if (!classroomsMap[subId]) {
        classroomsMap[subId] = {
          subjectId: subId,
          subjectName: slot.subject.name,
          subjectCode: slot.subject.code,
          className: student.class.name,
          sectionName: student.section.name,
          teacher: slot.teacher,
          activeHomeworkCount: allActiveHw.filter((h) => h.subjectId === subId && new Date(h.dueDate) >= now).length,
          upcomingTestCount: allUpcomingTests.filter((t) => t.subjectId === subId && new Date(t.testDate) >= now).length,
          studyMaterialCount: allStudyMaterials.filter((m) => m.subjectId === subId).length,
          weeklySchedule: [],
          currentPeriodStatus: 'IDLE',
          todayTime: null,
        };
      }

      classroomsMap[subId].teacher = slot.teacher;
      classroomsMap[subId].weeklySchedule.push({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        roomNo: slot.roomNo,
      });

      // Check if happening today
      if (slot.dayOfWeek.toUpperCase() === todayDay) {
        const sMin = parseTimeToMinutes(slot.startTime);
        const eMin = parseTimeToMinutes(slot.endTime);

        if (currentMin >= sMin && currentMin <= eMin) {
          classroomsMap[subId].currentPeriodStatus = 'NOW';
          classroomsMap[subId].todayTime = `${slot.startTime} - ${slot.endTime}`;
        } else if (currentMin < sMin && classroomsMap[subId].currentPeriodStatus !== 'NOW') {
          classroomsMap[subId].currentPeriodStatus = 'UPCOMING_TODAY';
          classroomsMap[subId].todayTime = `${slot.startTime} - ${slot.endTime}`;
        }
      }
    });

    const classrooms = Object.values(classroomsMap);

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        fullName: student.fullName,
        studentId: student.studentId,
        rollNo: student.rollNo,
        className: student.class.name,
        sectionName: student.section.name,
      },
      classrooms,
    });
  } catch (error: any) {
    console.error('Student classes error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load student classes' }, { status: 500 });
  }
}
