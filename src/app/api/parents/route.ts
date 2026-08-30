import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const parents = await prisma.parent.findMany({
      orderBy: { fatherName: 'asc' },
      include: {
        students: {
          include: {
            class: true,
            section: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, parents });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch parents' }, { status: 500 });
  }
}
