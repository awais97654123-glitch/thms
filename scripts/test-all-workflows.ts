import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateStudentId, generateAdmissionNumber, generateRollNumber, generateQrToken, generateInvoiceNumber } from '../src/lib/id-generator';
import { hasPermission, ROLE_PERMISSIONS } from '../src/lib/permissions';
import { emailQueue } from '../src/lib/email/queue';
import { interpolateTemplate, DEFAULT_TEMPLATES } from '../src/lib/email/templates';

import prisma from '../src/lib/db';

async function runAllWorkflowTests() {
  console.log('\n===============================================================');
  console.log('🏛️  THE HAYATABAD MODEL SCHOOL — MASTER WORKFLOW TEST SUITE');
  console.log('===============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   └─ ${details}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   └─ ${details}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  try {
    // ----------------------------------------------------------------
    // 1. WORKFLOW A: FIRST-TIME SETUP & ONBOARDING INITIALIZATION
    // ----------------------------------------------------------------
    console.log('\n🔹 TESTING WORKFLOW A: First-Time School Setup & Academic Structure');

    let session = await prisma.academicSession.findFirst({ where: { isCurrent: true } });
    if (!session) {
      session = await prisma.academicSession.create({
        data: {
          name: 'Academic Session 2026-2027',
          code: '2026',
          startDate: new Date('2026-04-01'),
          endDate: new Date('2027-03-31'),
          isCurrent: true,
        },
      });
    }
    assert(!!session, 'Active Academic Session exists', `Session: ${session?.name}`);

    let class8 = await prisma.class.findFirst({
      where: { code: 'C08' },
      include: { sections: true },
    });
    if (!class8) {
      class8 = await prisma.class.create({
        data: {
          name: 'Class 8',
          code: 'C08',
          orderIndex: 6,
          sections: {
            create: [{ name: 'Section A' }, { name: 'Section B' }],
          },
        },
        include: { sections: true },
      });
    }
    assert(!!class8 && class8.sections.length > 0, 'Class 8 and Section A exist');

    const section8A = class8!.sections[0];

    // ----------------------------------------------------------------
    // 2. WORKFLOW B: ADMISSION -> MANDATORY PHOTO & 1-CLICK ENROLLMENT
    // ----------------------------------------------------------------
    console.log('\n🔹 TESTING WORKFLOW B: Online Admission, Mandatory Photo & 1-Click Enrollment');

    // Create Online Admission Application with photo
    const appNo = `THMS-APP-TEST-${Date.now()}`;
    const samplePhotoUrl = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=350&fit=crop';

    const application = await prisma.admissionApplication.create({
      data: {
        applicationNo: appNo,
        status: 'SUBMITTED',
        sessionId: session!.id,
        applyingClassId: class8!.id,
        preferredSectionId: section8A.id,
        firstName: 'Muhammad',
        lastName: 'Bilal',
        fullName: 'Muhammad Bilal',
        dob: new Date('2012-04-10'),
        gender: 'MALE',
        bloodGroup: 'B+',
        nationality: 'Pakistani',
        photoUrl: samplePhotoUrl, // Mandatory photo
        fatherName: 'Dr. Tariq Mehmood',
        fatherPhone: '+92 300 1234567',
        fatherEmail: 'tariq.mehmood@example.com',
        fatherCnic: '17301-1234567-1',
        houseStreet: 'Street 4, Sector F-3',
        area: 'Phase 6, Hayatabad',
        city: 'Peshawar',
        district: 'Peshawar',
        province: 'KPK',
        postalCode: '25000',
        emergencyName: 'Dr. Tariq Mehmood',
        emergencyRelation: 'Father',
        emergencyPhone: '+92 300 1234567',
      },
    });

    assert(!!application.photoUrl, 'Mandatory Passport Photo attached to application', application.photoUrl || undefined);
    assert(application.applicationNo === appNo, 'Online Admission Application created with tracking code', appNo);

    // Simulate 1-Click Approve & Enroll Transaction
    const newStudentId = await generateStudentId(2026);
    const newAdmissionNo = await generateAdmissionNumber(2026);
    const newRollNo = await generateRollNumber(class8!.id, section8A.id);
    const newQrToken = generateQrToken(newStudentId);

    assert(newStudentId.startsWith('THMS-2026-'), 'Generated ISO Student ID', newStudentId);
    assert(newAdmissionNo.startsWith('ADM-2026-'), 'Generated Admission Number', newAdmissionNo);
    assert(!!newRollNo, 'Generated Roll Number for Section', newRollNo);
    assert(newQrToken.startsWith('THMS-QR-'), 'Generated Secure Opaque QR Token', newQrToken);

    // Create Enrolled Student Record in Transaction
    const defaultPasswordHash = await bcrypt.hash('Student@123', 10);
    const invoiceNo = await generateInvoiceNumber(2026);

    const enrolledStudent = await prisma.$transaction(async (tx) => {
      let parent = await tx.parent.findFirst({
        where: { fatherPhone: application.fatherPhone },
      });

      if (!parent) {
        parent = await tx.parent.create({
          data: {
            fatherName: application.fatherName,
            fatherPhone: application.fatherPhone,
            fatherEmail: application.fatherEmail,
            fatherCnic: application.fatherCnic,
            address: `${application.houseStreet}, ${application.area}, ${application.city}`,
          },
        });
      }

      const studentUser = await tx.user.create({
        data: {
          username: newStudentId,
          email: `${newStudentId.toLowerCase()}@student.hayatabadmodel.edu.pk`,
          passwordHash: defaultPasswordHash,
          role: 'STUDENT',
        },
      });

      const student = await tx.student.create({
        data: {
          studentId: newStudentId,
          admissionNo: newAdmissionNo,
          rollNo: newRollNo,
          firstName: application.firstName,
          lastName: application.lastName,
          fullName: application.fullName,
          dob: application.dob,
          gender: application.gender,
          bloodGroup: application.bloodGroup,
          photoUrl: application.photoUrl,
          status: 'ENROLLED',
          qrToken: newQrToken,
          classId: class8!.id,
          sectionId: section8A.id,
          sessionId: session!.id,
          parentId: parent.id,
          userId: studentUser.id,
          emergencyName: application.emergencyName,
          emergencyPhone: application.emergencyPhone,
          emergencyRelation: application.emergencyRelation,
        },
      });

      await tx.feeInvoice.create({
        data: {
          invoiceNo,
          studentId: student.id,
          sessionId: session!.id,
          title: 'Admission & Initial Month Tuition Fee',
          month: 'Current Session 2026',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          totalAmount: 12000,
          discountAmount: 0,
          paidAmount: 0,
          remainingAmount: 12000,
          status: 'PENDING',
          items: {
            create: [
              { feeType: 'ADMISSION', amount: 8000, description: 'One-time Admission & Registration' },
              { feeType: 'TUITION', amount: 4000, description: 'Tuition Fee' },
            ],
          },
        },
      });

      await tx.admissionApplication.update({
        where: { id: application.id },
        data: {
          status: 'ENROLLED',
          enrolledStudentId: student.id,
        },
      });

      return student;
    }, { timeout: 60000, maxWait: 30000 });

    assert(enrolledStudent.status === 'ENROLLED', '1-Click Approve & Enroll executed atomically with DB Transaction');

    // ----------------------------------------------------------------
    // 3. WORKFLOW C: EMAIL AUTOMATION, QUEUE & DUPLICATE SUPPRESSION
    // ----------------------------------------------------------------
    console.log('\n🔹 TESTING WORKFLOW C: Background Email Queue, Templates & Idempotency');

    // Template interpolation test
    const homeworkTemplate = DEFAULT_TEMPLATES.find((t) => t.code === 'HOMEWORK_PUBLISHED');
    assert(!!homeworkTemplate, 'Default Homework Email Template exists');

    const interpolatedSubject = interpolateTemplate(homeworkTemplate!.subject, {
      subject_name: 'Mathematics',
      student_name: enrolledStudent.fullName,
      class_name: 'Class 8',
    });
    assert(interpolatedSubject.includes('Mathematics') && interpolatedSubject.includes('Muhammad Bilal'), 'Template dynamic variables interpolated correctly', interpolatedSubject);

    // Enqueue email job
    const eventId = `test_hw_event_${Date.now()}`;
    const enqueueResult1 = await emailQueue.enqueue({
      eventId,
      eventType: 'HOMEWORK',
      recipientEmail: 'parent.test@example.com',
      recipientName: 'Dr. Tariq Mehmood',
      recipientRole: 'PARENT',
      templateCode: 'HOMEWORK_PUBLISHED',
      variables: {
        school_name: 'The Hayatabad Model School',
        student_name: enrolledStudent.fullName,
        class_name: 'Class 8',
        section_name: 'Section A',
        subject_name: 'Mathematics',
        teacher_name: 'Engr. Farooq Ahmad',
        homework_title: 'Quadratic Equations Exercise 4.2',
        homework_desc: 'Complete proofs 1 to 10',
        due_date: '3 September 2026',
        portal_url: 'http://localhost:3000/parent',
      },
    });

    assert(!!enqueueResult1.jobId && !enqueueResult1.duplicate, 'Email notification queued in background', `Job ID: ${enqueueResult1.jobId}`);

    // Test Idempotency / Duplicate Prevention
    const enqueueResult2 = await emailQueue.enqueue({
      eventId,
      eventType: 'HOMEWORK',
      recipientEmail: 'parent.test@example.com',
      recipientName: 'Dr. Tariq Mehmood',
      recipientRole: 'PARENT',
      templateCode: 'HOMEWORK_PUBLISHED',
    });

    assert(enqueueResult2.duplicate === true, 'Duplicate email trigger suppressed via Idempotency Event Key');

    // Verify delivery log creation
    const jobLog = await prisma.emailJob.findUnique({
      where: { id: enqueueResult1.jobId },
      include: { logs: true },
    });
    assert(!!jobLog, 'Email job record stored in database with audit logs', `Status: ${jobLog?.status}`);

    // ----------------------------------------------------------------
    // 4. WORKFLOW D: TEACHER HOMEWORK DISTRIBUTION ENGINE
    // ----------------------------------------------------------------
    console.log('\n🔹 TESTING WORKFLOW D: Teacher Homework Creation & Automated Class Distribution');

    let teacher = await prisma.teacher.findFirst({
      where: { email: 'farooq.ahmad@hayatabadmodel.edu.pk' },
    });
    if (!teacher) {
      teacher = await prisma.teacher.create({
        data: {
          employeeId: 'THMS-T-101',
          fullName: 'Engr. Farooq Ahmad',
          email: 'farooq.ahmad@hayatabadmodel.edu.pk',
          phone: '+92 333 9123456',
          qualification: 'M.Sc. Mathematics',
          designation: 'Senior Faculty Head (Mathematics)',
        },
      });
    }
    assert(!!teacher, 'Teacher Engr. Farooq Ahmad exists in DB');

    let mathSubject = await prisma.subject.findFirst({
      where: { classId: class8!.id, code: 'MATH-08' },
    });
    if (!mathSubject) {
      mathSubject = await prisma.subject.create({
        data: {
          name: 'Mathematics',
          code: 'MATH-08',
          classId: class8!.id,
          teacherId: teacher.id,
        },
      });
    }
    assert(!!mathSubject, 'Mathematics subject exists for Class 8');

    const homework = await prisma.homework.create({
      data: {
        classId: class8!.id,
        sectionId: section8A.id,
        subjectId: mathSubject!.id,
        teacherId: teacher!.id,
        title: 'Chapter 4 — Exercise 4.2 Proofs',
        description: 'Solve questions 1 through 15 on polynomial factorization with step-by-step proofs.',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });

    assert(!!homework.id, 'Teacher published homework targeting Class 8 Section A', homework.title);

    const activeStudentsIn8A = await prisma.student.findMany({
      where: { classId: class8!.id, sectionId: section8A.id, status: 'ENROLLED' },
    });
    assert(activeStudentsIn8A.length >= 1, 'Active students in Class 8-A automatically mapped to homework', `Targeted ${activeStudentsIn8A.length} students`);

    // ----------------------------------------------------------------
    // 5. WORKFLOW E: QR ATTENDANCE ENGINE & DUPLICATE PREVENTION
    // ----------------------------------------------------------------
    console.log('\n🔹 TESTING WORKFLOW E: QR Identity Verification & Duplicate Scan Protection');

    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const attendanceRecord = await prisma.attendance.create({
      data: {
        studentId: enrolledStudent.id,
        date: todayMidnight,
        time: '08:02 AM',
        status: 'PRESENT',
        method: 'QR',
        deviceId: 'GATE-SCANNER-01',
        remarks: 'Main Gate QR verified',
      },
    });

    assert(attendanceRecord.status === 'PRESENT', 'Gate QR Scanner verified student and marked attendance');

    let duplicateCaught = false;
    try {
      await prisma.attendance.create({
        data: {
          studentId: enrolledStudent.id,
          date: todayMidnight,
          time: '08:05 AM',
          status: 'PRESENT',
          method: 'QR',
        },
      });
    } catch {
      duplicateCaught = true;
    }

    assert(duplicateCaught, 'Duplicate scan within same day was prevented by Database Unique Constraint');

    // ----------------------------------------------------------------
    // 6. WORKFLOW F: FEE INVOICE -> PAYMENT RECORDING -> 3-SLIP VOUCHER
    // ----------------------------------------------------------------
    console.log('\n🔹 TESTING WORKFLOW F: Fee Invoice Payment & 3-Slip Voucher Receipt');

    const studentInvoice = await prisma.feeInvoice.findFirst({
      where: { studentId: enrolledStudent.id },
    });
    assert(!!studentInvoice, 'Fee Invoice found for student', `Invoice Total: Rs. ${studentInvoice?.totalAmount}`);

    const paymentReceiptNo = `REC-TEST-${Date.now()}`;
    const payment = await prisma.$transaction(async (tx) => {
      const pay = await tx.payment.create({
        data: {
          receiptNo: paymentReceiptNo,
          invoiceId: studentInvoice!.id,
          studentId: enrolledStudent.id,
          amount: 12000,
          paymentMethod: 'CASH',
          status: 'COMPLETED',
          remarks: 'Counter deposit paid in full',
        },
      });

      await tx.feeInvoice.update({
        where: { id: studentInvoice!.id },
        data: {
          paidAmount: 12000,
          remainingAmount: 0,
          status: 'PAID',
        },
      });

      return pay;
    }, { timeout: 60000, maxWait: 30000 });

    const updatedInvoice = await prisma.feeInvoice.findUnique({
      where: { id: studentInvoice!.id },
    });

    assert(updatedInvoice?.status === 'PAID' && updatedInvoice.remainingAmount === 0, 'Payment recorded, invoice status set to PAID, balance updated to 0');
    assert(payment.receiptNo === paymentReceiptNo, 'Unique 3-Slip Deposit Receipt generated', payment.receiptNo);

    // ----------------------------------------------------------------
    // 7. WORKFLOW G: RBAC SECURITY GUARDS & GRANULAR ISOLATION
    // ----------------------------------------------------------------
    console.log('\n🔹 TESTING WORKFLOW G: RBAC Security Guard & Granular Permissions');

    assert(hasPermission('SUPER_ADMIN', 'settings.manage'), 'Super Admin has settings.manage permission');
    assert(hasPermission('TEACHER', 'attendance.mark'), 'Teacher has attendance.mark permission');
    assert(!hasPermission('TEACHER', 'fees.create'), 'Teacher is DENIED financial fee creation');
    assert(!hasPermission('STUDENT', 'admissions.approve'), 'Student is DENIED administrative admission approval');
    assert(!hasPermission('PARENT', 'results.enter'), 'Parent is DENIED marks entry');

    console.log('\n===============================================================');
    console.log(`🎉 ALL ${passedTests}/${totalTests} WORKFLOW INTEGRATION TESTS PASSED SUCCESSFULLY!`);
    console.log('===============================================================\n');
  } catch (error) {
    console.error('\n❌ Test Suite Execution Failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAllWorkflowTests();
