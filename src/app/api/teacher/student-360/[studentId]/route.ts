import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/teacher/student-360/[studentId]
 * Full Student 360 profile with academic history, attendance, homework, and tests.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId } = params;
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // 1. Fetch Student Core Details
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true,
        section: true,
        session: true,
        parent: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    // 2. Fetch Attendance History (last 30 days)
    const attendances = await prisma.attendance.findMany({
      where: { studentId: student.id },
      orderBy: { date: 'desc' },
      take: 30,
    });

    const totalAtt = attendances.length;
    const presentCount = attendances.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendancePercentage = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;

    // 3. Fetch Homework Submissions & Assigned Homework
    const [assignedHomeworks, homeworkSubmissions] = await Promise.all([
      prisma.homework.findMany({
        where: {
          classId: student.classId,
          sectionId: student.sectionId,
        },
        include: {
          subject: { select: { name: true, code: true } },
          teacher: { select: { fullName: true } },
        },
        orderBy: { dueDate: 'desc' },
        take: 15,
      }),
      prisma.homeworkSubmission.findMany({
        where: { studentId: student.id },
        include: {
          homework: {
            include: { subject: { select: { name: true } } },
          },
        },
        orderBy: { submittedAt: 'desc' },
      }),
    ]);

    // Map homework status
    const homeworkOverview = assignedHomeworks.map((hw) => {
      const sub = homeworkSubmissions.find((s) => s.homeworkId === hw.id);
      return {
        id: hw.id,
        title: hw.title,
        subjectName: hw.subject.name,
        teacherName: hw.teacher.fullName,
        dueDate: hw.dueDate,
        isSubmitted: !!sub,
        submissionStatus: sub ? sub.status : 'PENDING',
        marks: sub?.marks ?? null,
        feedback: sub?.feedback ?? null,
        submittedAt: sub?.submittedAt ?? null,
      };
    });

    // 4. Fetch Tests & Exam Results
    const [testSubmissions, examMarks, studyMaterials] = await Promise.all([
      prisma.classTestSubmission.findMany({
        where: { studentId: student.id },
        include: {
          test: {
            include: { subject: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mark.findMany({
        where: { studentId: student.id },
        include: {
          examSchedule: {
            include: {
              exam: true,
              subject: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studyMaterial.findMany({
        where: { classId: student.classId },
        include: {
          subject: { select: { name: true } },
          teacher: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // 5. Discipline & Notes
    const disciplineRecords = await prisma.studentDiscipline.findMany({
      where: { studentId: student.id },
      orderBy: { incidentDate: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        studentId: student.studentId,
        admissionNo: student.admissionNo,
        rollNo: student.rollNo,
        fullName: student.fullName,
        photoUrl: student.photoUrl,
        gender: student.gender,
        dob: student.dob,
        bloodGroup: student.bloodGroup,
        className: student.class.name,
        sectionName: student.section.name,
        sessionName: student.session.name,
        status: student.status,
        cardStatus: student.cardStatus,
        parent: student.parent
          ? {
              fatherName: student.parent.fatherName,
              fatherPhone: student.parent.fatherPhone,
              address: student.parent.address,
              emergencyContact: student.parent.emergencyContact,
            }
          : null,
      },
      stats: {
        attendancePercentage,
        totalRecordedDays: totalAtt,
        totalHomeworkSubmitted: homeworkSubmissions.length,
        totalHomeworkAssigned: assignedHomeworks.length,
        averageTestScore:
          testSubmissions.length > 0
            ? Math.round(
                testSubmissions.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0) /
                  testSubmissions.length
              )
            : null,
      },
      attendances,
      homework: homeworkOverview,
      testSubmissions: testSubmissions.map((ts) => ({
        id: ts.id,
        testTitle: ts.test.title,
        subjectName: ts.test.subject.name,
        testDate: ts.test.testDate,
        totalMarks: ts.test.totalMarks,
        marksObtained: ts.marksObtained,
        status: ts.status,
        feedback: ts.feedback,
      })),
      examMarks: examMarks.map((m) => ({
        id: m.id,
        examName: m.examSchedule.exam.name,
        subjectName: m.examSchedule.subject.name,
        marksObtained: m.marksObtained,
        totalMarks: m.totalMarks,
        percentage: m.percentage,
        grade: m.grade,
        remarks: m.remarks,
      })),
      studyMaterials,
      disciplineRecords,
    });
  } catch (error: any) {
    console.error('Student 360 Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch Student 360 data' }, { status: 500 });
  }
}
