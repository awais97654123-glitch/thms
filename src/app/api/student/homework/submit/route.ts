import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { emitRealtimeEvent } from '@/lib/realtime/event-bus';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let student = null;
    if (session.role === 'STUDENT') {
      student = await prisma.student.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            { studentId: session.username },
          ],
        },
      });
    } else {
      student = await prisma.student.findFirst();
    }

    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    const { homeworkId, submissionText, attachmentsJson } = await req.json();
    if (!homeworkId) {
      return NextResponse.json({ error: 'Homework ID is required' }, { status: 400 });
    }

    const homework = await prisma.homework.findUnique({
      where: { id: homeworkId },
    });

    if (!homework) {
      return NextResponse.json({ error: 'Homework assignment not found' }, { status: 404 });
    }

    const isLate = new Date() > new Date(homework.dueDate);

    const submission = await prisma.homeworkSubmission.upsert({
      where: {
        homeworkId_studentId: {
          homeworkId,
          studentId: student.id,
        },
      },
      update: {
        submissionText: submissionText || null,
        attachmentsJson: attachmentsJson ? JSON.stringify(attachmentsJson) : null,
        submittedAt: new Date(),
        status: isLate ? 'LATE' : 'SUBMITTED',
      },
      create: {
        homeworkId,
        studentId: student.id,
        submissionText: submissionText || null,
        attachmentsJson: attachmentsJson ? JSON.stringify(attachmentsJson) : null,
        submittedAt: new Date(),
        status: isLate ? 'LATE' : 'SUBMITTED',
      },
    });

    // Realtime notification to Teacher
    emitRealtimeEvent('HOMEWORK_SUBMITTED', {
      classId: homework.classId,
      sectionId: homework.sectionId,
      subjectId: homework.subjectId,
      teacherId: homework.teacherId,
      studentId: student.id,
      data: {
        homeworkId,
        studentName: student.fullName,
        submittedAt: submission.submittedAt,
        status: submission.status,
      },
    });

    return NextResponse.json({
      success: true,
      message: isLate ? 'Homework submitted (marked late due to passed deadline)' : 'Homework submitted successfully!',
      submission,
    });
  } catch (error: any) {
    console.error('Submit homework error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit homework' }, { status: 500 });
  }
}
