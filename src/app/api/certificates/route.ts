import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateCertificateNumber, generateQrToken } from '@/lib/id-generator';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    const where: any = {};
    if (studentId) where.studentId = studentId;

    const certificates = await prisma.certificate.findMany({
      where,
      orderBy: { issueDate: 'desc' },
      include: {
        student: {
          include: {
            class: true,
            section: true,
            parent: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, certificates });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const { studentId, type = 'BONAFIDE', purpose, remarks } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true, section: true, parent: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const certificateNo = await generateCertificateNumber(type, 2026);
    const qrToken = `THMS-CERT-${certificateNo}-${Date.now()}`;

    const certificate = await prisma.certificate.create({
      data: {
        certificateNo,
        studentId: student.id,
        type,
        issueDate: new Date(),
        purpose,
        remarks: remarks || 'Exemplary character and academic dedication',
        qrToken,
        generatedById: session?.userId,
      },
      include: {
        student: {
          include: {
            class: true,
            section: true,
            parent: true,
          },
        },
      },
    });

    await logAuditEvent({
      userId: session?.userId,
      userName: session?.fullName || 'Admin',
      role: session?.role || 'ADMIN',
      action: 'CERTIFICATE_GENERATED',
      entity: 'Certificate',
      entityId: certificate.id,
      details: `Generated ${type} Certificate (${certificate.certificateNo}) for ${student.fullName}`,
    });

    return NextResponse.json({ success: true, certificate });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}
