import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { emitRealtimeEvent } from '@/lib/realtime/event-bus';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId } = params;
    const test = await prisma.classTest.findUnique({
      where: { id: testId },
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: { select: { fullName: true } },
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                rollNo: true,
                studentId: true,
                photoUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, test });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch test details' }, { status: 500 });
  }
}

/**
 * PUT: Grade a submission
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId } = params;
    const { submissionId, studentId, marksObtained, feedback } = await req.json();

    if (!submissionId && !studentId) {
      return NextResponse.json({ error: 'Submission ID or Student ID required' }, { status: 400 });
    }

    let submission;
    if (submissionId) {
      submission = await prisma.classTestSubmission.update({
        where: { id: submissionId },
        data: {
          marksObtained: Number(marksObtained),
          feedback: feedback || null,
          status: 'GRADED',
          gradedById: session.userId,
          gradedAt: new Date(),
        },
        include: {
          test: { select: { classId: true, sectionId: true, subjectId: true, title: true } },
        },
      });
    } else {
      submission = await prisma.classTestSubmission.upsert({
        where: {
          testId_studentId: {
            testId,
            studentId,
          },
        },
        update: {
          marksObtained: Number(marksObtained),
          feedback: feedback || null,
          status: 'GRADED',
          gradedById: session.userId,
          gradedAt: new Date(),
        },
        create: {
          testId,
          studentId,
          marksObtained: Number(marksObtained),
          feedback: feedback || null,
          status: 'GRADED',
          gradedById: session.userId,
          gradedAt: new Date(),
        },
        include: {
          test: { select: { classId: true, sectionId: true, subjectId: true, title: true } },
        },
      });
    }

    // Realtime notification
    emitRealtimeEvent('MARKS_UPDATED', {
      classId: submission.test.classId,
      sectionId: submission.test.sectionId,
      subjectId: submission.test.subjectId,
      studentId,
      data: {
        testId,
        testTitle: submission.test.title,
        marksObtained,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test marks and feedback recorded successfully.',
      submission,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to grade test submission' }, { status: 500 });
  }
}
