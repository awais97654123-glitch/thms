import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { notificationDispatcher } from '@/lib/email/service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const teacherId = searchParams.get('teacherId');

    const where: any = {};
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (teacherId) where.teacherId = teacherId;

    const homeworks = await prisma.homework.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: true,
        submissions: {
          include: { student: true },
        },
      },
    });

    return NextResponse.json({ success: true, homeworks });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch homework' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const body = await req.json();

    const teacher = await prisma.teacher.findFirst({
      where: session?.teacherId ? { id: session.teacherId } : {},
    });

    const homework = await prisma.homework.create({
      data: {
        classId: body.classId,
        sectionId: body.sectionId,
        subjectId: body.subjectId,
        teacherId: teacher?.id || body.teacherId,
        title: body.title,
        description: body.description,
        dueDate: new Date(body.dueDate || Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      include: {
        class: true,
        section: true,
        subject: true,
        teacher: true,
      },
    });

    // Asynchronously dispatch email & portal notifications
    notificationDispatcher
      .onHomeworkPublished({
        homeworkId: homework.id,
        title: homework.title,
        description: homework.description,
        dueDate: homework.dueDate,
        className: homework.class.name,
        sectionName: homework.section.name,
        subjectName: homework.subject.name,
        teacherName: homework.teacher.fullName,
        classId: homework.classId,
        sectionId: homework.sectionId,
      })
      .catch((err) => console.error('Failed to dispatch homework email:', err));

    return NextResponse.json({ success: true, homework });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create homework' }, { status: 500 });
  }
}
