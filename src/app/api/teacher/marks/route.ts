import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

function calculateGradeAndGPA(percentage: number) {
  if (percentage >= 90) return { grade: 'A+', gpa: 4.0, remarks: 'Outstanding' };
  if (percentage >= 80) return { grade: 'A', gpa: 3.7, remarks: 'Excellent' };
  if (percentage >= 70) return { grade: 'B+', gpa: 3.3, remarks: 'Very Good' };
  if (percentage >= 60) return { grade: 'B', gpa: 3.0, remarks: 'Good' };
  if (percentage >= 50) return { grade: 'C', gpa: 2.5, remarks: 'Satisfactory' };
  if (percentage >= 40) return { grade: 'D', gpa: 2.0, remarks: 'Pass' };
  return { grade: 'F', gpa: 0.0, remarks: 'Fail' };
}

// GET /api/teacher/marks - Fetch exam schedules and student marks
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
    const examId = searchParams.get('examId');

    // Get list of exams
    const exams = await prisma.exam.findMany({
      orderBy: { startDate: 'desc' },
    });

    let examSchedules: any[] = [];
    if (classId && subjectId) {
      examSchedules = await prisma.examSchedule.findMany({
        where: {
          classId,
          subjectId,
          ...(sectionId ? { sectionId } : {}),
          ...(examId ? { examId } : {}),
        },
        include: {
          exam: true,
          class: true,
          section: true,
          subject: true,
          marks: {
            include: {
              student: {
                select: {
                  id: true,
                  studentId: true,
                  rollNo: true,
                  fullName: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      exams,
      examSchedules,
    });
  } catch (error: any) {
    console.error('Fetch teacher marks error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch marks' }, { status: 500 });
  }
}

// POST /api/teacher/marks - Save exam marks for students
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { examScheduleId, examId, classId, sectionId, subjectId, totalMarks, marksList } = body;

    if (!Array.isArray(marksList) || marksList.length === 0) {
      return NextResponse.json({ error: 'Marks list is required' }, { status: 400 });
    }

    // Resolve or provision ExamSchedule if needed
    let scheduleId = examScheduleId;
    const maxMarks = parseFloat(totalMarks) || 100;

    if (!scheduleId) {
      if (!examId || !classId || !sectionId || !subjectId) {
        return NextResponse.json({ error: 'Exam, Class, Section, and Subject are required' }, { status: 400 });
      }

      // Find or create ExamSchedule
      let schedule = await prisma.examSchedule.findFirst({
        where: { examId, classId, sectionId, subjectId },
      });

      if (!schedule) {
        schedule = await prisma.examSchedule.create({
          data: {
            examId,
            classId,
            sectionId,
            subjectId,
            examDate: new Date(),
            startTime: '09:00 AM',
            endTime: '12:00 PM',
            totalMarks: Math.round(maxMarks),
          },
        });
      }
      scheduleId = schedule.id;
    }

    // Save marks atomically
    const savedMarks = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const item of marksList) {
        const { studentId, marksObtained, remarks } = item;
        if (!studentId) continue;

        const obtained = parseFloat(marksObtained) || 0;
        if (obtained < 0 || obtained > maxMarks) {
          throw new Error(`Marks obtained (${obtained}) cannot exceed total marks (${maxMarks})`);
        }

        const percentage = parseFloat(((obtained / maxMarks) * 100).toFixed(2));
        const { grade, gpa, remarks: autoRemarks } = calculateGradeAndGPA(percentage);

        const markRecord = await tx.mark.upsert({
          where: {
            examScheduleId_studentId: {
              examScheduleId: scheduleId,
              studentId,
            },
          },
          update: {
            marksObtained: obtained,
            totalMarks: maxMarks,
            percentage,
            grade,
            gpa,
            remarks: remarks || autoRemarks,
            enteredById: session.userId,
            isPublished: true,
            updatedAt: new Date(),
          },
          create: {
            examScheduleId: scheduleId,
            studentId,
            marksObtained: obtained,
            totalMarks: maxMarks,
            percentage,
            grade,
            gpa,
            remarks: remarks || autoRemarks,
            enteredById: session.userId,
            isPublished: true,
          },
        });

        results.push(markRecord);
      }

      return results;
    });

    await logAuditEvent({
      userName: session.username || session.fullName || 'Teacher',
      role: session.role,
      action: 'EXAM_MARKS_SUBMITTED',
      entity: 'Mark',
      entityId: scheduleId,
      details: `Entered marks for ${savedMarks.length} students (ExamSchedule: ${scheduleId})`,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully saved marks for ${savedMarks.length} students`,
      count: savedMarks.length,
    });
  } catch (error: any) {
    console.error('Save teacher marks error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save marks' }, { status: 500 });
  }
}
