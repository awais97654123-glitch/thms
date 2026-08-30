import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const books = await prisma.libraryBook.findMany({
      orderBy: { title: 'asc' },
      include: {
        issues: {
          where: { isReturned: false },
          include: { student: true, teacher: true },
        },
      },
    });

    return NextResponse.json({ success: true, books });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch library books' }, { status: 500 });
  }
}
