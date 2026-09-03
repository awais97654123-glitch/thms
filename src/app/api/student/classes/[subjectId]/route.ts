import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { getSchoolCurrentTime, parseTimeToMinutes } from '@/lib/timetable/period-engine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/student/classes/[subjectId]
 * Full classroom page data for a specific subject.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { subjectId: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subjectId } = params;

    // 1. Resolve Student
    let student = null;
    if (session.role === 'STUDENT') {
      student = await prisma.student.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            { studentId: session.username },
          ],
        },
        include: { class: true, section: true },
      });
    } else {
      student = await prisma.student.findFirst({
        include: { class: true, section: true },
      });
    }

    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    // 2. Fetch Subject & Teacher Details
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        class: true,
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            photoUrl: true,
            designation: true,
            department: true,
          },
        },
      },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Security Check: Subject must belong to student's class
    if (subject.classId !== student.classId) {
      return NextResponse.json(
        { error: 'Unauthorized: This subject does not belong to your enrolled class.' },
        { status: 403 }
      );
    }

    // 3. Timetable schedule for this subject
    const timetableSlots = await prisma.timetable.findMany({
      where: {
        classId: student.classId,
        sectionId: student.sectionId,
        subjectId,
        status: 'PUBLISHED',
      },
      include: {
        teacher: { select: { fullName: true, photoUrl: true, email: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    // Current period status
    const schoolTime = getSchoolCurrentTime();
    const currentMin = schoolTime.totalMinutes;
    const todayDay = schoolTime.dayOfWeek;
    let currentPeriod = null;

    for (const slot of timetableSlots) {
      if (slot.dayOfWeek.toUpperCase() === todayDay) {
        const sMin = parseTimeToMinutes(slot.startTime);
        const eMin = parseTimeToMinutes(slot.endTime);
        if (currentMin >= sMin && currentMin <= eMin) {
          currentPeriod = {
            startTime: slot.startTime,
            endTime: slot.endTime,
            roomNo: slot.roomNo || 'Main Classroom',
            isActive: true,
          };
          break;
        }
      }
    }

    // 4. Homeworks with student's individual submission state
    const homeworks = await prisma.homework.findMany({
      where: {
        classId: student.classId,
        sectionId: student.sectionId,
        subjectId,
      },
      include: {
        teacher: { select: { fullName: true } },
        submissions: {
          where: { studentId: student.id },
        },
      },
      orderBy: { dueDate: 'desc' },
    });

    const homeworkList = homeworks.map((hw) => {
      const sub = hw.submissions[0];
      return {
        id: hw.id,
        title: hw.title,
        description: hw.description,
        dueDate: hw.dueDate,
        attachmentsJson: hw.attachmentsJson,
        teacherName: hw.teacher.fullName,
        isSubmitted: !!sub,
        submissionStatus: sub ? sub.status : 'NOT_STARTED',
        submittedAt: sub?.submittedAt || null,
        submissionText: sub?.submissionText || null,
        marks: sub?.marks ?? null,
        feedback: sub?.feedback ?? null,
      };
    });

    // 5. Class Tests with student submission state
    const tests = await prisma.classTest.findMany({
      where: {
        classId: student.classId,
        sectionId: student.sectionId,
        subjectId,
      },
      include: {
        teacher: { select: { fullName: true } },
        submissions: {
          where: { studentId: student.id },
        },
      },
      orderBy: { testDate: 'desc' },
    });

    const testList = tests.map((t) => {
      const sub = t.submissions[0];
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        testDate: t.testDate,
        startTime: t.startTime,
        durationMinutes: t.durationMinutes,
        totalMarks: t.totalMarks,
        passingMarks: t.passingMarks,
        paperUrl: t.paperUrl,
        instructions: t.instructions,
        status: t.status,
        isSubmitted: !!sub,
        submissionStatus: sub ? sub.status : 'PENDING',
        marksObtained: sub?.marksObtained ?? null,
        feedback: sub?.feedback ?? null,
      };
    });

    // 6. Study Materials
    const studyMaterials = await prisma.studyMaterial.findMany({
      where: {
        classId: student.classId,
        subjectId,
      },
      include: {
        teacher: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 7. Announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { targetAudience: 'ALL' },
          { targetAudience: 'STUDENTS' },
          { classId: student.classId },
        ],
      },
      orderBy: { publishDate: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      classroom: {
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.code,
        className: student.class.name,
        sectionName: student.section.name,
        teacher: subject.teacher || {
          fullName: timetableSlots[0]?.teacher.fullName || 'Faculty Member',
          photoUrl: timetableSlots[0]?.teacher.photoUrl || null,
          email: timetableSlots[0]?.teacher.email || 'support@hayatabadmodel.edu.pk',
          designation: 'Subject Specialist',
        },
        currentPeriod,
        timetableSlots,
        homeworkList,
        testList,
        studyMaterials,
        announcements,
      },
    });
  } catch (error: any) {
    console.error('Subject classroom error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load classroom' }, { status: 500 });
  }
}
