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

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const query = searchParams.get('q') || '';

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    // If role is TEACHER, verify authorization
    if (session.role === 'TEACHER') {
      const teacher = await prisma.teacher.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            { email: session.email || '' },
            { employeeId: session.username },
          ],
        },
        include: {
          assignments: true,
          managedSections: true,
          subjects: true,
        },
      });

      if (!teacher) {
        return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
      }

      // Check if teacher has assignment for this class (and section if specified)
      const hasAssignment = teacher.assignments.some(
        a => a.classId === classId && (!sectionId || a.sectionId === sectionId)
      ) || teacher.managedSections.some(
        s => s.classId === classId && (!sectionId || s.id === sectionId)
      ) || teacher.subjects.some(
        sub => sub.classId === classId
      );

      if (!hasAssignment) {
        return NextResponse.json(
          { error: 'Access denied: You are not assigned to this class/section' },
          { status: 403 }
        );
      }
    }

    // Query enrolled students
    const whereClause: any = {
      classId,
      status: 'ENROLLED',
    };
    if (sectionId) {
      whereClause.sectionId = sectionId;
    }
    if (query) {
      whereClause.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { rollNo: { contains: query, mode: 'insensitive' } },
        { studentId: { contains: query, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        class: true,
        section: true,
        parent: {
          select: {
            fatherName: true,
            fatherPhone: true,
            fatherEmail: true,
          },
        },
      },
      orderBy: { rollNo: 'asc' },
    });

    return NextResponse.json({
      success: true,
      count: students.length,
      students: students.map(s => ({
        id: s.id,
        studentId: s.studentId,
        rollNo: s.rollNo,
        fullName: s.fullName,
        gender: s.gender,
        photoUrl: s.photoUrl,
        className: s.class.name,
        sectionName: s.section.name,
        fatherName: s.parent?.fatherName || 'Guardian',
        fatherPhone: s.parent?.fatherPhone || 'N/A',
      })),
    });
  } catch (error: any) {
    console.error('Fetch teacher students error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch students' }, { status: 500 });
  }
}
