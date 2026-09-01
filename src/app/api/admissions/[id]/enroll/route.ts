import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateStudentId, generateAdmissionNumber, generateRollNumber, generateQrToken, generateInvoiceNumber } from '@/lib/id-generator';
import { hashPassword, getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { emailProvider } from '@/lib/email/provider';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getCurrentUser();
    const body = await req.json().catch(() => ({}));

    // Find the admission application
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

    // Authorization check
    if (session && session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'ADMISSION_OFFICER') {
      return NextResponse.json({ error: 'Unauthorized. Admin permission required to enroll students.' }, { status: 403 });
    }

    // 1. Resolve Target Class (Robust lookup handling mock/code/name IDs)
    let targetClass = null;
    if (application.applyingClassId) {
      targetClass = await prisma.class.findUnique({
        where: { id: application.applyingClassId },
        include: { sections: true },
      });
    }

    if (!targetClass) {
      const cleanCode = application.applyingClassId?.replace(/^c-?/i, '') || '';
      targetClass = await prisma.class.findFirst({
        where: {
          OR: [
            { code: { equals: cleanCode, mode: 'insensitive' } },
            { code: { equals: `C${cleanCode.padStart(2, '0')}`, mode: 'insensitive' } },
            { name: { contains: cleanCode, mode: 'insensitive' } },
          ],
        },
        include: { sections: true },
      });
    }

    if (!targetClass) {
      targetClass = await prisma.class.findFirst({
        orderBy: { orderIndex: 'asc' },
        include: { sections: true },
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
        include: { sections: true },
      });
    }

    // 2. Resolve Target Academic Session
    let targetSession = null;
    if (application.sessionId) {
      targetSession = await prisma.academicSession.findUnique({
        where: { id: application.sessionId },
      });
    }

    if (!targetSession) {
      targetSession = await prisma.academicSession.findFirst({
        where: { isCurrent: true },
      });
    }

    if (!targetSession) {
      targetSession = await prisma.academicSession.findFirst({
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!targetSession) {
      targetSession = await prisma.academicSession.create({
        data: {
          name: 'Academic Session 2026-2027',
          code: '2026',
          startDate: new Date('2026-04-01'),
          endDate: new Date('2027-03-31'),
          isCurrent: true,
        },
      });
    }

    // 3. Resolve Target Section
    let targetSectionId = body.sectionId || application.preferredSectionId;
    let targetSection = null;

    if (targetSectionId) {
      targetSection = await prisma.section.findFirst({
        where: { id: targetSectionId, classId: targetClass.id },
      });
    }

    if (!targetSection) {
      targetSection = await prisma.section.findFirst({
        where: { classId: targetClass.id },
        orderBy: { name: 'asc' },
      });
    }

    if (!targetSection) {
      targetSection = await prisma.section.create({
        data: {
          name: 'Section A',
          classId: targetClass.id,
          capacity: 40,
        },
      });
    }

    targetSectionId = targetSection.id;

    // 4. Pre-generate IDs & hashes
    const studentId = await generateStudentId(2026);
    const admissionNo = await generateAdmissionNumber(2026);
    const rollNo = body.customRollNo?.trim() || (await generateRollNumber(targetClass.id, targetSectionId));
    const qrToken = generateQrToken(studentId);
    const invoiceNo = await generateInvoiceNumber(2026);
    const tempParentPassword = await hashPassword('Parent@123');
    const tempStudentPassword = await hashPassword('Student@123');

    // 5. Execute Atomic Enrollment Transaction
    const enrollmentResult = await prisma.$transaction(async (tx) => {
      // Find or create Parent
      const phoneClean = application.fatherPhone ? application.fatherPhone.replace(/\D/g, '') : '';
      let parent = await tx.parent.findFirst({
        where: {
          OR: [
            ...(application.fatherPhone ? [{ fatherPhone: application.fatherPhone }] : []),
            ...(application.fatherCnic ? [{ fatherCnic: application.fatherCnic }] : []),
          ],
        },
      });

      let parentUsername = '';

      if (!parent) {
        const phoneSuffix = phoneClean.slice(-7) || Math.floor(1000000 + Math.random() * 9000000).toString();
        parentUsername = `parent.${phoneSuffix}`;

        const existingParentUser = await tx.user.findUnique({ where: { username: parentUsername } });
        if (existingParentUser) {
          parentUsername = `parent.${phoneSuffix}_${Date.now().toString().slice(-4)}`;
        }

        // Safe email check to avoid unique constraint crash
        let safeParentEmail: string | null = application.fatherEmail || null;
        if (safeParentEmail) {
          const emailOccupied = await tx.user.findUnique({ where: { email: safeParentEmail } });
          if (emailOccupied) {
            safeParentEmail = null;
          }
        }

        const parentUser = await tx.user.create({
          data: {
            username: parentUsername,
            email: safeParentEmail,
            passwordHash: tempParentPassword,
            role: 'PARENT',
            status: 'ACTIVE',
            isFirstLogin: true,
          },
        });

        parent = await tx.parent.create({
          data: {
            userId: parentUser.id,
            fatherName: application.fatherName || 'Parent',
            fatherPhone: application.fatherPhone || '0300-0000000',
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
            address: `${application.houseStreet || 'Sector F-4'}, ${application.area || 'Hayatabad'}`,
            city: application.city || 'Peshawar',
            district: application.district || 'Peshawar',
            province: application.province || 'KPK',
            postalCode: application.postalCode || '25000',
            emergencyContact: application.emergencyPhone || application.fatherPhone,
          },
        });
      } else {
        if (parent.userId) {
          const pUser = await tx.user.findUnique({ where: { id: parent.userId } });
          parentUsername = pUser?.username || parent.fatherPhone;
        } else {
          const phoneSuffix = phoneClean.slice(-7) || Math.floor(1000000 + Math.random() * 9000000).toString();
          parentUsername = `parent.${phoneSuffix}_${Date.now().toString().slice(-4)}`;
          const pUser = await tx.user.create({
            data: {
              username: parentUsername,
              email: null,
              passwordHash: tempParentPassword,
              role: 'PARENT',
              status: 'ACTIVE',
              isFirstLogin: true,
            },
          });
          await tx.parent.update({
            where: { id: parent.id },
            data: { userId: pUser.id },
          });
        }
      }

      // Create Student Portal User Account
      let studentUsername = studentId;
      const existingStudentUser = await tx.user.findUnique({ where: { username: studentUsername } });
      if (existingStudentUser) {
        studentUsername = `${studentId}_${Date.now().toString().slice(-4)}`;
      }

      const studentPortalEmail = `student.${studentId.toLowerCase().replace(/[^a-z0-9]/g, '')}@hayatabadmodel.edu.pk`;
      const emailOccupied = await tx.user.findUnique({ where: { email: studentPortalEmail } });

      const studentUser = await tx.user.create({
        data: {
          username: studentUsername,
          email: emailOccupied ? null : studentPortalEmail,
          passwordHash: tempStudentPassword,
          role: 'STUDENT',
          status: 'ACTIVE',
          isFirstLogin: true,
        },
      });

      // Create Student Record
      const student = await tx.student.create({
        data: {
          studentId,
          admissionNo,
          rollNo,
          firstName: application.firstName || 'Student',
          middleName: application.middleName || null,
          lastName: application.lastName || '',
          fullName: application.fullName || `${application.firstName} ${application.lastName}`.trim(),
          dob: application.dob ? new Date(application.dob) : new Date('2014-01-01'),
          gender: application.gender || 'MALE',
          bloodGroup: application.bloodGroup || null,
          nationality: application.nationality || 'Pakistani',
          photoUrl: application.photoUrl || null,
          status: 'ENROLLED',
          qrToken,
          classId: targetClass.id,
          sectionId: targetSectionId,
          sessionId: targetSession.id,
          parentId: parent.id,
          userId: studentUser.id,
          emergencyName: application.emergencyName || application.fatherName,
          emergencyRelation: application.emergencyRelation || 'Father',
          emergencyPhone: application.emergencyPhone || application.fatherPhone,
          previousSchool: application.previousSchool || null,
          previousClass: application.previousClass || null,
          previousGrade: application.previousGrade || null,
        },
        include: {
          class: true,
          section: true,
        },
      });

      // Generate Initial Admission Fee Invoice
      const feeStructure = await tx.feeStructure.findFirst({
        where: { classId: targetClass.id },
      });

      const admissionFee = feeStructure?.admissionFee || 15000;
      const tuitionFee = feeStructure?.tuitionFee || 8500;
      const totalInitialFee = admissionFee + tuitionFee;

      const invoice = await tx.feeInvoice.create({
        data: {
          invoiceNo,
          studentId: student.id,
          sessionId: targetSession.id,
          title: 'New Admission & Tuition Fee Voucher',
          month: 'Enrollment 2026',
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          totalAmount: totalInitialFee,
          discountAmount: 0,
          paidAmount: 0,
          remainingAmount: totalInitialFee,
          status: 'PENDING',
          remarks: 'Official admission fee & 1st month tuition fee',
          items: {
            create: [
              { feeType: 'ADMISSION', amount: admissionFee, description: 'One-Time Admission & Registration Fee' },
              { feeType: 'TUITION', amount: tuitionFee, description: 'First Month Tuition Fee' },
            ],
          },
        },
      });

      // Update Application status
      await tx.admissionApplication.update({
        where: { id: application.id },
        data: {
          status: 'ENROLLED',
          enrolledStudentId: student.id,
          applyingClassId: targetClass.id,
          preferredSectionId: targetSectionId,
          sessionId: targetSession.id,
        },
      });

      return {
        student,
        invoice,
        parentUsername,
        studentUser,
        parentUserId: parent.userId,
      };
    }, { timeout: 60000, maxWait: 30000 });

    // Background In-App Notifications
    try {
      if (enrollmentResult.studentUser?.id) {
        await prisma.notification.create({
          data: {
            userId: enrollmentResult.studentUser.id,
            title: 'Welcome to The Hayatabad Model School!',
            message: `Congratulations ${enrollmentResult.student.fullName}! Your admission has been approved for ${enrollmentResult.student.class.name} (${enrollmentResult.student.section.name}). Student ID: ${enrollmentResult.student.studentId}`,
            type: 'ADMISSION',
            link: '/student',
          },
        });
      }

      if (enrollmentResult.parentUserId) {
        await prisma.notification.create({
          data: {
            userId: enrollmentResult.parentUserId,
            title: 'Admission Approved & Student Enrolled',
            message: `Your child ${enrollmentResult.student.fullName} has been officially enrolled in ${enrollmentResult.student.class.name}. Admission Fee Voucher: ${enrollmentResult.invoice.invoiceNo}`,
            type: 'ADMISSION',
            link: '/parent',
          },
        });
      }
    } catch (notifErr) {
      console.warn('In-app notification creation non-blocking warning:', notifErr);
    }

    // Background Email Dispatch
    const parentTargetEmail = application.fatherEmail || application.guardianEmail;
    if (parentTargetEmail) {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background: #0a192f; padding: 28px 24px; text-align: center; border-bottom: 3px solid #2563eb;">
            <h1 style="color: #ffffff; font-size: 20px; margin: 0; font-family: Georgia, serif; letter-spacing: 0.5px;">THE HAYATABAD MODEL SCHOOL</h1>
            <p style="color: #60a5fa; font-size: 11px; margin: 6px 0 0 0; text-transform: uppercase; font-weight: bold; letter-spacing: 1.5px;">Official Admission & Enrollment Confirmation</p>
          </div>
          
          <div style="padding: 28px 24px; color: #1e293b;">
            <p style="font-size: 15px; margin-top: 0;">Dear <strong>${application.fatherName || 'Parent / Guardian'}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              We are pleased to inform you that the admission application for <strong>${enrollmentResult.student.fullName}</strong> has been <strong>OFFICIALLY APPROVED</strong> and enrolled for Academic Session 2026–2027.
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
              <h3 style="color: #0f172a; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                Student Academic Credentials
              </h3>
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b; width: 45%;">Student ID / Username:</td>
                  <td style="padding: 4px 0; font-weight: bold; color: #2563eb; font-family: monospace; font-size: 14px;">${enrollmentResult.student.studentId}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Class & Section:</td>
                  <td style="padding: 4px 0; font-weight: bold; color: #0f172a;">${enrollmentResult.student.class.name} (${enrollmentResult.student.section.name})</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Roll Number:</td>
                  <td style="padding: 4px 0; font-weight: bold; color: #0f172a;">${enrollmentResult.student.rollNo}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Parent Portal Username:</td>
                  <td style="padding: 4px 0; font-weight: bold; color: #0f172a; font-family: monospace;">${enrollmentResult.parentUsername}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Default Temporary Password:</td>
                  <td style="padding: 4px 0; font-weight: bold; color: #0f172a; font-family: monospace;">Parent@123</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Fee Voucher Number:</td>
                  <td style="padding: 4px 0; font-weight: bold; color: #0f172a;">${enrollmentResult.invoice.invoiceNo}</td>
                </tr>
              </table>
            </div>

            {/* DIGITAL STUDENT SMART ID CARD (EMAIL ATTACHED EMBED) */}
            <div style="background: linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%); border-radius: 16px; padding: 20px; color: #ffffff; margin: 24px 0; border: 2px solid #3b82f6; box-shadow: 0 10px 25px rgba(10,25,47,0.35);">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 12px; margin-bottom: 14px;">
                <div>
                  <h4 style="margin: 0; font-size: 13px; font-family: Georgia, serif; letter-spacing: 0.5px; color: #ffffff;">THE HAYATABAD MODEL SCHOOL</h4>
                  <span style="font-size: 9px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Official Student Smart Identity Card</span>
                </div>
                <div style="background: rgba(255,255,255,0.15); padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; color: #60a5fa;">
                  2026–2027
                </div>
              </div>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 90px; vertical-align: top; padding-right: 14px;">
                    <div style="width: 80px; height: 95px; background: #ffffff; border-radius: 10px; border: 2px solid #60a5fa; overflow: hidden; text-align: center;">
                      ${enrollmentResult.student.photoUrl ? `
                        <img src="${enrollmentResult.student.photoUrl}" alt="${enrollmentResult.student.fullName}" style="width: 100%; height: 100%; object-fit: cover;" />
                      ` : `
                        <div style="padding-top: 24px; color: #1e3a8a; font-size: 24px; font-weight: bold;">
                          ${enrollmentResult.student.fullName.charAt(0)}
                        </div>
                      `}
                    </div>
                  </td>
                  <td style="vertical-align: top; font-size: 12px;">
                    <h2 style="margin: 0 0 4px 0; font-size: 16px; color: #ffffff; font-weight: 800;">${enrollmentResult.student.fullName}</h2>
                    <p style="margin: 2px 0; color: #93c5fd; font-size: 11px;">Class: <strong style="color: #ffffff;">${enrollmentResult.student.class.name} (${enrollmentResult.student.section.name})</strong></p>
                    <p style="margin: 2px 0; color: #93c5fd; font-size: 11px;">Roll No: <strong style="color: #ffffff;">${enrollmentResult.student.rollNo}</strong></p>
                    <p style="margin: 2px 0; color: #93c5fd; font-size: 11px;">Student ID: <strong style="color: #fde047; font-family: monospace;">${enrollmentResult.student.studentId}</strong></p>
                    <p style="margin: 2px 0; color: #93c5fd; font-size: 11px;">Emergency: <strong style="color: #ffffff;">${application.emergencyPhone || application.fatherPhone}</strong></p>
                  </td>
                  <td style="width: 80px; vertical-align: middle; text-align: right;">
                    <div style="background: #ffffff; padding: 6px; border-radius: 8px; display: inline-block;">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(enrollmentResult.student.qrToken)}" alt="QR Code" style="width: 68px; height: 68px; display: block;" />
                    </div>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 12px; pt: 8px; border-top: 1px dashed rgba(255,255,255,0.2); font-size: 9px; color: #bfdbfe; display: flex; justify-content: space-between;">
                <span>Gate Pass & Library Access Verified</span>
                <span>Principal Office: Prof. M. Tariq Khan</span>
              </div>
            </div>

            <div style="text-align: center; margin: 26px 0 10px 0;">
              <a href="http://localhost:3000/login" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 13px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                Access Portal Login ➔
              </a>
            </div>
          </div>

          <div style="background: #f1f5f9; padding: 14px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
            The Hayatabad Model School • Phase 3, Hayatabad, Peshawar, Pakistan • Tel: +92 91 5828850
          </div>
        </div>
      `;

      emailProvider.sendEmail({
        to: parentTargetEmail,
        toName: application.fatherName || 'Parent',
        subject: `Official Admission Confirmation & Digital ID Card — ${enrollmentResult.student.fullName} (ID: ${enrollmentResult.student.studentId})`,
        html: emailHtml,
      }).catch((e) => console.warn('Enrollment email dispatch warning:', e));
    }

    // Audit Logging
    try {
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
    } catch (auditErr) {
      console.warn('Audit logging non-blocking error:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Student approved and enrolled successfully with all credentials generated',
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
  } catch (error: any) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to approve & enroll student' 
    }, { status: 500 });
  }
}
