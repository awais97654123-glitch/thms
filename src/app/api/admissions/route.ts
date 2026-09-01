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

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (classId) where.applyingClassId = classId;
    if (query) {
      where.OR = [
        { applicationNo: { contains: query, mode: 'insensitive' } },
        { fullName: { contains: query, mode: 'insensitive' } },
        { fatherName: { contains: query, mode: 'insensitive' } },
        { fatherPhone: { contains: query } },
      ];
    }

    const [total, applications, classes] = await Promise.all([
      prisma.admissionApplication.count({ where }),
      prisma.admissionApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          session: true,
        },
      }),
      prisma.class.findMany({
        orderBy: { orderIndex: 'asc' },
      }),
    ]);

    const classMap: Record<string, string> = {};
    classes.forEach((c) => {
      classMap[c.id] = c.name;
    });

    const enhanced = applications.map((app) => ({
      ...app,
      applyingClassName: classMap[app.applyingClassId] || 'Class 8',
    }));

    return NextResponse.json({
      success: true,
      applications: enhanced,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admission fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch admission applications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Resolve Academic Session
    let currentSession = await prisma.academicSession.findFirst({
      where: { isCurrent: true },
    });

    if (!currentSession) {
      currentSession = await prisma.academicSession.findFirst({
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!currentSession) {
      currentSession = await prisma.academicSession.create({
        data: {
          name: 'Academic Session 2026-2027',
          code: '2026',
          startDate: new Date('2026-04-01'),
          endDate: new Date('2027-03-31'),
          isCurrent: true,
        },
      });
    }

    // 2. Resolve Class
    let targetClass = null;
    if (body.applyingClassId) {
      targetClass = await prisma.class.findUnique({
        where: { id: body.applyingClassId },
      });

      if (!targetClass) {
        const cleanCode = body.applyingClassId.replace(/^c-?/i, '');
        targetClass = await prisma.class.findFirst({
          where: {
            OR: [
              { code: { equals: cleanCode, mode: 'insensitive' } },
              { code: { equals: `C${cleanCode.padStart(2, '0')}`, mode: 'insensitive' } },
              { name: { contains: cleanCode, mode: 'insensitive' } },
            ],
          },
        });
      }
    }

    if (!targetClass) {
      targetClass = await prisma.class.findFirst({
        orderBy: { orderIndex: 'asc' },
      });
    }

    if (!targetClass) {
      targetClass = await prisma.class.create({
        data: {
          name: 'Class 8',
          code: 'C08',
          orderIndex: 8,
          sections: {
            create: [
              { name: 'Section A', capacity: 40 },
              { name: 'Section B', capacity: 40 },
            ],
          },
        },
      });
    }

    const applicationNo = await generateApplicationNumber(2026);
    const fullName = `${body.firstName || ''} ${body.middleName ? body.middleName + ' ' : ''}${body.lastName || ''}`.trim() || body.firstName || 'Student';

    // Parse dob safely
    let parsedDob = new Date('2014-05-10');
    if (body.dob) {
      const d = new Date(body.dob);
      if (!isNaN(d.getTime())) parsedDob = d;
    }

    const application = await prisma.admissionApplication.create({
      data: {
        applicationNo,
        status: 'SUBMITTED',
        sessionId: currentSession.id,
        applyingClassId: targetClass.id,
        preferredSectionId: body.preferredSectionId || null,
        firstName: body.firstName || 'Student',
        middleName: body.middleName || null,
        lastName: body.lastName || '',
        fullName,
        dob: parsedDob,
        gender: body.gender || 'MALE',
        bloodGroup: body.bloodGroup || null,
        nationality: body.nationality || 'Pakistani',
        photoUrl: body.photoUrl || null,
        previousSchool: body.previousSchool || null,
        previousClass: body.previousClass || null,
        previousGrade: body.previousGrade || null,
        fatherName: body.fatherName || 'Parent',
        fatherPhone: body.fatherPhone || '0300-0000000',
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
        emergencyName: body.emergencyName || body.fatherName || 'Parent',
        emergencyRelation: body.emergencyRelation || 'Father',
        emergencyPhone: body.emergencyPhone || body.fatherPhone || '0300-0000000',
        documentsJson: body.documents ? JSON.stringify(body.documents) : null,
      },
    });

    try {
      await logAuditEvent({
        action: 'ADMISSION_SUBMITTED',
        entity: 'AdmissionApplication',
        entityId: application.id,
        details: `New online application submitted: ${application.applicationNo} for ${application.fullName}`,
      });
    } catch (auditErr) {
      console.warn('Audit log error:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Admission application submitted successfully',
      id: application.id,
      applicationId: application.id,
      applicationNo: application.applicationNo,
      application,
    });
  } catch (error: any) {
    console.error('Admission submit error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to submit admission application' 
    }, { status: 500 });
  }
}
