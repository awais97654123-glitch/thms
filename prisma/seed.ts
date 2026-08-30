import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding The Hayatabad Model School database...');

  // 1. School Settings
  await prisma.schoolSetting.deleteMany({});
  const setting = await prisma.schoolSetting.create({
    data: {
      schoolName: 'The Hayatabad Model School',
      schoolCode: 'THMS',
      tagline: 'Excellence in Education, Character & Innovation',
      logoUrl: '/images/school-logo.svg',
      address: 'Sector F-4, Phase 6, Hayatabad, Peshawar, KPK, Pakistan',
      city: 'Peshawar',
      province: 'Khyber Pakhtunkhwa',
      postalCode: '25000',
      phone: '+92 91 5828100',
      email: 'info@hayatabadmodel.edu.pk',
      website: 'https://hayatabadmodel.edu.pk',
      principalName: 'Prof. Muhammad Tariq Khan',
      currency: 'PKR',
      currencySymbol: 'Rs.',
      idPrefix: 'THMS',
      admissionPrefix: 'ADM',
      primaryColor: '#1e3a8a',
      secondaryColor: '#059669',
    },
  });

  // 2. Academic Session
  await prisma.academicSession.deleteMany({});
  const session2026 = await prisma.academicSession.create({
    data: {
      name: 'Academic Session 2026-2027',
      code: '2026',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2027-02-28'),
      isCurrent: true,
    },
  });

  await prisma.schoolSetting.update({
    where: { id: setting.id },
    data: { currentSessionId: session2026.id },
  });

  // 3. Grade Rules
  await prisma.gradeRule.deleteMany({});
  const gradeRules = [
    { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0, remarks: 'Outstanding / Exceptional', orderIndex: 1 },
    { grade: 'A', minPercentage: 80, maxPercentage: 89.99, gpa: 3.7, remarks: 'Excellent', orderIndex: 2 },
    { grade: 'B+', minPercentage: 70, maxPercentage: 79.99, gpa: 3.3, remarks: 'Very Good', orderIndex: 3 },
    { grade: 'B', minPercentage: 60, maxPercentage: 69.99, gpa: 3.0, remarks: 'Good', orderIndex: 4 },
    { grade: 'C', minPercentage: 50, maxPercentage: 59.99, gpa: 2.0, remarks: 'Satisfactory / Average', orderIndex: 5 },
    { grade: 'D', minPercentage: 33, maxPercentage: 49.99, gpa: 1.0, remarks: 'Pass / Below Average', orderIndex: 6 },
    { grade: 'F', minPercentage: 0, maxPercentage: 32.99, gpa: 0.0, remarks: 'Fail', orderIndex: 7 },
  ];
  for (const rule of gradeRules) {
    await prisma.gradeRule.create({ data: rule });
  }

  // 4. Default Password Hashes
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const teacherPasswordHash = await bcrypt.hash('Teacher@123', 10);
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);
  const parentPasswordHash = await bcrypt.hash('Parent@123', 10);

  // 5. Users
  await prisma.user.deleteMany({});
  
  // Super Admin
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@hayatabadmodel.edu.pk',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isFirstLogin: false,
    },
  });

  // Admission Officer
  const admissionUser = await prisma.user.create({
    data: {
      username: 'admissions',
      email: 'admissions@hayatabadmodel.edu.pk',
      passwordHash: adminPasswordHash,
      role: 'ADMISSION_OFFICER',
      status: 'ACTIVE',
      isFirstLogin: false,
    },
  });

  // Accountant
  const accountantUser = await prisma.user.create({
    data: {
      username: 'accounts',
      email: 'accounts@hayatabadmodel.edu.pk',
      passwordHash: adminPasswordHash,
      role: 'ACCOUNTANT',
      status: 'ACTIVE',
      isFirstLogin: false,
    },
  });

  // Librarian
  const librarianUser = await prisma.user.create({
    data: {
      username: 'library',
      email: 'librarian@hayatabadmodel.edu.pk',
      passwordHash: adminPasswordHash,
      role: 'LIBRARIAN',
      status: 'ACTIVE',
      isFirstLogin: false,
    },
  });

  // Teachers
  const teacherUser1 = await prisma.user.create({
    data: {
      username: 'teacher.farooq',
      email: 'farooq.ahmad@hayatabadmodel.edu.pk',
      passwordHash: teacherPasswordHash,
      role: 'TEACHER',
      status: 'ACTIVE',
      isFirstLogin: false,
    },
  });

  const teacher1 = await prisma.teacher.create({
    data: {
      userId: teacherUser1.id,
      employeeId: 'THMS-T-101',
      fullName: 'Engr. Farooq Ahmad',
      email: 'farooq.ahmad@hayatabadmodel.edu.pk',
      phone: '+92 333 9123456',
      qualification: 'M.Sc. Mathematics & Applied Physics (UOP)',
      designation: 'Senior Faculty Head (Mathematics)',
      address: 'Phase 2, Hayatabad, Peshawar',
      status: 'ACTIVE',
    },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      username: 'teacher.ayesha',
      email: 'ayesha.siddiqui@hayatabadmodel.edu.pk',
      passwordHash: teacherPasswordHash,
      role: 'TEACHER',
      status: 'ACTIVE',
      isFirstLogin: false,
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      userId: teacherUser2.id,
      employeeId: 'THMS-T-102',
      fullName: 'Ms. Ayesha Siddiqui',
      email: 'ayesha.siddiqui@hayatabadmodel.edu.pk',
      phone: '+92 345 9876543',
      qualification: 'M.Phil English Literature',
      designation: 'Senior English Faculty',
      address: 'Phase 4, Hayatabad, Peshawar',
      status: 'ACTIVE',
    },
  });

  const teacherUser3 = await prisma.user.create({
    data: {
      username: 'teacher.bilal',
      email: 'bilal.khan@hayatabadmodel.edu.pk',
      passwordHash: teacherPasswordHash,
      role: 'TEACHER',
      status: 'ACTIVE',
      isFirstLogin: false,
    },
  });

  const teacher3 = await prisma.teacher.create({
    data: {
      userId: teacherUser3.id,
      employeeId: 'THMS-T-103',
      fullName: 'Mr. Bilal Khan',
      email: 'bilal.khan@hayatabadmodel.edu.pk',
      phone: '+92 300 5544332',
      qualification: 'M.Sc. Chemistry & Computer Science',
      designation: 'Head of Science Department',
      address: 'Phase 5, Hayatabad, Peshawar',
      status: 'ACTIVE',
    },
  });

  // 6. Classes & Sections
  await prisma.class.deleteMany({});
  
  const classData = [
    { name: 'Nursery', code: 'C00', order: 0 },
    { name: 'Prep', code: 'CPR', order: 1 },
    { name: 'Class 1', code: 'C01', order: 2 },
    { name: 'Class 2', code: 'C02', order: 3 },
    { name: 'Class 3', code: 'C03', order: 4 },
    { name: 'Class 4', code: 'C04', order: 5 },
    { name: 'Class 5', code: 'C05', order: 6 },
    { name: 'Class 6', code: 'C06', order: 7 },
    { name: 'Class 7', code: 'C07', order: 8 },
    { name: 'Class 8', code: 'C08', order: 9 },
    { name: 'Class 9 (Science)', code: 'C09', order: 10 },
    { name: 'Class 10 (Science)', code: 'C10', order: 11 },
  ];

  const createdClasses: Record<string, any> = {};
  const createdSections: Record<string, any> = {};

  for (const c of classData) {
    const createdClass = await prisma.class.create({
      data: {
        name: c.name,
        code: c.code,
        orderIndex: c.order,
      },
    });
    createdClasses[c.code] = createdClass;

    // Create Sections A, B
    const secA = await prisma.section.create({
      data: {
        name: 'Section A',
        classId: createdClass.id,
        roomNo: `Room ${100 + c.order * 2 + 1}`,
        capacity: 35,
        classTeacherId: c.code === 'C08' ? teacher1.id : (c.code === 'C09' ? teacher3.id : teacher2.id),
      },
    });
    const secB = await prisma.section.create({
      data: {
        name: 'Section B',
        classId: createdClass.id,
        roomNo: `Room ${100 + c.order * 2 + 2}`,
        capacity: 35,
      },
    });
    createdSections[`${c.code}-A`] = secA;
    createdSections[`${c.code}-B`] = secB;
  }

  // 7. Subjects for Class 8 and Class 9
  const subMath8 = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      code: 'MATH-08',
      classId: createdClasses['C08'].id,
      teacherId: teacher1.id,
      totalMarks: 100,
      passingMarks: 33,
      creditHours: 5,
    },
  });

  const subEng8 = await prisma.subject.create({
    data: {
      name: 'English Language & Comp',
      code: 'ENG-08',
      classId: createdClasses['C08'].id,
      teacherId: teacher2.id,
      totalMarks: 100,
      passingMarks: 33,
      creditHours: 4,
    },
  });

  const subSci8 = await prisma.subject.create({
    data: {
      name: 'General Science',
      code: 'SCI-08',
      classId: createdClasses['C08'].id,
      teacherId: teacher3.id,
      totalMarks: 100,
      passingMarks: 33,
      creditHours: 4,
    },
  });

  const subUrdu8 = await prisma.subject.create({
    data: {
      name: 'Urdu Literature',
      code: 'URD-08',
      classId: createdClasses['C08'].id,
      teacherId: teacher2.id,
      totalMarks: 100,
      passingMarks: 33,
      creditHours: 3,
    },
  });

  const subIsl8 = await prisma.subject.create({
    data: {
      name: 'Islamiyat Compulsory',
      code: 'ISL-08',
      classId: createdClasses['C08'].id,
      teacherId: teacher1.id,
      totalMarks: 50,
      passingMarks: 17,
      creditHours: 2,
    },
  });

  // 8. Timetable for Class 8-A
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  for (const day of days) {
    await prisma.timetable.create({
      data: {
        classId: createdClasses['C08'].id,
        sectionId: createdSections['C08-A'].id,
        subjectId: subMath8.id,
        teacherId: teacher1.id,
        dayOfWeek: day,
        startTime: '08:30',
        endTime: '09:15',
        roomNo: 'Room 201',
      },
    });
    await prisma.timetable.create({
      data: {
        classId: createdClasses['C08'].id,
        sectionId: createdSections['C08-A'].id,
        subjectId: subEng8.id,
        teacherId: teacher2.id,
        dayOfWeek: day,
        startTime: '09:20',
        endTime: '10:05',
        roomNo: 'Room 201',
      },
    });
    await prisma.timetable.create({
      data: {
        classId: createdClasses['C08'].id,
        sectionId: createdSections['C08-A'].id,
        subjectId: subSci8.id,
        teacherId: teacher3.id,
        dayOfWeek: day,
        startTime: '10:25',
        endTime: '11:10',
        roomNo: 'Room 201',
      },
    });
  }

  // 9. Parents
  await prisma.parent.deleteMany({});
  
  const parentUser1 = await prisma.user.create({
    data: {
      username: 'parent.tariq',
      email: 'dr.tariq@gmail.com',
      passwordHash: parentPasswordHash,
      role: 'PARENT',
      status: 'ACTIVE',
      isFirstLogin: false,
    },
  });

  const parent1 = await prisma.parent.create({
    data: {
      userId: parentUser1.id,
      fatherName: 'Dr. Tariq Mehmood',
      fatherPhone: '+92 333 5551122',
      fatherEmail: 'dr.tariq@gmail.com',
      fatherOccupation: 'Professor of Surgery (KTH)',
      fatherCnic: '17301-1234567-1',
      motherName: 'Dr. Samina Tariq',
      motherPhone: '+92 333 5551123',
      motherOccupation: 'Gynecologist',
      address: 'House 42, Street 7, Sector F-3, Phase 6, Hayatabad, Peshawar',
      city: 'Peshawar',
      emergencyContact: '+92 333 5551122',
    },
  });

  const parentUser2 = await prisma.user.create({
    data: {
      username: 'parent.zafar',
      email: 'zafar.iqbal@tradecorp.pk',
      passwordHash: parentPasswordHash,
      role: 'PARENT',
      status: 'ACTIVE',
      isFirstLogin: false,
    },
  });

  const parent2 = await prisma.parent.create({
    data: {
      userId: parentUser2.id,
      fatherName: 'Haji Zafar Iqbal',
      fatherPhone: '+92 300 9001122',
      fatherEmail: 'zafar.iqbal@tradecorp.pk',
      fatherOccupation: 'Managing Director, Frontier Exports',
      fatherCnic: '17301-7654321-3',
      motherName: 'Mrs. Rukhsana Zafar',
      motherPhone: '+92 300 9001123',
      address: 'Bungalow 18, Sector E-2, Phase 1, Hayatabad, Peshawar',
      city: 'Peshawar',
      emergencyContact: '+92 300 9001122',
    },
  });

  // 10. Students
  await prisma.student.deleteMany({});

  // Student 1: Hamza Tariq (Class 8-A)
  const studentUser1 = await prisma.user.create({
    data: {
      username: 'THMS-2026-000001',
      email: 'hamza.tariq@student.hayatabadmodel.edu.pk',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      isFirstLogin: false,
    },
  });

  const student1 = await prisma.student.create({
    data: {
      userId: studentUser1.id,
      studentId: 'THMS-2026-000001',
      admissionNo: 'ADM-2026-000001',
      rollNo: '08-A-001',
      firstName: 'Hamza',
      lastName: 'Tariq',
      fullName: 'Hamza Tariq',
      dob: new Date('2012-05-14'),
      gender: 'MALE',
      bloodGroup: 'O+',
      nationality: 'Pakistani',
      status: 'ENROLLED',
      classId: createdClasses['C08'].id,
      sectionId: createdSections['C08-A'].id,
      sessionId: session2026.id,
      parentId: parent1.id,
      qrToken: 'THMS-QR-2026-000001-a1b2c3d4',
      emergencyName: 'Dr. Tariq Mehmood',
      emergencyRelation: 'Father',
      emergencyPhone: '+92 333 5551122',
      previousSchool: 'Peshawar Model School',
      previousClass: 'Class 7',
      previousGrade: 'A+',
    },
  });

  // Student 2: Aiman Tariq (Class 5-A, Sister of Hamza)
  const studentUser2 = await prisma.user.create({
    data: {
      username: 'THMS-2026-000002',
      email: 'aiman.tariq@student.hayatabadmodel.edu.pk',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      isFirstLogin: false,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      userId: studentUser2.id,
      studentId: 'THMS-2026-000002',
      admissionNo: 'ADM-2026-000002',
      rollNo: '05-A-001',
      firstName: 'Aiman',
      lastName: 'Tariq',
      fullName: 'Aiman Tariq',
      dob: new Date('2015-09-22'),
      gender: 'FEMALE',
      bloodGroup: 'B+',
      nationality: 'Pakistani',
      status: 'ENROLLED',
      classId: createdClasses['C05'].id,
      sectionId: createdSections['C05-A'].id,
      sessionId: session2026.id,
      parentId: parent1.id,
      qrToken: 'THMS-QR-2026-000002-e5f6g7h8',
      emergencyName: 'Dr. Tariq Mehmood',
      emergencyRelation: 'Father',
      emergencyPhone: '+92 333 5551122',
      previousSchool: 'The Hayatabad Model Junior Wing',
      previousClass: 'Class 4',
      previousGrade: 'A+',
    },
  });

  // Student 3: Usman Zafar (Class 8-A)
  const studentUser3 = await prisma.user.create({
    data: {
      username: 'THMS-2026-000003',
      email: 'usman.zafar@student.hayatabadmodel.edu.pk',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      isFirstLogin: false,
    },
  });

  const student3 = await prisma.student.create({
    data: {
      userId: studentUser3.id,
      studentId: 'THMS-2026-000003',
      admissionNo: 'ADM-2026-000003',
      rollNo: '08-A-002',
      firstName: 'Usman',
      lastName: 'Zafar',
      fullName: 'Usman Zafar',
      dob: new Date('2012-08-19'),
      gender: 'MALE',
      bloodGroup: 'A+',
      nationality: 'Pakistani',
      status: 'ENROLLED',
      classId: createdClasses['C08'].id,
      sectionId: createdSections['C08-A'].id,
      sessionId: session2026.id,
      parentId: parent2.id,
      qrToken: 'THMS-QR-2026-000003-i9j0k1l2',
      emergencyName: 'Haji Zafar Iqbal',
      emergencyRelation: 'Father',
      emergencyPhone: '+92 300 9001122',
    },
  });

  // 11. Fee Structure
  await prisma.feeStructure.deleteMany({});
  const feeStructure8 = await prisma.feeStructure.create({
    data: {
      name: 'Fee Structure Class 8 (2026)',
      classId: createdClasses['C08'].id,
      sessionId: session2026.id,
      admissionFee: 15000,
      tuitionFee: 8500,
      examFee: 2000,
      transportFee: 3500,
      libraryFee: 500,
      activityFee: 1000,
      lateFeePerDay: 50,
      dueDateDay: 10,
    },
  });

  // 12. Fee Invoices & Payments
  await prisma.feeInvoice.deleteMany({});
  await prisma.payment.deleteMany({});

  // Paid Invoice for Hamza
  const inv1 = await prisma.feeInvoice.create({
    data: {
      invoiceNo: 'INV-2026-000001',
      studentId: student1.id,
      sessionId: session2026.id,
      title: 'Monthly Tuition & Activities - March 2026',
      month: 'March 2026',
      issueDate: new Date('2026-03-01'),
      dueDate: new Date('2026-03-10'),
      totalAmount: 10000,
      discountAmount: 0,
      paidAmount: 10000,
      remainingAmount: 0,
      status: 'PAID',
      remarks: 'Paid in full via Bank Transfer',
      items: {
        create: [
          { feeType: 'TUITION', amount: 8500, description: 'Monthly Tuition Fee' },
          { feeType: 'ACTIVITY', amount: 1000, description: 'Lab & Sports Activity Charges' },
          { feeType: 'LIBRARY', amount: 500, description: 'Library & Digital Resource Access' },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      receiptNo: 'REC-2026-000001',
      invoiceId: inv1.id,
      studentId: student1.id,
      amount: 10000,
      paymentDate: new Date('2026-03-05'),
      paymentMethod: 'BANK_TRANSFER',
      transactionRef: 'HBL-FT-99482103',
      bankName: 'Habib Bank Limited, Hayatabad Branch',
      receivedById: accountantUser.id,
      status: 'COMPLETED',
      remarks: 'Online Bank Transfer verified',
    },
  });

  // Pending Invoice for Usman
  await prisma.feeInvoice.create({
    data: {
      invoiceNo: 'INV-2026-000002',
      studentId: student3.id,
      sessionId: session2026.id,
      title: 'Monthly Tuition & Transport - March 2026',
      month: 'March 2026',
      issueDate: new Date('2026-03-01'),
      dueDate: new Date('2026-03-10'),
      totalAmount: 13500,
      discountAmount: 1000,
      paidAmount: 0,
      remainingAmount: 12500,
      status: 'PENDING',
      remarks: 'Sibling scholarship concession applied (Rs. 1,000)',
      items: {
        create: [
          { feeType: 'TUITION', amount: 8500, description: 'Monthly Tuition Fee' },
          { feeType: 'TRANSPORT', amount: 3500, description: 'Route 1 (Phase 1-6)' },
          { feeType: 'ACTIVITY', amount: 1000, description: 'Science Lab charges' },
          { feeType: 'LIBRARY', amount: 500, description: 'Library charges' },
        ],
      },
    },
  });

  // 13. Attendance Records for past 5 days
  await prisma.attendance.deleteMany({});
  const pastDays = [
    { date: new Date('2026-08-25'), status: 'PRESENT', time: '08:05 AM' },
    { date: new Date('2026-08-26'), status: 'PRESENT', time: '08:12 AM' },
    { date: new Date('2026-08-27'), status: 'LATE', time: '08:35 AM' },
    { date: new Date('2026-08-28'), status: 'PRESENT', time: '08:08 AM' },
    { date: new Date('2026-08-29'), status: 'PRESENT', time: '08:04 AM' },
  ];

  for (const day of pastDays) {
    await prisma.attendance.create({
      data: {
        studentId: student1.id,
        date: day.date,
        time: day.time,
        status: day.status,
        method: 'QR',
        remarks: 'Main Gate QR scanner verified',
      },
    });
    await prisma.attendance.create({
      data: {
        studentId: student3.id,
        date: day.date,
        time: '08:10 AM',
        status: 'PRESENT',
        method: 'QR',
      },
    });
  }

  // 14. Exam & Marks for Mid-Term 2026
  await prisma.exam.deleteMany({});
  const midTermExam = await prisma.exam.create({
    data: {
      name: 'Mid-Term Examination 2026',
      sessionId: session2026.id,
      term: 'MID_TERM',
      startDate: new Date('2026-09-15'),
      endDate: new Date('2026-09-25'),
      status: 'PUBLISHED',
    },
  });

  const schedMath = await prisma.examSchedule.create({
    data: {
      examId: midTermExam.id,
      classId: createdClasses['C08'].id,
      sectionId: createdSections['C08-A'].id,
      subjectId: subMath8.id,
      examDate: new Date('2026-09-16'),
      startTime: '09:00',
      endTime: '12:00',
      roomNo: 'Examination Hall A',
      totalMarks: 100,
      passingMarks: 33,
    },
  });

  const schedEng = await prisma.examSchedule.create({
    data: {
      examId: midTermExam.id,
      classId: createdClasses['C08'].id,
      sectionId: createdSections['C08-A'].id,
      subjectId: subEng8.id,
      examDate: new Date('2026-09-18'),
      startTime: '09:00',
      endTime: '12:00',
      roomNo: 'Examination Hall A',
      totalMarks: 100,
      passingMarks: 33,
    },
  });

  const schedSci = await prisma.examSchedule.create({
    data: {
      examId: midTermExam.id,
      classId: createdClasses['C08'].id,
      sectionId: createdSections['C08-A'].id,
      subjectId: subSci8.id,
      examDate: new Date('2026-09-20'),
      startTime: '09:00',
      endTime: '12:00',
      roomNo: 'Examination Hall A',
      totalMarks: 100,
      passingMarks: 33,
    },
  });

  // Marks for Hamza Tariq (High achiever: 95 in Math, 91 in English, 94 in Science)
  await prisma.mark.create({
    data: {
      examScheduleId: schedMath.id,
      studentId: student1.id,
      marksObtained: 95,
      totalMarks: 100,
      percentage: 95,
      grade: 'A+',
      gpa: 4.0,
      remarks: 'Outstanding analytical skills',
      enteredById: teacher1.id,
      isPublished: true,
    },
  });

  await prisma.mark.create({
    data: {
      examScheduleId: schedEng.id,
      studentId: student1.id,
      marksObtained: 91,
      totalMarks: 100,
      percentage: 91,
      grade: 'A+',
      gpa: 4.0,
      remarks: 'Excellent vocabulary and expression',
      enteredById: teacher2.id,
      isPublished: true,
    },
  });

  await prisma.mark.create({
    data: {
      examScheduleId: schedSci.id,
      studentId: student1.id,
      marksObtained: 94,
      totalMarks: 100,
      percentage: 94,
      grade: 'A+',
      gpa: 4.0,
      remarks: 'Demonstrates deep conceptual grasp of scientific theories',
      enteredById: teacher3.id,
      isPublished: true,
    },
  });

  // Marks for Usman Zafar
  await prisma.mark.create({
    data: {
      examScheduleId: schedMath.id,
      studentId: student3.id,
      marksObtained: 84,
      totalMarks: 100,
      percentage: 84,
      grade: 'A',
      gpa: 3.7,
      remarks: 'Very good performance',
      enteredById: teacher1.id,
      isPublished: true,
    },
  });

  // 15. Homework & Study Material
  await prisma.homework.deleteMany({});
  await prisma.homework.create({
    data: {
      classId: createdClasses['C08'].id,
      sectionId: createdSections['C08-A'].id,
      subjectId: subMath8.id,
      teacherId: teacher1.id,
      title: 'Algebraic Expressions & Factorization Exercise 4.2',
      description: 'Solve questions 1 through 15 on Chapter 4. Ensure step-by-step proofs for quadratic expansions.',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.studyMaterial.deleteMany({});
  await prisma.studyMaterial.create({
    data: {
      classId: createdClasses['C08'].id,
      subjectId: subSci8.id,
      teacherId: teacher3.id,
      title: 'Cell Biology & Microscopic Structure Revision Notes',
      description: 'Comprehensive illustrated summary of plant vs animal cells with labelled diagrams.',
      fileUrl: '/documents/cell_biology_notes.pdf',
      fileType: 'PDF',
      topic: 'Cellular Biology',
    },
  });

  // 16. Announcements
  await prisma.announcement.deleteMany({});
  await prisma.announcement.create({
    data: {
      title: 'Annual Science, Robotics & Innovation Fair 2026',
      content: 'The Hayatabad Model School is proud to host the Annual Science & Robotics Expo next Friday. All students from Class 6 to 10 are encouraged to submit project models.',
      targetAudience: 'ALL',
      isPinned: true,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Mid-Term Examination Date Sheet Released',
      content: 'Official timetable for Mid-Term Examination 2026 has been published. Please check the examination portal and prepare accordingly.',
      targetAudience: 'ALL',
      isPinned: false,
    },
  });

  // 17. Sample Admission Applications for the 1-Click Enrollment Demo
  await prisma.admissionApplication.deleteMany({});
  await prisma.admissionApplication.create({
    data: {
      applicationNo: 'THMS-APP-2026-0042',
      status: 'SUBMITTED',
      sessionId: session2026.id,
      applyingClassId: createdClasses['C08'].id,
      preferredSectionId: createdSections['C08-A'].id,
      firstName: 'Muhammad',
      middleName: 'Ali',
      lastName: 'Durrani',
      fullName: 'Muhammad Ali Durrani',
      dob: new Date('2012-04-10'),
      gender: 'MALE',
      bloodGroup: 'A+',
      nationality: 'Pakistani',
      fatherName: 'Kamran Khan Durrani',
      fatherPhone: '+92 333 4447788',
      fatherEmail: 'kamran.durrani@gmail.com',
      fatherOccupation: 'Civil Engineer (C&W Dept)',
      fatherCnic: '17301-4455667-1',
      motherName: 'Shazia Durrani',
      motherPhone: '+92 333 4447789',
      houseStreet: 'House 112, Street 3, Sector N-1',
      area: 'Phase 4, Hayatabad',
      city: 'Peshawar',
      district: 'Peshawar',
      province: 'KPK',
      postalCode: '25000',
      emergencyName: 'Kamran Khan Durrani',
      emergencyRelation: 'Father',
      emergencyPhone: '+92 333 4447788',
      previousSchool: 'Army Public School Peshawar',
      previousClass: 'Class 7',
      previousGrade: 'A',
      reviewNotes: 'Strong academic background. All verification documents attached.',
    },
  });

  await prisma.admissionApplication.create({
    data: {
      applicationNo: 'THMS-APP-2026-0043',
      status: 'UNDER_REVIEW',
      sessionId: session2026.id,
      applyingClassId: createdClasses['C09'].id,
      firstName: 'Zainab',
      lastName: 'Shinwari',
      fullName: 'Zainab Shinwari',
      dob: new Date('2011-11-05'),
      gender: 'FEMALE',
      bloodGroup: 'O+',
      nationality: 'Pakistani',
      fatherName: 'Gulzar Shinwari',
      fatherPhone: '+92 301 8889900',
      fatherEmail: 'gulzar.shinwari@trade.pk',
      fatherOccupation: 'Businessman',
      fatherCnic: '17301-9988776-5',
      houseStreet: 'Plot 55, Sector F-1',
      area: 'Phase 6, Hayatabad',
      city: 'Peshawar',
      district: 'Peshawar',
      province: 'KPK',
      postalCode: '25000',
      emergencyName: 'Gulzar Shinwari',
      emergencyRelation: 'Father',
      emergencyPhone: '+92 301 8889900',
      previousSchool: 'Frontier Science Academy',
      previousClass: 'Class 8',
      previousGrade: 'A+',
      reviewNotes: 'Candidate scheduled for academic assessment and interview.',
    },
  });

  // 18. Library Books
  await prisma.libraryBook.deleteMany({});
  await prisma.libraryBook.create({
    data: {
      accessionNo: 'BK-SCI-0101',
      isbn: '978-0199066542',
      title: 'Oxford Secondary Science for Class 8',
      author: 'Terry Jennings',
      category: 'SCIENCE',
      publisher: 'Oxford University Press',
      totalCopies: 25,
      availableCopies: 23,
      shelfLocation: 'Rack S-2, Shelf 3',
    },
  });

  await prisma.libraryBook.create({
    data: {
      accessionNo: 'BK-MAT-0202',
      isbn: '978-0199067891',
      title: 'New Syllabus Mathematics 8th Edition',
      author: 'Dr. Joseph Yeo & Teh Keng Seng',
      category: 'MATHEMATICS',
      publisher: 'Shinglee Publishers / OUP',
      totalCopies: 30,
      availableCopies: 28,
      shelfLocation: 'Rack M-1, Shelf 2',
    },
  });

  // 19. Transport Routes & Vehicles
  await prisma.transportVehicle.deleteMany({});
  await prisma.transportRoute.deleteMany({});
  const bus1 = await prisma.transportVehicle.create({
    data: {
      vehicleNo: 'PST-9482',
      model: 'Toyota Coaster Deluxe (AC)',
      capacity: 32,
      driverName: 'Sher Afzal Khan',
      driverPhone: '+92 344 7711223',
      helperName: 'Niaz Muhammad',
      helperPhone: '+92 344 7711224',
      isActive: true,
    },
  });

  const route1 = await prisma.transportRoute.create({
    data: {
      routeName: 'Route 1: Phase 1 to Phase 7 Hayatabad Direct',
      vehicleId: bus1.id,
      startPoint: 'Tatara Park Roundabout, Phase 1',
      endPoint: 'The Hayatabad Model School Main Gate',
      monthlyFee: 3500,
      stops: {
        create: [
          { stopName: 'Tatara Park Phase 1', pickupTime: '07:10 AM', dropTime: '02:30 PM', orderIndex: 1 },
          { stopName: 'Zarghoni Mosque Chowk, Phase 2', pickupTime: '07:20 AM', dropTime: '02:40 PM', orderIndex: 2 },
          { stopName: 'Bagh-e-Naran Main Gate, Phase 3', pickupTime: '07:30 AM', dropTime: '02:50 PM', orderIndex: 3 },
          { stopName: 'Achini Payan Roundabout, Phase 6', pickupTime: '07:45 AM', dropTime: '03:05 PM', orderIndex: 4 },
        ],
      },
    },
  });

  // 20. Inventory Items
  await prisma.inventoryItem.deleteMany({});
  await prisma.inventoryItem.create({
    data: {
      itemCode: 'INV-PHY-01',
      name: 'Digital Vernier Caliper (Stainless Steel)',
      category: 'LAB_EQUIPMENT',
      quantity: 15,
      unit: 'Pieces',
      location: 'Physics Lab - Cupboard A',
      minimumThreshold: 5,
      unitPrice: 3500,
    },
  });

  await prisma.inventoryItem.create({
    data: {
      itemCode: 'INV-IT-01',
      name: 'Dell Core i7 12th Gen All-In-One Desktop',
      category: 'IT_HARDWARE',
      quantity: 40,
      unit: 'Units',
      location: 'Computer Lab 1',
      minimumThreshold: 10,
      unitPrice: 185000,
    },
  });

  // 21. Audit Log
  await prisma.auditLog.deleteMany({});
  await prisma.auditLog.create({
    data: {
      userName: 'Super Admin',
      role: 'SUPER_ADMIN',
      action: 'SYSTEM_INITIALIZATION',
      entity: 'System',
      details: 'The Hayatabad Model School ERP database initialized and seeded with Academic Session 2026.',
    },
  });

  console.log('Seed completed successfully for The Hayatabad Model School!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
