import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !session.studentId) {
      return NextResponse.json(
        { error: 'Only enrolled students can submit homework assignments' },
        { status: 403 }
      );
    }

    const { homeworkId, submissionText, attachmentsJson } = await req.json();

    if (!homeworkId) {
      return NextResponse.json({ error: 'Homework ID is required' }, { status: 400 });
    }

    const homework = await prisma.homework.findUnique({
      where: { id: homeworkId },
      include: {
        teacher: { include: { user: true } },
        class: true,
        section: true,
        subject: true,
      },
    });

    if (!homework) {
      return NextResponse.json({ error: 'Homework assignment not found' }, { status: 404 });
    }

    const isLate = new Date() > new Date(homework.dueDate);

    // Upsert student homework submission
    const submission = await prisma.homeworkSubmission.upsert({
      where: {
        homeworkId_studentId: {
          homeworkId: homework.id,
          studentId: session.studentId,
        },
      },
      update: {
        submissionText: submissionText || null,
        attachmentsJson: attachmentsJson ? JSON.stringify(attachmentsJson) : null,
        submittedAt: new Date(),
        status: isLate ? 'LATE' : 'SUBMITTED',
      },
      create: {
        homeworkId: homework.id,
        studentId: session.studentId,
        submissionText: submissionText || null,
        attachmentsJson: attachmentsJson ? JSON.stringify(attachmentsJson) : null,
        status: isLate ? 'LATE' : 'SUBMITTED',
      },
    });

    // Notify teacher
    if (homework.teacher.user?.id) {
      await prisma.notification.create({
        data: {
          userId: homework.teacher.user.id,
          title: `📝 New Submission: ${homework.subject.name}`,
          message: `${session.fullName || session.username} submitted their assignment for "${homework.title}" (${isLate ? 'Late' : 'On Time'}).`,
          type: 'INFO',
          link: '/teacher/homework',
        },
      });
    }

    // Audit log
    await logAuditEvent({
      userId: session.userId,
      userName: session.fullName || session.username,
      role: 'STUDENT',
      action: 'HOMEWORK_SUBMISSION',
      entity: 'HomeworkSubmission',
      entityId: submission.id,
      details: JSON.stringify({
        homeworkTitle: homework.title,
        subject: homework.subject.name,
        isLate,
      }),
    });

    return NextResponse.json({
      success: true,
      message: isLate ? 'Assignment submitted (marked as late)' : 'Assignment submitted successfully',
      submission,
    });
  } catch (error: any) {
    console.error('Error submitting homework:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit homework' },
      { status: 500 }
    );
  }
}
