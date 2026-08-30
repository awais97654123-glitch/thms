import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getCurrentUser();
    const { status, reviewNotes, interviewDate, testDate, testMarks, rejectionReason } = await req.json();

    const application = await prisma.admissionApplication.update({
      where: { id },
      data: {
        status,
        reviewNotes: reviewNotes !== undefined ? reviewNotes : undefined,
        interviewDate: interviewDate ? new Date(interviewDate) : undefined,
        testDate: testDate ? new Date(testDate) : undefined,
        testMarks: testMarks !== undefined ? parseFloat(testMarks) : undefined,
        rejectionReason: rejectionReason !== undefined ? rejectionReason : undefined,
      },
    });

    await logAuditEvent({
      userId: session?.userId,
      userName: session?.fullName || 'Admin',
      role: session?.role || 'ADMIN',
      action: 'ADMISSION_STATUS_UPDATED',
      entity: 'AdmissionApplication',
      entityId: id,
      details: {
        applicationNo: application.applicationNo,
        newStatus: status,
        reviewNotes,
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update admission status' }, { status: 500 });
  }
}
