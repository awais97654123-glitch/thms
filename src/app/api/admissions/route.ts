import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateApplicationNumber } from '@/lib/id-generator';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const classId = searchParams.get('classId');
    const query = searchParams.get('q');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (classId) where.applyingClassId = classId;
    if (query) {
      where.OR = [
        { applicationNo: { contains: query } },
        { fullName: { contains: query } },
        { fatherName: { contains: query } },
        { fatherPhone: { contains: query } },
      ];
    }

    const applications = await prisma.admissionApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        session: true,
      },
    });

    const classes = await prisma.class.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    const classMap: Record<string, string> = {};
    classes.forEach((c) => {
      classMap[c.id] = c.name;
    });

    const enhanced = applications.map((app) => ({
      ...app,
      applyingClassName: classMap[app.applyingClassId] || 'Class',
    }));

    return NextResponse.json({ success: true, applications: enhanced });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch admission applications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const currentSession = await prisma.academicSession.findFirst({
      where: { isCurrent: true },
    });

    if (!currentSession) {
      return NextResponse.json({ error: 'No active academic session found' }, { status: 400 });
    }

    const applicationNo = await generateApplicationNumber(2026);
    const fullName = `${body.firstName || ''} ${body.middleName ? body.middleName + ' ' : ''}${body.lastName || ''}`.trim();

    const application = await prisma.admissionApplication.create({
      data: {
        applicationNo,
        status: 'SUBMITTED',
        sessionId: currentSession.id,
        applyingClassId: body.applyingClassId,
        preferredSectionId: body.preferredSectionId || null,
        firstName: body.firstName,
        middleName: body.middleName || null,
        lastName: body.lastName,
        fullName: fullName || body.firstName,
        dob: new Date(body.dob || '2015-01-01'),
        gender: body.gender || 'MALE',
        bloodGroup: body.bloodGroup || null,
        nationality: body.nationality || 'Pakistani',
        photoUrl: body.photoUrl || null,
        previousSchool: body.previousSchool || null,
        previousClass: body.previousClass || null,
        previousGrade: body.previousGrade || null,
        fatherName: body.fatherName,
        fatherPhone: body.fatherPhone,
        fatherEmail: body.fatherEmail || null,
        fatherOccupation: body.fatherOccupation || null,
        fatherCnic: body.fatherCnic || null,
        motherName: body.motherName || null,
        motherPhone: body.motherPhone || null,
        motherOccupation: body.motherOccupation || null,
        guardianName: body.guardianName || null,
        guardianRelation: body.guardianRelation || null,
        guardianPhone: body.guardianPhone || null,
        guardianEmail: body.guardianEmail || null,
        houseStreet: body.houseStreet || 'Sector F-4, Hayatabad',
        area: body.area || 'Phase 6',
        city: body.city || 'Peshawar',
        district: body.district || 'Peshawar',
        province: body.province || 'KPK',
        postalCode: body.postalCode || '25000',
        emergencyName: body.emergencyName || body.fatherName,
        emergencyRelation: body.emergencyRelation || 'Father',
        emergencyPhone: body.emergencyPhone || body.fatherPhone,
        documentsJson: body.documents ? JSON.stringify(body.documents) : null,
      },
    });

    await logAuditEvent({
      action: 'ADMISSION_SUBMITTED',
      entity: 'AdmissionApplication',
      entityId: application.id,
      details: `New online application submitted: ${application.applicationNo} for ${application.fullName}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Admission application submitted successfully',
      applicationNo: application.applicationNo,
      applicationId: application.id,
    });
  } catch (error) {
    console.error('Admission submit error:', error);
    return NextResponse.json({ error: 'Failed to submit admission application' }, { status: 500 });
  }
}
