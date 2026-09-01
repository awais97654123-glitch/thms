import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

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

    // 1. Fetch Siblings (family members in school)
    let siblings: any[] = [];
    if (student.parentId || student.parent?.fatherPhone) {
      siblings = await prisma.student.findMany({
        where: {
          id: { not: student.id },
          OR: [
            ...(student.parentId ? [{ parentId: student.parentId }] : []),
            ...(student.parent?.fatherPhone ? [{ parent: { fatherPhone: student.parent.fatherPhone } }] : []),
          ],
        },
        include: {
          class: true,
          section: true,
          session: true,
        },
      });
    }

    // 2. Fetch Class Teacher & Subject Teachers
    const [classTeacher, teacherAssignments] = await Promise.all([
      prisma.teacher.findFirst({
        where: {
          managedSections: {
            some: { id: student.sectionId },
          },
        },
      }),
      prisma.teacherAssignment.findMany({
        where: {
          classId: student.classId,
          sectionId: student.sectionId,
        },
        include: {
          teacher: true,
          subject: true,
        },
      }),
    ]);

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
      siblings,
      classTeacher,
      subjectTeachers: teacherAssignments,
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

    // Find student
    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [{ id }, { studentId: id }],
      },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentUpdateData: any = {};

    if (body.firstName !== undefined) studentUpdateData.firstName = body.firstName;
    if (body.middleName !== undefined) studentUpdateData.middleName = body.middleName || null;
    if (body.lastName !== undefined) studentUpdateData.lastName = body.lastName;
    
    if (body.firstName !== undefined || body.lastName !== undefined) {
      const fName = body.firstName ?? existingStudent.firstName;
      const lName = body.lastName ?? existingStudent.lastName;
      studentUpdateData.fullName = `${fName} ${lName}`.trim();
    }

    if (body.dob) {
      const parsed = new Date(body.dob);
      if (!isNaN(parsed.getTime())) studentUpdateData.dob = parsed;
    }

    if (body.gender !== undefined) studentUpdateData.gender = body.gender;
    if (body.bloodGroup !== undefined) studentUpdateData.bloodGroup = body.bloodGroup || null;
    if (body.nationality !== undefined) studentUpdateData.nationality = body.nationality;
    if (body.photoUrl !== undefined) studentUpdateData.photoUrl = body.photoUrl || null;
    if (body.status !== undefined) studentUpdateData.status = body.status;
    if (body.rollNo !== undefined) studentUpdateData.rollNo = body.rollNo;
    if (body.classId !== undefined) studentUpdateData.classId = body.classId;
    if (body.sectionId !== undefined) studentUpdateData.sectionId = body.sectionId;
    if (body.emergencyName !== undefined) studentUpdateData.emergencyName = body.emergencyName;
    if (body.emergencyRelation !== undefined) studentUpdateData.emergencyRelation = body.emergencyRelation;
    if (body.emergencyPhone !== undefined) studentUpdateData.emergencyPhone = body.emergencyPhone;
    if (body.previousSchool !== undefined) studentUpdateData.previousSchool = body.previousSchool || null;
    if (body.previousClass !== undefined) studentUpdateData.previousClass = body.previousClass || null;
    if (body.previousGrade !== undefined) studentUpdateData.previousGrade = body.previousGrade || null;

    const updated = await prisma.student.update({
      where: { id: existingStudent.id },
      data: studentUpdateData,
      include: {
        class: true,
        section: true,
        parent: true,
      },
    });

    // Update parent record if parent fields are provided
    if (existingStudent.parentId && (
      body.fatherName !== undefined ||
      body.fatherPhone !== undefined ||
      body.fatherEmail !== undefined ||
      body.fatherOccupation !== undefined ||
      body.fatherCnic !== undefined ||
      body.motherName !== undefined ||
      body.motherPhone !== undefined ||
      body.guardianName !== undefined ||
      body.guardianPhone !== undefined ||
      body.address !== undefined ||
      body.city !== undefined ||
      body.district !== undefined ||
      body.province !== undefined
    )) {
      const parentUpdateData: any = {};
      if (body.fatherName !== undefined) parentUpdateData.fatherName = body.fatherName;
      if (body.fatherPhone !== undefined) parentUpdateData.fatherPhone = body.fatherPhone;
      if (body.fatherEmail !== undefined) parentUpdateData.fatherEmail = body.fatherEmail || null;
      if (body.fatherOccupation !== undefined) parentUpdateData.fatherOccupation = body.fatherOccupation || null;
      if (body.fatherCnic !== undefined) parentUpdateData.fatherCnic = body.fatherCnic || null;
      if (body.motherName !== undefined) parentUpdateData.motherName = body.motherName || null;
      if (body.motherPhone !== undefined) parentUpdateData.motherPhone = body.motherPhone || null;
      if (body.guardianName !== undefined) parentUpdateData.guardianName = body.guardianName || null;
      if (body.guardianPhone !== undefined) parentUpdateData.guardianPhone = body.guardianPhone || null;
      if (body.address !== undefined) parentUpdateData.address = body.address;
      if (body.city !== undefined) parentUpdateData.city = body.city;
      if (body.district !== undefined) parentUpdateData.district = body.district;
      if (body.province !== undefined) parentUpdateData.province = body.province;

      await prisma.parent.update({
        where: { id: existingStudent.parentId },
        data: parentUpdateData,
      });
    }

    try {
      await logAuditEvent({
        userId: session?.userId,
        userName: session?.fullName || 'Admin',
        role: session?.role || 'ADMIN',
        action: 'STUDENT_UPDATED',
        entity: 'Student',
        entityId: existingStudent.id,
        details: `Updated student record for ${updated.fullName} (${updated.studentId})`,
      });
    } catch (auditErr) {
      console.warn('Audit log error:', auditErr);
    }

    return NextResponse.json({ success: true, student: updated, message: 'Student and family records updated successfully' });
  } catch (error: any) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update student' }, { status: 500 });
  }
}
