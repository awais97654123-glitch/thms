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

    // Only admins and related roles can see all parents
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'ADMISSION_OFFICER', 'ACCOUNTANT'].includes(session.role);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query) {
      where.OR = [
        { fatherName: { contains: query, mode: 'insensitive' } },
        { fatherPhone: { contains: query } },
        { fatherEmail: { contains: query, mode: 'insensitive' } },
        { fatherCnic: { contains: query } },
        { motherName: { contains: query, mode: 'insensitive' } },
        { guardianName: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [total, parents] = await Promise.all([
      prisma.parent.count({ where }),
      prisma.parent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fatherName: 'asc' },
        include: {
          user: { select: { id: true, username: true, email: true, status: true, lastLoginAt: true } },
          students: {
            include: {
              class: { select: { id: true, name: true } },
              section: { select: { id: true, name: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      parents,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Parents fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch parents' }, { status: 500 });
  }
}
