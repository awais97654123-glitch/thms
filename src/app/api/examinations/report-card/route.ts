import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const examId = searchParams.get('examId');

    if (!studentId || !examId) {
      return NextResponse.json({ error: 'studentId and examId are required' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true,
        section: true,
        parent: true,
      },
    });

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        session: true,
        schedules: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!student || !exam) {
      return NextResponse.json({ error: 'Student or Exam not found' }, { status: 404 });
    }

    // Fetch marks for this student across all schedules in this exam
    const marks = await prisma.mark.findMany({
      where: {
        studentId: student.id,
        examSchedule: {
          examId: exam.id,
        },
      },
      include: {
        examSchedule: {
          include: {
            subject: true,
          },
        },
      },
    });

    const markRows = marks.map((m) => ({
      subjectName: m.examSchedule.subject.name,
      totalMarks: m.examSchedule.totalMarks,
      obtainedMarks: m.marksObtained,
      percentage: m.percentage,
      grade: m.grade,
      gpa: m.gpa,
      remarks: m.remarks,
    }));

    return NextResponse.json({
      success: true,
      reportCard: {
        student: {
          studentId: student.studentId,
          admissionNo: student.admissionNo,
          rollNo: student.rollNo,
          fullName: student.fullName,
          dob: student.dob,
          className: student.class.name,
          sectionName: student.section.name,
          fatherName: student.parent?.fatherName || 'Guardian',
        },
        exam: {
          name: exam.name,
          term: exam.term,
        },
        sessionName: exam.session.name,
        marks: markRows,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate report card' }, { status: 500 });
  }
}
