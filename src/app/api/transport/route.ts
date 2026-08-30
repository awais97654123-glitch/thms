import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const routes = await prisma.transportRoute.findMany({
      include: {
        vehicle: true,
        stops: { orderBy: { orderIndex: 'asc' } },
        students: {
          include: { student: true, stop: true },
        },
      },
    });

    const vehicles = await prisma.transportVehicle.findMany();

    return NextResponse.json({ success: true, routes, vehicles });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch transport' }, { status: 500 });
  }
}
