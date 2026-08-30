import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateStudentId, generateAdmissionNumber, generateRollNumber, generateQrToken, generateInvoiceNumber } from '@/lib/id-generator';
import { hashPassword, getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getCurrentUser();
    const body = await req.json().catch(() => ({}));

    const application = await prisma.admissionApplication.findUnique({
      where: { id },
      include: { session: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Admission application not found' }, { status: 404 });
    }

    if (application.status === 'ENROLLED' && application.enrolledStudentId) {
      return NextResponse.json({ error: 'Student is already enrolled for this application' }, { status: 400 });
    }

    // Determine target Section (use provided section or first section of class)
    let sectionId = body.sectionId || application.preferredSectionId;
    if (!sectionId) {
      const defaultSec = await prisma.section.findFirst({
        where: { classId: application.applyingClassId },
        orderBy: { name: 'asc' },
      });
      if (defaultSec) sectionId = defaultSec.id;
    }

    if (!sectionId) {
      return NextResponse.json({ error: 'No sections configured for this class' }, { status: 400 });
    }

    // Authorization check
    if (session && session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'ADMISSION_OFFICER') {
      return NextResponse.json({ error: 'Unauthorized. Admin permission required to enroll students.' }, { status: 403 });
    }

    // Execute the complete enrollment pipeline atomically
    const enrollmentResult = await prisma.$transaction(async (tx) => {
      // 1. Generate IDs & Roll No
      const studentId = await generateStudentId(2026);
      const admissionNo = await generateAdmissionNumber(2026);
      const rollNo = body.customRollNo || (await generateRollNumber(application.applyingClassId, sectionId));
      const qrToken = generateQrToken(studentId);

      // 2. Check or create Parent
      let parent = await tx.parent.findFirst({
        where: {
          OR: [
            { fatherPhone: application.fatherPhone },
            ...(application.fatherCnic ? [{ fatherCnic: application.fatherCnic }] : []),
          ],
        },
      });

      let parentUsername = '';

      if (!parent) {
        // Create user account for Parent
        const tempParentPassword = await hashPassword('Parent@123');
        parentUsername = `parent.${application.fatherPhone.replace(/\D/g, '').slice(-7)}`;
        
        // Ensure username is unique
        const existingParentUser = await tx.user.findUnique({ where: { username: parentUsername } });
        if (existingParentUser) {
          parentUsername = `parent.${application.fatherPhone.replace(/\D/g, '').slice(-7)}_${Date.now().toString().slice(-4)}`;
        }

        const parentUser = await tx.user.create({
          data: {
            username: parentUsername,
            email: application.fatherEmail || null,
            passwordHash: tempParentPassword,
            role: 'PARENT',
            status: 'ACTIVE',
            isFirstLogin: true,
          },
        });

        parent = await tx.parent.create({
          data: {
            userId: parentUser.id,
            fatherName: application.fatherName,
            fatherPhone: application.fatherPhone,
            fatherEmail: application.fatherEmail || null,
            fatherOccupation: application.fatherOccupation || null,
            fatherCnic: application.fatherCnic || null,
            motherName: application.motherName || null,
            motherPhone: application.motherPhone || null,
            motherOccupation: application.motherOccupation || null,
            guardianName: application.guardianName || null,
            guardianRelation: application.guardianRelation || null,
            guardianPhone: application.guardianPhone || null,
            guardianEmail: application.guardianEmail || null,
            address: `${application.houseStreet}, ${application.area}`,
            city: application.city,
            district: application.district,
            province: application.province,
            postalCode: application.postalCode,
            emergencyContact: application.emergencyPhone,
          },
        });
      } else if (parent.userId) {
        const pUser = await tx.user.findUnique({ where: { id: parent.userId } });
        parentUsername = pUser?.username || parent.fatherPhone;
      }

      // 3. Create Student Portal User Account
      const tempStudentPassword = await hashPassword('Student@123');
      const studentUser = await tx.user.create({
        data: {
          username: studentId,
          email: application.fatherEmail ? `student.${studentId.toLowerCase()}@hayatabadmodel.edu.pk` : null,
          passwordHash: tempStudentPassword,
          role: 'STUDENT',
          status: 'ACTIVE',
          isFirstLogin: true,
        },
      });

      // 4. Create Student Record
      const student = await tx.student.create({
        data: {
          studentId,
          admissionNo,
          rollNo,
          firstName: application.firstName,
          middleName: application.middleName,
          lastName: application.lastName,
          fullName: application.fullName,
          dob: application.dob,
          gender: application.gender,
          bloodGroup: application.bloodGroup,
          nationality: application.nationality,
          photoUrl: application.photoUrl,
          status: 'ENROLLED',
          qrToken,
          classId: application.applyingClassId,
          sectionId,
          sessionId: application.sessionId,
          parentId: parent.id,
          userId: studentUser.id,
          emergencyName: application.emergencyName,
          emergencyRelation: application.emergencyRelation,
          emergencyPhone: application.emergencyPhone,
          previousSchool: application.previousSchool,
          previousClass: application.previousClass,
          previousGrade: application.previousGrade,
        },
        include: {
          class: true,
          section: true,
        },
      });

      // 5. Generate Initial Admission Fee Invoice
      const feeStructure = await tx.feeStructure.findFirst({
        where: { classId: application.applyingClassId },
      });

      const admissionFee = feeStructure?.admissionFee || 15000;
      const tuitionFee = feeStructure?.tuitionFee || 8500;
      const totalInitialFee = admissionFee + tuitionFee;
      const invoiceNo = await generateInvoiceNumber(2026);

      const invoice = await tx.feeInvoice.create({
        data: {
          invoiceNo,
          studentId: student.id,
          sessionId: application.sessionId,
          title: 'New Admission & Tuition Fee Voucher',
          month: 'Enrollment 2026',
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          totalAmount: totalInitialFee,
          discountAmount: 0,
          paidAmount: 0,
          remainingAmount: totalInitialFee,
          status: 'PENDING',
          remarks: 'Admission fee & 1st month tuition fee',
          items: {
            create: [
              { feeType: 'ADMISSION', amount: admissionFee, description: 'One-Time Admission & Registration Fee' },
              { feeType: 'TUITION', amount: tuitionFee, description: 'First Month Tuition Fee' },
            ],
          },
        },
      });

      // 6. Update Application status
      await tx.admissionApplication.update({
        where: { id: application.id },
        data: {
          status: 'ENROLLED',
          enrolledStudentId: student.id,
        },
      });

      return {
        student,
        invoice,
        parentUsername,
      };
    }, { timeout: 20000 });

    // 7. Audit Log outside transaction
    await logAuditEvent({
      userId: session?.userId,
      userName: session?.fullName || 'Admin',
      role: session?.role || 'ADMIN',
      action: 'STUDENT_ENROLLED',
      entity: 'Student',
      entityId: enrollmentResult.student.id,
      details: {
        applicationNo: application.applicationNo,
        studentId: enrollmentResult.student.studentId,
        admissionNo: enrollmentResult.student.admissionNo,
        rollNo: enrollmentResult.student.rollNo,
        class: enrollmentResult.student.class.name,
        section: enrollmentResult.student.section.name,
        invoiceNo: enrollmentResult.invoice.invoiceNo,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Student approved and enrolled successfully with all accounts created',
      enrollment: {
        studentId: enrollmentResult.student.studentId,
        admissionNo: enrollmentResult.student.admissionNo,
        rollNo: enrollmentResult.student.rollNo,
        fullName: enrollmentResult.student.fullName,
        className: enrollmentResult.student.class.name,
        sectionName: enrollmentResult.student.section.name,
        studentUsername: enrollmentResult.student.studentId,
        studentPassword: 'Student@123',
        parentUsername: enrollmentResult.parentUsername,
        parentPassword: 'Parent@123',
        loginUrl: '/login',
        qrToken: enrollmentResult.student.qrToken,
        invoiceNo: enrollmentResult.invoice.invoiceNo,
        initialAmount: enrollmentResult.invoice.totalAmount,
      },
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ error: 'Failed to approve & enroll student' }, { status: 500 });
  }
}
