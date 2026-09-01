import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPermission(session.role, 'transport.manage') && session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'PARENT') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const routes = await prisma.transportRoute.findMany({
      include: {
        vehicle: true,
        stops: { orderBy: { orderIndex: 'asc' } },
        students: {
          include: {
            student: { select: { id: true, fullName: true, studentId: true, class: { select: { name: true } } } },
            stop: true,
          },
        },
      },
    });

    const vehicles = await prisma.transportVehicle.findMany({
      orderBy: { vehicleNo: 'asc' },
    });

    // Stats
    const totalStudentsOnTransport = await prisma.studentTransport.count({ where: { status: 'ACTIVE' } });

    return NextResponse.json({
      success: true,
      routes,
      vehicles,
      stats: {
        totalRoutes: routes.length,
        totalVehicles: vehicles.length,
        activeVehicles: vehicles.filter(v => v.isActive).length,
        totalStudentsOnTransport,
      },
    });
  } catch (error) {
    console.error('Transport fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch transport data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPermission(session.role, 'transport.manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'ADD_VEHICLE') {
      const { vehicleNo, model, capacity, driverName, driverPhone, helperName, helperPhone } = body;
      if (!vehicleNo || !model || !driverName || !driverPhone) {
        return NextResponse.json({ error: 'Vehicle number, model, driver name, and driver phone are required' }, { status: 400 });
      }

      const vehicle = await prisma.transportVehicle.create({
        data: { vehicleNo, model, capacity: capacity || 30, driverName, driverPhone, helperName, helperPhone },
      });

      await logAuditEvent({
        userId: session.userId, userName: session.fullName || session.username, role: session.role,
        action: 'VEHICLE_ADDED', entity: 'TransportVehicle', entityId: vehicle.id,
        details: `Vehicle added: ${vehicleNo} (${model})`,
      });

      return NextResponse.json({ success: true, vehicle });
    }

    if (action === 'ADD_ROUTE') {
      const { routeName, vehicleId, startPoint, endPoint, monthlyFee, stops } = body;
      if (!routeName || !startPoint) {
        return NextResponse.json({ error: 'Route name and start point are required' }, { status: 400 });
      }

      const route = await prisma.transportRoute.create({
        data: {
          routeName,
          vehicleId: vehicleId || null,
          startPoint,
          endPoint: endPoint || 'The Hayatabad Model School Campus',
          monthlyFee: monthlyFee || 3500,
          stops: stops?.length ? {
            create: stops.map((stop: any, idx: number) => ({
              stopName: stop.stopName,
              pickupTime: stop.pickupTime || '07:00 AM',
              dropTime: stop.dropTime || '02:00 PM',
              orderIndex: idx,
              stopFee: stop.stopFee || 0,
            })),
          } : undefined,
        },
        include: { vehicle: true, stops: true },
      });

      await logAuditEvent({
        userId: session.userId, userName: session.fullName || session.username, role: session.role,
        action: 'ROUTE_ADDED', entity: 'TransportRoute', entityId: route.id,
        details: `Route added: ${routeName}`,
      });

      return NextResponse.json({ success: true, route });
    }

    if (action === 'ASSIGN_STUDENT') {
      const { studentId, routeId, stopId } = body;
      if (!studentId || !routeId) {
        return NextResponse.json({ error: 'Student ID and route ID are required' }, { status: 400 });
      }

      const assignment = await prisma.studentTransport.upsert({
        where: { studentId },
        create: { studentId, routeId, stopId: stopId || null },
        update: { routeId, stopId: stopId || null, status: 'ACTIVE' },
      });

      await logAuditEvent({
        userId: session.userId, userName: session.fullName || session.username, role: session.role,
        action: 'TRANSPORT_ASSIGNED', entity: 'StudentTransport', entityId: assignment.id,
        details: `Student assigned to transport route`,
      });

      return NextResponse.json({ success: true, assignment });
    }

    return NextResponse.json({ error: 'Invalid action. Use ADD_VEHICLE, ADD_ROUTE, or ASSIGN_STUDENT' }, { status: 400 });
  } catch (error) {
    console.error('Transport action error:', error);
    return NextResponse.json({ error: 'Transport operation failed' }, { status: 500 });
  }
}
