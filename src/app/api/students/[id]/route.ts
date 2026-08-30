import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id },
          { studentId: id },
          { admissionNo: id },
        ],
      },
      include: {
        class: true,
        section: true,
        session: true,
        parent: true,
        user: { select: { id: true, username: true, email: true, status: true, isFirstLogin: true } },
        attendances: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
            payments: true,
          },
        },
        marks: {
          include: {
            examSchedule: {
              include: {
                exam: true,
                subject: true,
              },
            },
          },
        },
        submissions: {
          include: {
            homework: {
              include: { subject: true },
            },
          },
        },
        certificates: {
          orderBy: { createdAt: 'desc' },
        },
        transport: {
          include: {
            route: {
              include: { vehicle: true },
            },
            stop: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    // Compute summary metrics
    const totalAttendances = student.attendances.length;
    const presentAttendances = student.attendances.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendanceRate = totalAttendances > 0 ? ((presentAttendances / totalAttendances) * 100).toFixed(1) : '100.0';

    const totalFeeBilled = student.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalFeePaid = student.invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalFeeOutstanding = student.invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);

    return NextResponse.json({
      success: true,
      student,
      metrics: {
        attendanceRate: parseFloat(attendanceRate),
        totalAttendances,
        presentAttendances,
        totalFeeBilled,
        totalFeePaid,
        totalFeeOutstanding,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch student profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getCurrentUser();
    const body = await req.json();

    const updated = await prisma.student.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        fullName: `${body.firstName} ${body.lastName}`.trim(),
        rollNo: body.rollNo,
        classId: body.classId,
        sectionId: body.sectionId,
        gender: body.gender,
        bloodGroup: body.bloodGroup,
        status: body.status,
        emergencyPhone: body.emergencyPhone,
      },
      include: {
        class: true,
        section: true,
      },
    });

    await logAuditEvent({
      userId: session?.userId,
      userName: session?.fullName || 'Admin',
      role: session?.role || 'ADMIN',
      action: 'STUDENT_UPDATED',
      entity: 'Student',
      entityId: id,
      details: `Updated student record for ${updated.fullName} (${updated.studentId})`,
    });

    return NextResponse.json({ success: true, student: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}
