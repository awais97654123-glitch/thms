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

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (status && status !== 'ALL') where.status = status;
    if (query) {
      where.OR = [
        { studentId: { contains: query, mode: 'insensitive' } },
        { admissionNo: { contains: query, mode: 'insensitive' } },
        { rollNo: { contains: query, mode: 'insensitive' } },
        { fullName: { contains: query, mode: 'insensitive' } },
        { parent: { fatherName: { contains: query, mode: 'insensitive' } } },
        { parent: { fatherPhone: { contains: query } } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: limit,
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
      }),
    ]);

    return NextResponse.json({
      success: true,
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
