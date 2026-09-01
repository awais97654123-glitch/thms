import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const query = searchParams.get('q');
    const status = searchParams.get('status');

    const where: any = {};
    if (role && role !== 'ALL') where.role = role;
    if (status && status !== 'ALL') where.status = status;
    if (query) {
      where.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { employeeId: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    const staff = await prisma.staff.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
            lastLoginAt: true,
          },
        },
      },
    });

    const [totalStaff, activeCount, roleCounts] = await Promise.all([
      prisma.staff.count(),
      prisma.staff.count({ where: { status: 'ACTIVE' } }),
      prisma.staff.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      staff,
      stats: {
        totalStaff,
        activeCount,
        roleCounts,
      },
    });
  } catch (error) {
    console.error('Staff fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch staff members' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPermission(session.role, 'staff.manage') && session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { fullName, role, phone, email, address, joiningDate, createPortalAccount } = body;

    if (!fullName || !role || !phone) {
      return NextResponse.json({ error: 'Full name, role, and phone are required' }, { status: 400 });
    }

    // Auto-generate employee ID e.g. EMP-S-0205
    const count = await prisma.staff.count();
    const employeeId = `EMP-S-${(200 + count + 1).toString().padStart(4, '0')}`;

    const newStaff = await prisma.$transaction(async (tx) => {
      let userId: string | undefined = undefined;

      if (createPortalAccount) {
        const username = employeeId.toLowerCase().replace(/[^a-z0-9]/g, '');
        const defaultPasswordHash = await hashPassword('Staff@123');

        const user = await tx.user.create({
          data: {
            username,
            email: email || `${username}@hayatabadmodel.edu.pk`,
            passwordHash: defaultPasswordHash,
            role: role === 'ACCOUNTANT' ? 'ACCOUNTANT' : role === 'LIBRARIAN' ? 'LIBRARIAN' : 'STAFF',
            status: 'ACTIVE',
            isFirstLogin: true,
          },
        });
        userId = user.id;
      }

      const staff = await tx.staff.create({
        data: {
          employeeId,
          fullName,
          role,
          phone,
          email: email || null,
          address: address || null,
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          status: 'ACTIVE',
          userId: userId || null,
        },
      });

      return staff;
    });

    await logAuditEvent({
      userId: session.userId,
      userName: session.fullName || session.username,
      role: session.role,
      action: 'STAFF_CREATED',
      entity: 'Staff',
      entityId: newStaff.id,
      details: `New staff added: ${fullName} (${role}) - ${newStaff.employeeId}`,
    });

    return NextResponse.json({ success: true, staff: newStaff });
  } catch (error: any) {
    console.error('Staff creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create staff' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPermission(session.role, 'staff.manage') && session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { id, fullName, role, phone, email, address, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }

    const updated = await prisma.staff.update({
      where: { id },
      data: {
        fullName: fullName || undefined,
        role: role || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        status: status || undefined,
      },
    });

    await logAuditEvent({
      userId: session.userId,
      userName: session.fullName || session.username,
      role: session.role,
      action: 'STAFF_UPDATED',
      entity: 'Staff',
      entityId: id,
      details: `Staff updated: ${updated.fullName} (${updated.role})`,
    });

    return NextResponse.json({ success: true, staff: updated });
  } catch (error: any) {
    console.error('Staff update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update staff' }, { status: 500 });
  }
}
