import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch inventory items' }, { status: 500 });
  }
}
