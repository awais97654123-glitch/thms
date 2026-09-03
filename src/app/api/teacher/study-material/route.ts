import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');

    const where: any = {};
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;

    const materials = await prisma.studyMaterial.findMany({
      where,
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true, code: true } },
        teacher: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, materials });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch study materials' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      teacherId = teacher?.id;
    } else {
      const first = await prisma.teacher.findFirst({ select: { id: true } });
      teacherId = first?.id;
    }

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher profile required' }, { status: 400 });
    }

    const { classId, subjectId, title, description, fileUrl, fileType = 'PDF', topic } = await req.json();

    if (!classId || !subjectId || !title || !fileUrl) {
      return NextResponse.json({ error: 'Class, Subject, Title, and File URL are required' }, { status: 400 });
    }

    const material = await prisma.studyMaterial.create({
      data: {
        classId,
        subjectId,
        teacherId,
        title,
        description: description || null,
        fileUrl,
        fileType,
        topic: topic || null,
      },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true } },
        teacher: { select: { fullName: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Study material uploaded successfully',
      material,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create study material' }, { status: 500 });
  }
}
