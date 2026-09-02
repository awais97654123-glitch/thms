import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isTeacher = session.role === 'TEACHER';
    const isAdmin =
      session.role === 'ADMIN' || session.role === 'SUPER_ADMIN' || session.role === 'PRINCIPAL';

    if (!isTeacher && !isAdmin) {
      return NextResponse.json(
        { error: 'Only teachers and administrators can grade assignments' },
        { status: 403 }
      );
    }

    const { submissionId, marks, feedback } = await req.json();

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    const submission = await prisma.homeworkSubmission.findUnique({
      where: { id: submissionId },
      include: {
        homework: { include: { subject: true, teacher: true } },
        student: { include: { parent: true, user: true } },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Verify teacher owns this assignment unless admin
    if (isTeacher && session.teacherId !== submission.homework.teacherId) {
      return NextResponse.json(
        { error: 'You are not the assigned teacher for this homework' },
        { status: 403 }
      );
    }

    const updated = await prisma.homeworkSubmission.update({
      where: { id: submission.id },
      data: {
        marks: marks !== undefined && marks !== null ? parseFloat(marks) : null,
        feedback: feedback ? feedback.trim() : null,
        status: 'REVIEWED',
        reviewedAt: new Date(),
      },
    });

    // Notify Student
    if (submission.student.user?.id) {
      await prisma.notification.create({
        data: {
          userId: submission.student.user.id,
          title: `🎯 Assignment Graded: ${submission.homework.subject.name}`,
          message: `Your assignment "${submission.homework.title}" was reviewed by ${session.fullName || 'Teacher'}. Score: ${marks !== undefined ? marks : 'Reviewed'}${feedback ? ` • Feedback: "${feedback}"` : ''}`,
          type: 'INFO',
          link: '/student/homework',
        },
      });
    }

    // Notify Parent
    if (submission.student.parent?.userId) {
      await prisma.notification.create({
        data: {
          userId: submission.student.parent.userId,
          title: `🎯 Ward Assignment Graded: ${submission.student.fullName}`,
          message: `${submission.student.fullName}'s homework for ${submission.homework.subject.name} has been evaluated by ${session.fullName || 'Teacher'}.${marks !== undefined ? ` Marks: ${marks}` : ''}`,
          type: 'INFO',
          link: '/parent',
        },
      });
    }

    // Audit Log
    await logAuditEvent({
      userId: session.userId,
      userName: session.fullName || session.username,
      role: session.role,
      action: 'HOMEWORK_GRADED',
      entity: 'HomeworkSubmission',
      entityId: submission.id,
      details: JSON.stringify({
        student: submission.student.fullName,
        homework: submission.homework.title,
        marks,
        feedback,
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'Assignment graded successfully and student/parent notified',
      submission: updated,
    });
  } catch (error: any) {
    console.error('Error grading homework submission:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to grade submission' },
      { status: 500 }
    );
  }
}
