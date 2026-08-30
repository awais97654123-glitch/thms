import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');
    const query = searchParams.get('q');
    const status = searchParams.get('status');

    const where: any = {};
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (status && status !== 'ALL') where.status = status;
    if (query) {
      where.OR = [
        { studentId: { contains: query } },
        { admissionNo: { contains: query } },
        { rollNo: { contains: query } },
        { fullName: { contains: query } },
        { parent: { fatherName: { contains: query } } },
        { parent: { fatherPhone: { contains: query } } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: { rollNo: 'asc' },
      include: {
        class: true,
        section: true,
        session: true,
        parent: true,
        _count: {
          select: {
            attendances: true,
            invoices: true,
            marks: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, students });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
