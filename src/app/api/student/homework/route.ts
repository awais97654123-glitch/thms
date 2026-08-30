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
        include: { students: true },
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

    // Fetch homework targeting this student's class & section
    const homeworks = await prisma.homework.findMany({
      where: {
        classId: targetStudent.classId,
        sectionId: targetStudent.sectionId,
      },
      include: {
        subject: true,
        teacher: true,
        submissions: {
          where: { studentId: targetStudent.id },
        },
      },
      orderBy: { dueDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      count: homeworks.length,
      homeworks: homeworks.map((hw) => {
        const submission = hw.submissions[0] || null;
        const isOverdue = new Date(hw.dueDate) < new Date() && !submission;

        return {
          id: hw.id,
          title: hw.title,
          description: hw.description,
          dueDate: hw.dueDate,
          createdAt: hw.createdAt,
          subjectName: hw.subject.name,
          teacherName: hw.teacher.fullName,
          status: submission ? submission.status : isOverdue ? 'LATE' : 'ASSIGNED',
          submittedAt: submission?.submittedAt || null,
          marks: submission?.marks || null,
          feedback: submission?.feedback || null,
        };
      }),
    });
  } catch (error: any) {
    console.error('Fetch student homework error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch homework' }, { status: 500 });
  }
}
