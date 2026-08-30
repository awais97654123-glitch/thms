import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    const where: any = {};
    if (sessionId) where.sessionId = sessionId;

    const exams = await prisma.exam.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: {
        session: true,
        schedules: {
          include: {
            class: true,
            section: true,
            subject: true,
            _count: { select: { marks: true } },
          },
          orderBy: { examDate: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, exams });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch examinations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const body = await req.json();

    const activeSession = await prisma.academicSession.findFirst({
      where: { isCurrent: true },
    });

    if (!activeSession) {
      return NextResponse.json({ error: 'No active session found' }, { status: 400 });
    }

    const exam = await prisma.exam.create({
      data: {
        name: body.name,
        sessionId: activeSession.id,
        term: body.term || 'MID_TERM',
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        status: body.status || 'SCHEDULED',
      },
    });

    if (body.schedules && Array.isArray(body.schedules)) {
      for (const s of body.schedules) {
        await prisma.examSchedule.create({
          data: {
            examId: exam.id,
            classId: s.classId,
            sectionId: s.sectionId,
            subjectId: s.subjectId,
            examDate: new Date(s.examDate),
            startTime: s.startTime || '09:00',
            endTime: s.endTime || '12:00',
            roomNo: s.roomNo || 'Examination Hall',
            totalMarks: parseInt(s.totalMarks) || 100,
            passingMarks: parseInt(s.passingMarks) || 33,
          },
        });
      }
    }

    await logAuditEvent({
      userId: session?.userId,
      userName: session?.fullName || 'Exam Coordinator',
      role: session?.role || 'ADMIN',
      action: 'EXAM_CREATED',
      entity: 'Exam',
      entityId: exam.id,
      details: `Created examination: ${exam.name}`,
    });

    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
  }
}
