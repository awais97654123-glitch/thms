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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    // Teachers/staff can only see their own leaves
    // Admins/principals can see all
    if (hasPermission(session.role, 'leave.manage')) {
      if (userId) where.userId = userId;
    } else {
      where.userId = session.userId;
    }

    if (status && status !== 'ALL') where.status = status;

    const [total, leaves] = await Promise.all([
      prisma.leave.count({ where }),
      prisma.leave.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true,
              teacher: { select: { fullName: true, employeeId: true } },
              staff: { select: { fullName: true, employeeId: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      leaves,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Leave fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch leave records' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // APPLY FOR LEAVE (Teacher/Staff/Student)
    if (action === 'APPLY' || !action) {
      if (!hasPermission(session.role, 'leave.apply') && !hasPermission(session.role, 'leave.manage')) {
        return NextResponse.json({ error: 'You do not have permission to apply for leave' }, { status: 403 });
      }

      const { leaveType, startDate, endDate, reason, attachmentUrl } = body;
      if (!leaveType || !startDate || !endDate || !reason) {
        return NextResponse.json({ error: 'Leave type, start date, end date, and reason are required' }, { status: 400 });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        return NextResponse.json({ error: 'End date must be on or after start date' }, { status: 400 });
      }

      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Check for overlapping leave
      const overlapping = await prisma.leave.findFirst({
        where: {
          userId: session.userId,
          status: { in: ['PENDING', 'APPROVED'] },
          OR: [
            { startDate: { lte: end }, endDate: { gte: start } },
          ],
        },
      });

      if (overlapping) {
        return NextResponse.json({ error: 'You already have a leave application overlapping these dates' }, { status: 400 });
      }

      const leave = await prisma.leave.create({
        data: {
          userId: session.userId,
          leaveType,
          startDate: start,
          endDate: end,
          totalDays,
          reason,
          attachmentUrl: attachmentUrl || null,
          status: 'PENDING',
        },
      });

      await logAuditEvent({
        userId: session.userId,
        userName: session.fullName || session.username,
        role: session.role,
        action: 'LEAVE_APPLIED',
        entity: 'Leave',
        entityId: leave.id,
        details: `${leaveType} leave applied: ${startDate} to ${endDate} (${totalDays} days)`,
      });

      return NextResponse.json({ success: true, leave, message: 'Leave application submitted successfully' });
    }

    // APPROVE / REJECT LEAVE (Admin/Principal)
    if (action === 'REVIEW') {
      if (!hasPermission(session.role, 'leave.manage')) {
        return NextResponse.json({ error: 'You do not have permission to review leave applications' }, { status: 403 });
      }

      const { leaveId, decision, notes } = body;
      if (!leaveId || !decision || !['APPROVED', 'REJECTED'].includes(decision)) {
        return NextResponse.json({ error: 'Leave ID and decision (APPROVED/REJECTED) are required' }, { status: 400 });
      }

      const leave = await prisma.leave.findUnique({ where: { id: leaveId } });
      if (!leave) {
        return NextResponse.json({ error: 'Leave record not found' }, { status: 404 });
      }
      if (leave.status !== 'PENDING') {
        return NextResponse.json({ error: 'This leave has already been reviewed' }, { status: 400 });
      }

      const updated = await prisma.leave.update({
        where: { id: leaveId },
        data: {
          status: decision,
          approvedById: session.userId,
          approverNotes: notes || null,
          reviewedAt: new Date(),
        },
      });

      await logAuditEvent({
        userId: session.userId,
        userName: session.fullName || session.username,
        role: session.role,
        action: decision === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
        entity: 'Leave',
        entityId: leaveId,
        details: `Leave ${decision.toLowerCase()} for user ${leave.userId}${notes ? `: ${notes}` : ''}`,
      });

      return NextResponse.json({ success: true, leave: updated, message: `Leave ${decision.toLowerCase()} successfully` });
    }

    // CANCEL OWN LEAVE
    if (action === 'CANCEL') {
      const { leaveId } = body;
      if (!leaveId) {
        return NextResponse.json({ error: 'Leave ID is required' }, { status: 400 });
      }

      const leave = await prisma.leave.findUnique({ where: { id: leaveId } });
      if (!leave) {
        return NextResponse.json({ error: 'Leave record not found' }, { status: 404 });
      }
      if (leave.userId !== session.userId && !hasPermission(session.role, 'leave.manage')) {
        return NextResponse.json({ error: 'You can only cancel your own leave applications' }, { status: 403 });
      }
      if (!['PENDING', 'APPROVED'].includes(leave.status)) {
        return NextResponse.json({ error: 'Cannot cancel a leave that has already been processed' }, { status: 400 });
      }

      const updated = await prisma.leave.update({
        where: { id: leaveId },
        data: { status: 'CANCELLED' },
      });

      await logAuditEvent({
        userId: session.userId,
        userName: session.fullName || session.username,
        role: session.role,
        action: 'LEAVE_CANCELLED',
        entity: 'Leave',
        entityId: leaveId,
        details: `Leave cancelled`,
      });

      return NextResponse.json({ success: true, leave: updated, message: 'Leave cancelled' });
    }

    return NextResponse.json({ error: 'Invalid action. Use APPLY, REVIEW, or CANCEL' }, { status: 400 });
  } catch (error) {
    console.error('Leave action error:', error);
    return NextResponse.json({ error: 'Leave operation failed' }, { status: 500 });
  }
}
