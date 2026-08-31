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
    if (sectionId) {
      const secExists = await prisma.section.findUnique({ where: { id: sectionId } });
      if (!secExists) sectionId = undefined; // fallback if invalid id or mock string passed
    }

    if (!sectionId) {
      const defaultSec = await prisma.section.findFirst({
        where: { classId: application.applyingClassId },
        orderBy: { name: 'asc' },
      });
      if (defaultSec) {
        sectionId = defaultSec.id;
      } else {
        // Automatically create Section A if class has no section yet
        const newSec = await prisma.section.create({
          data: {
            name: 'Section A',
            classId: application.applyingClassId,
            capacity: 40,
          },
        });
        sectionId = newSec.id;
      }
    }

    // Authorization check
    if (session && session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'ADMISSION_OFFICER') {
      return NextResponse.json({ error: 'Unauthorized. Admin permission required to enroll students.' }, { status: 403 });
    }

    // Pre-generate IDs & hashes outside interactive transaction for instant execution
    const studentId = await generateStudentId(2026);
    const admissionNo = await generateAdmissionNumber(2026);
    const rollNo = body.customRollNo || (await generateRollNumber(application.applyingClassId, sectionId));
    const qrToken = generateQrToken(studentId);
    const invoiceNo = await generateInvoiceNumber(2026);
    const tempParentPassword = await hashPassword('Parent@123');
    const tempStudentPassword = await hashPassword('Student@123');

    // Execute the complete enrollment pipeline atomically
    const enrollmentResult = await prisma.$transaction(async (tx) => {
      // 1. Check or create Parent
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

      // 2. Create Student Portal User Account
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

      // 3. Create Student Record
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

      // 4. Generate Initial Admission Fee Invoice
      const feeStructure = await tx.feeStructure.findFirst({
        where: { classId: application.applyingClassId },
      });

      const admissionFee = feeStructure?.admissionFee || 15000;
      const tuitionFee = feeStructure?.tuitionFee || 8500;
      const totalInitialFee = admissionFee + tuitionFee;

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

      // 5. Update Application status
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
        studentUser,
        parentUser: parent.userId ? { id: parent.userId } : null,
      };
    }, { timeout: 60000, maxWait: 30000 });

    // 6. Create in-app notifications for Student & Parent
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

      if (enrollmentResult.parentUser?.id) {
        await prisma.notification.create({
          data: {
            userId: enrollmentResult.parentUser.id,
            title: 'Admission Approved & Student Enrolled',
            message: `Your child ${enrollmentResult.student.fullName} has been officially enrolled in ${enrollmentResult.student.class.name}. Admission Fee Voucher: ${enrollmentResult.invoice.invoiceNo}`,
            type: 'ADMISSION',
            link: '/parent',
          },
        });
      }
    } catch (notifErr) {
      console.warn('In-app notification creation warning:', notifErr);
    }

    // 7. Dispatch Official Admission Approval & Credentials Email to Parent
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

      // Trigger email non-blockingly
      emailProvider.sendEmail({
        to: parentTargetEmail,
        toName: application.fatherName || 'Parent',
        subject: `Official Admission Confirmation — ${enrollmentResult.student.fullName} (ID: ${enrollmentResult.student.studentId})`,
        html: emailHtml,
      }).catch((e) => console.warn('Enrollment email dispatch warning:', e));
    }

    // 8. Audit Log outside transaction
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
      message: 'Student approved and enrolled successfully with all accounts and email notifications dispatched',
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
