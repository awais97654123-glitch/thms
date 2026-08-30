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

    let targetStudent: any = null;

    if (session.role === 'STUDENT') {
      targetStudent = await prisma.student.findFirst({
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
    } else if (session.role === 'PARENT') {
      const { searchParams } = new URL(req.url);
      const childId = searchParams.get('studentId');

      const parent = await prisma.parent.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            { fatherPhone: session.username },
          ],
        },
        include: {
          students: {
            include: { class: true, section: true },
          },
        },
      });

      if (!parent || parent.students.length === 0) {
        return NextResponse.json({ error: 'No linked children found' }, { status: 404 });
      }

      if (childId) {
        targetStudent = parent.students.find(s => s.id === childId) || parent.students[0];
      } else {
        targetStudent = parent.students[0];
      }
    }

    if (!targetStudent) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    // Fetch marks for this student
    const marks = await prisma.mark.findMany({
      where: {
        studentId: targetStudent.id,
        isPublished: true,
      },
      include: {
        examSchedule: {
          include: {
            exam: true,
            subject: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group marks by Exam
    const examMap: Record<string, {
      examId: string;
      examName: string;
      term: string;
      totalObtained: number;
      totalMax: number;
      percentage: number;
      gpaAverage: number;
      subjects: any[];
    }> = {};

    marks.forEach((m) => {
      const exam = m.examSchedule.exam;
      if (!examMap[exam.id]) {
        examMap[exam.id] = {
          examId: exam.id,
          examName: exam.name,
          term: exam.term,
          totalObtained: 0,
          totalMax: 0,
          percentage: 0,
          gpaAverage: 0,
          subjects: [],
        };
      }

      examMap[exam.id].totalObtained += m.marksObtained;
      examMap[exam.id].totalMax += m.totalMarks;
      examMap[exam.id].subjects.push({
        subjectName: m.examSchedule.subject.name,
        subjectCode: m.examSchedule.subject.code,
        marksObtained: m.marksObtained,
        totalMarks: m.totalMarks,
        percentage: m.percentage,
        grade: m.grade,
        gpa: m.gpa,
        remarks: m.remarks,
      });
    });

    // Compute overall statistics per exam
    const examReports = Object.values(examMap).map((ex) => {
      const overallPct = ex.totalMax > 0 ? parseFloat(((ex.totalObtained / ex.totalMax) * 100).toFixed(2)) : 0;
      const gpaSum = ex.subjects.reduce((sum, s) => sum + s.gpa, 0);
      const avgGpa = ex.subjects.length > 0 ? parseFloat((gpaSum / ex.subjects.length).toFixed(2)) : 0;

      return {
        ...ex,
        percentage: overallPct,
        gpaAverage: avgGpa,
      };
    });

    return NextResponse.json({
      success: true,
      student: {
        id: targetStudent.id,
        fullName: targetStudent.fullName,
        studentId: targetStudent.studentId,
        rollNo: targetStudent.rollNo,
        className: targetStudent.class.name,
        sectionName: targetStudent.section.name,
      },
      reports: examReports,
    });
  } catch (error: any) {
    console.error('Fetch student results error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch results' }, { status: 500 });
  }
}
