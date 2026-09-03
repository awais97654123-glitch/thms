import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { emitRealtimeEvent } from '@/lib/realtime/event-bus';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const subjectId = searchParams.get('subjectId');

    const where: any = {};
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (subjectId) where.subjectId = subjectId;

    const tests = await prisma.classTest.findMany({
      where,
      include: {
        class: { select: { name: true } },
        section: { select: { name: true } },
        subject: { select: { name: true, code: true } },
        teacher: { select: { fullName: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { testDate: 'desc' },
    });

    return NextResponse.json({ success: true, tests });
  } catch (error: any) {
    console.error('Fetch tests error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch tests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve teacher ID
    let teacherId = null;
    if (session.role === 'TEACHER') {
      const teacher = await prisma.teacher.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            { email: session.email || '' },
            { employeeId: session.username },
          ],
        },
        select: { id: true },
      });
      if (!teacher) {
        return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
      }
      teacherId = teacher.id;
    } else if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
      const firstTeacher = await prisma.teacher.findFirst({ select: { id: true } });
      teacherId = firstTeacher?.id || '';
    }

    const body = await req.json();
    const {
      classId,
      sectionId,
      subjectId,
      title,
      description,
      testDate,
      startTime,
      durationMinutes = 45,
      totalMarks = 25,
      passingMarks = 10,
      paperUrl,
      instructions,
    } = body;

    if (!classId || !sectionId || !subjectId || !title || !testDate) {
      return NextResponse.json(
        { error: 'Class, Section, Subject, Title, and Test Date are required.' },
        { status: 400 }
      );
    }

    const test = await prisma.classTest.create({
      data: {
        classId,
        sectionId,
        subjectId,
        teacherId: teacherId!,
        title,
        description: description || null,
        testDate: new Date(testDate),
        startTime: startTime || '09:00',
        durationMinutes: Number(durationMinutes) || 45,
        totalMarks: Number(totalMarks) || 25,
        passingMarks: Number(passingMarks) || 10,
        paperUrl: paperUrl || null,
        instructions: instructions || null,
        status: 'PUBLISHED',
      },
      include: {
        class: { select: { name: true } },
        section: { select: { name: true } },
        subject: { select: { name: true } },
      },
    });

    // Broadcast real-time event to Student Portal
    emitRealtimeEvent('TEST_CREATED', {
      classId,
      sectionId,
      subjectId,
      teacherId: teacherId!,
      data: {
        testId: test.id,
        title: test.title,
        subjectName: test.subject.name,
        testDate: test.testDate,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Class test created and published successfully.',
      test,
    });
  } catch (error: any) {
    console.error('Create test error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create test' }, { status: 500 });
  }
}
