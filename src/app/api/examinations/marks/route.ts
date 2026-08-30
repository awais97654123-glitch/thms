import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examScheduleId = searchParams.get('examScheduleId');
    const studentId = searchParams.get('studentId');

    const where: any = {};
    if (examScheduleId) where.examScheduleId = examScheduleId;
    if (studentId) where.studentId = studentId;

    const marks = await prisma.mark.findMany({
      where,
      include: {
        student: true,
        examSchedule: {
          include: {
            subject: true,
            class: true,
            section: true,
            exam: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, marks });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch exam marks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const { examScheduleId, entries } = await req.json();

    if (!examScheduleId || !entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: 'Invalid marks entry payload' }, { status: 400 });
    }

    const schedule = await prisma.examSchedule.findUnique({
      where: { id: examScheduleId },
      include: { subject: true, class: true },
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Exam schedule not found' }, { status: 404 });
    }

    const gradeRules = await prisma.gradeRule.findMany({
      orderBy: { minPercentage: 'desc' },
    });

    const computeGrade = (percentage: number) => {
      for (const rule of gradeRules) {
        if (percentage >= rule.minPercentage) {
          return { grade: rule.grade, gpa: rule.gpa };
        }
      }
      return { grade: 'F', gpa: 0.0 };
    };

    for (const entry of entries) {
      const marksObtained = parseFloat(entry.marksObtained) || 0;
      const percentage = (marksObtained / schedule.totalMarks) * 100;
      const { grade, gpa } = computeGrade(percentage);

      await prisma.mark.upsert({
        where: {
          examScheduleId_studentId: {
            examScheduleId,
            studentId: entry.studentId,
          },
        },
        update: {
          marksObtained,
          percentage,
          grade,
          gpa,
          remarks: entry.remarks || null,
          enteredById: session?.userId,
        },
        create: {
          examScheduleId,
          studentId: entry.studentId,
          marksObtained,
          percentage,
          grade,
          gpa,
          remarks: entry.remarks || null,
          enteredById: session?.userId,
        },
      });
    }

    await logAuditEvent({
      userId: session?.userId,
      userName: session?.fullName || 'Teacher/Admin',
      role: session?.role || 'TEACHER',
      action: 'EXAM_MARKS_RECORDED',
      entity: 'Mark',
      details: `Entered marks for ${entries.length} students in ${schedule.subject.name} (${schedule.class.name})`,
    });

    return NextResponse.json({
      success: true,
      message: `Marks recorded successfully for ${entries.length} students`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to record marks' }, { status: 500 });
  }
}
