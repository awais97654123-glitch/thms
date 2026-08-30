import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        sections: {
          include: {
            classTeacher: true,
            _count: { select: { students: true } },
          },
        },
        subjects: {
          include: { teacher: true },
        },
        _count: {
          select: { students: true },
        },
      },
    });

    return NextResponse.json({ success: true, classes });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}
