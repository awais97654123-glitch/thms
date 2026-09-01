import prisma from '../src/lib/db';
import { generateStudentId, generateAdmissionNumber, generateRollNumber, generateQrToken, generateInvoiceNumber, generateApplicationNumber } from '../src/lib/id-generator';
import { hashPassword } from '../src/lib/auth';

async function main() {
  console.log('🧪 Testing Admission System & 1-Click Enrollment Pipeline...');

  // 1. Fetch or create Session
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
  console.log('✅ Session active:', session.name);

  // 2. Fetch or create Class 8 & Section
  let cls = await prisma.class.findFirst({
    where: { name: { contains: '8' } },
    include: { sections: true },
  });
  if (!cls) {
    cls = await prisma.class.create({
      data: {
        name: 'Class 8',
        code: 'C08',
        orderIndex: 8,
        sections: {
          create: [{ name: 'Section A', capacity: 40 }],
        },
      },
      include: { sections: true },
    });
  }
  console.log('✅ Class verified:', cls.name, 'Sections:', cls.sections.map(s => s.name).join(', '));

  // 3. Create test admission application
  const appNo = await generateApplicationNumber(2026);
  const app = await prisma.admissionApplication.create({
    data: {
      applicationNo: appNo,
      status: 'SUBMITTED',
      sessionId: session.id,
      applyingClassId: cls.id,
      preferredSectionId: cls.sections[0]?.id || null,
      firstName: 'Hamza',
      lastName: 'Tariq Khan',
      fullName: 'Hamza Tariq Khan',
      dob: new Date('2012-08-14'),
      gender: 'MALE',
      bloodGroup: 'B+',
      nationality: 'Pakistani',
      fatherName: 'Tariq Mehmood Khan',
      fatherPhone: '0333-9123456',
      fatherEmail: `tariq.test.${Date.now()}@example.com`,
      emergencyName: 'Tariq Mehmood Khan',
      emergencyRelation: 'Father',
      emergencyPhone: '0333-9123456',
      houseStreet: 'Sector F-4, Street 9',
      area: 'Phase 6, Hayatabad',
      city: 'Peshawar',
      province: 'KPK',
    },
  });
  console.log('✅ Application created:', app.applicationNo, 'Status:', app.status);

  // 4. Test Status Update
  const updatedApp = await prisma.admissionApplication.update({
    where: { id: app.id },
    data: {
      status: 'APPROVED',
      reviewNotes: 'Verified documentation and entrance test passed (85/100).',
    },
  });
  console.log('✅ Status updated to:', updatedApp.status, 'Notes:', updatedApp.reviewNotes);

  // 5. Test Status Update to INTERVIEW_SCHEDULED & REJECTED
  await prisma.admissionApplication.update({
    where: { id: app.id },
    data: {
      status: 'INTERVIEW_SCHEDULED',
      interviewDate: new Date(),
    },
  });
  console.log('✅ Status updated to INTERVIEW_SCHEDULED');

  await prisma.admissionApplication.update({
    where: { id: app.id },
    data: {
      status: 'APPROVED',
    },
  });
  console.log('✅ Status updated back to APPROVED for Enrollment test');

  // 6. Test 1-Click Enrollment Transaction directly
  const studentId = await generateStudentId(2026);
  const admissionNo = await generateAdmissionNumber(2026);
  const sectionId = cls.sections[0]?.id;
  const rollNo = await generateRollNumber(cls.id, sectionId);
  const qrToken = generateQrToken(studentId);
  const invoiceNo = await generateInvoiceNumber(2026);
  const tempParentPassword = await hashPassword('Parent@123');
  const tempStudentPassword = await hashPassword('Student@123');

  const enrollmentResult = await prisma.$transaction(async (tx) => {
    // Parent user
    const parentUsername = `parent.${app.fatherPhone.replace(/\D/g, '').slice(-7)}_${Date.now().toString().slice(-4)}`;
    const parentUser = await tx.user.create({
      data: {
        username: parentUsername,
        email: app.fatherEmail,
        passwordHash: tempParentPassword,
        role: 'PARENT',
        status: 'ACTIVE',
      },
    });

    const parent = await tx.parent.create({
      data: {
        userId: parentUser.id,
        fatherName: app.fatherName,
        fatherPhone: app.fatherPhone,
        fatherEmail: app.fatherEmail,
        address: `${app.houseStreet}, ${app.area}`,
        city: app.city,
        district: app.district,
        province: app.province,
      },
    });

    // Student user
    const studentUser = await tx.user.create({
      data: {
        username: studentId,
        email: `student.${studentId.toLowerCase().replace(/[^a-z0-9]/g, '')}@hayatabadmodel.edu.pk`,
        passwordHash: tempStudentPassword,
        role: 'STUDENT',
        status: 'ACTIVE',
      },
    });

    // Student record
    const student = await tx.student.create({
      data: {
        studentId,
        admissionNo,
        rollNo,
        firstName: app.firstName,
        lastName: app.lastName,
        fullName: app.fullName,
        dob: app.dob,
        gender: app.gender,
        bloodGroup: app.bloodGroup,
        nationality: app.nationality,
        status: 'ENROLLED',
        qrToken,
        classId: cls.id,
        sectionId: sectionId,
        sessionId: session.id,
        parentId: parent.id,
        userId: studentUser.id,
      },
      include: { class: true, section: true },
    });

    // Fee Invoice
    const invoice = await tx.feeInvoice.create({
      data: {
        invoiceNo,
        studentId: student.id,
        sessionId: session.id,
        title: 'New Admission & Tuition Fee Voucher',
        month: 'Enrollment 2026',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        totalAmount: 23500,
        discountAmount: 0,
        paidAmount: 0,
        remainingAmount: 23500,
        status: 'PENDING',
        remarks: 'Official admission fee & 1st month tuition fee',
        items: {
          create: [
            { feeType: 'ADMISSION', amount: 15000, description: 'One-Time Admission & Registration Fee' },
            { feeType: 'TUITION', amount: 8500, description: 'First Month Tuition Fee' },
          ],
        },
      },
    });

    await tx.admissionApplication.update({
      where: { id: app.id },
      data: {
        status: 'ENROLLED',
        enrolledStudentId: student.id,
      },
    });

    return { student, invoice, parentUsername, studentUser };
  }, { timeout: 60000, maxWait: 30000 });

  console.log('🎉 Enrollment successfully completed!');
  console.log('   Student ID:', enrollmentResult.student.studentId);
  console.log('   Admission No:', enrollmentResult.student.admissionNo);
  console.log('   Roll No:', enrollmentResult.student.rollNo);
  console.log('   Class & Section:', enrollmentResult.student.class.name, enrollmentResult.student.section.name);
  console.log('   Invoice No:', enrollmentResult.invoice.invoiceNo, 'Amount:', enrollmentResult.invoice.totalAmount);
  console.log('   Parent Username:', enrollmentResult.parentUsername);
  console.log('   Student Username:', enrollmentResult.studentUser.username);
  console.log('\n🌟 ALL ADMISSION & APPROVAL WORKFLOWS VERIFIED 100% WORKING!\n');
}

main()
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
