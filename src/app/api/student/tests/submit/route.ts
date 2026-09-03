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

    const { testId, submissionText, attachmentsJson, answersJson } = await req.json();
    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 });
    }

    const test = await prisma.classTest.findUnique({
      where: { id: testId },
    });

    if (!test) {
      return NextResponse.json({ error: 'Class test not found' }, { status: 404 });
    }

    const submission = await prisma.classTestSubmission.upsert({
      where: {
        testId_studentId: {
          testId,
          studentId: student.id,
        },
      },
      update: {
        submissionText: submissionText || null,
        attachmentsJson: attachmentsJson ? JSON.stringify(attachmentsJson) : null,
        answersJson: answersJson ? JSON.stringify(answersJson) : null,
        submittedAt: new Date(),
        status: 'SUBMITTED',
      },
      create: {
        testId,
        studentId: student.id,
        submissionText: submissionText || null,
        attachmentsJson: attachmentsJson ? JSON.stringify(attachmentsJson) : null,
        answersJson: answersJson ? JSON.stringify(answersJson) : null,
        submittedAt: new Date(),
        status: 'SUBMITTED',
      },
    });

    // Real-time event to Teacher
    emitRealtimeEvent('TEST_SUBMITTED', {
      classId: test.classId,
      sectionId: test.sectionId,
      subjectId: test.subjectId,
      teacherId: test.teacherId,
      studentId: student.id,
      data: {
        testId,
        studentName: student.fullName,
        submittedAt: submission.submittedAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Online test answers submitted successfully!',
      submission,
    });
  } catch (error: any) {
    console.error('Submit test error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit test' }, { status: 500 });
  }
}
