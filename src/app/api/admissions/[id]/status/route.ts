import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getCurrentUser();
    const body = await req.json().catch(() => ({}));
    const { status, reviewNotes, interviewDate, testDate, testMarks, rejectionReason } = body;

    // Check if application exists
    const existing = await prisma.admissionApplication.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Admission application not found' }, { status: 404 });
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (reviewNotes !== undefined) {
      updateData.reviewNotes = reviewNotes || null;
    }

    if (rejectionReason !== undefined) {
      updateData.rejectionReason = rejectionReason || null;
    }

    // Safely parse dates
    if (interviewDate) {
      const parsedDate = new Date(interviewDate);
      if (!isNaN(parsedDate.getTime())) {
        updateData.interviewDate = parsedDate;
      }
    } else if (interviewDate === null || interviewDate === '') {
      updateData.interviewDate = null;
    }

    if (testDate) {
      const parsedDate = new Date(testDate);
      if (!isNaN(parsedDate.getTime())) {
        updateData.testDate = parsedDate;
      }
    } else if (testDate === null || testDate === '') {
      updateData.testDate = null;
    }

    // Safely parse test marks
    if (testMarks !== undefined && testMarks !== null && testMarks !== '') {
      const num = parseFloat(testMarks);
      if (!isNaN(num)) {
        updateData.testMarks = num;
      }
    } else if (testMarks === null || testMarks === '') {
      updateData.testMarks = null;
    }

    const application = await prisma.admissionApplication.update({
      where: { id },
      data: updateData,
    });

    try {
      await logAuditEvent({
        userId: session?.userId,
        userName: session?.fullName || 'Admin',
        role: session?.role || 'ADMIN',
        action: 'ADMISSION_STATUS_UPDATED',
        entity: 'AdmissionApplication',
        entityId: id,
        details: {
          applicationNo: application.applicationNo,
          newStatus: application.status,
          reviewNotes: application.reviewNotes,
          rejectionReason: application.rejectionReason,
        },
      });
    } catch (auditErr) {
      console.warn('Audit log status update non-blocking error:', auditErr);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Status updated to ${application.status}`,
      application 
    });
  } catch (error: any) {
    console.error('Status update error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to update admission status' 
    }, { status: 500 });
  }
}
