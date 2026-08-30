import prisma from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';

async function seedExtensiveSchoolData() {
  console.log('===============================================================');
  console.log('⚡ SEEDING EXTENSIVE REALISTIC SCHOOL DATA (NEON POSTGRESQL)');
  console.log('===============================================================\n');

  // 1. Ensure School Setting
  let school = await prisma.schoolSetting.findFirst();
  if (!school) {
    school = await prisma.schoolSetting.create({
      data: {
        schoolName: 'The Hayatabad Model School',
        schoolCode: 'THMS-01',
        tagline: 'Nurturing Future Leaders with Academic Excellence & Moral Character',
        address: 'Sector F-4, Phase 6, Hayatabad, Peshawar, Khyber Pakhtunkhwa',
        city: 'Peshawar',
        province: 'KPK',
        postalCode: '25000',
        phone: '+92 91 5812345',
        email: 'info@hayatabadmodel.edu.pk',
        website: 'https://hayatabadmodel.edu.pk',
        principalName: 'Prof. Muhammad Tariq Khan',
      },
    });
  }
  console.log('✅ School Setting verified:', school.schoolName);

  // 2. Ensure Academic Session
  let session = await prisma.academicSession.findFirst({
    where: { code: '2026-27' },
  });
  if (!session) {
    session = await prisma.academicSession.create({
      data: {
        name: 'Academic Session 2026-2027',
        code: '2026-27',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        isCurrent: true,
      },
    });
  }
  console.log('✅ Academic Session verified:', session.name);

  // 3. Classes and Sections
  const classDefs = [
    { name: 'Playgroup', code: 'PG', orderIndex: 1 },
    { name: 'Nursery', code: 'NUR', orderIndex: 2 },
    { name: 'Prep', code: 'PREP', orderIndex: 3 },
    { name: 'Class 1', code: 'C01', orderIndex: 4 },
    { name: 'Class 2', code: 'C02', orderIndex: 5 },
    { name: 'Class 3', code: 'C03', orderIndex: 6 },
    { name: 'Class 4', code: 'C04', orderIndex: 7 },
    { name: 'Class 5', code: 'C05', orderIndex: 8 },
    { name: 'Class 6', code: 'C06', orderIndex: 9 },
    { name: 'Class 7', code: 'C07', orderIndex: 10 },
    { name: 'Class 8', code: 'C08', orderIndex: 11 },
    { name: 'Class 9', code: 'C09', orderIndex: 12 },
    { name: 'Class 10', code: 'C10', orderIndex: 13 },
  ];

  const existingClasses = await prisma.class.findMany();
  const classMap = new Map<string, any>();
  for (const ec of existingClasses) {
    classMap.set(ec.code, ec);
  }

  for (const c of classDefs) {
    if (!classMap.has(c.code)) {
      const created = await prisma.class.create({
        data: {
          name: c.name,
          code: c.code,
          orderIndex: c.orderIndex,
        },
      });
      classMap.set(c.code, created);
      console.log(`   └─ Created Class: ${c.name}`);
    }
  }

  // Ensure sections
  const existingSections = await prisma.section.findMany();
  const sectionSet = new Set(existingSections.map((s) => `${s.classId}-${s.name}`));

  for (const cls of Array.from(classMap.values())) {
    for (const secName of ['Section A', 'Section B']) {
      const key = `${cls.id}-${secName}`;
      if (!sectionSet.has(key)) {
        await prisma.section.create({
          data: {
            name: secName,
            classId: cls.id,
            capacity: 35,
          },
        });
      }
    }
  }
  console.log('✅ All 13 Classes & Sections Ready');

  // 4. Seed Faculty / Teachers
  const teacherDefs = [
    { fullName: 'Engr. Farooq Ahmad', username: 'teacher.farooq', email: 'farooq.ahmad@hayatabadmodel.edu.pk', phone: '+92 333 9123401', qual: 'M.Sc Mathematics', desig: 'Head of Mathematics Department' },
    { fullName: 'Dr. Zobia Khan', username: 'teacher.zobia', email: 'zobia.khan@hayatabadmodel.edu.pk', phone: '+92 333 9123402', qual: 'Ph.D Zoology', desig: 'Head of Science Department' },
    { fullName: 'Prof. Asadullah Tariq', username: 'teacher.asad', email: 'asadullah.tariq@hayatabadmodel.edu.pk', phone: '+92 333 9123403', qual: 'M.Phil Physics', desig: 'Senior Physics Specialist' },
    { fullName: 'Ms. Saima Khattak', username: 'teacher.saima', email: 'saima.khattak@hayatabadmodel.edu.pk', phone: '+92 333 9123404', qual: 'MA English Literature', desig: 'Senior English Faculty' },
    { fullName: 'Qari Abdul Rehman', username: 'teacher.rehman', email: 'abdul.rehman@hayatabadmodel.edu.pk', phone: '+92 333 9123405', qual: 'Shahadat-ul-Almiya', desig: 'Head of Islamic Studies' },
    { fullName: 'Mr. Tariq Aziz', username: 'teacher.tariq', email: 'tariq.aziz@hayatabadmodel.edu.pk', phone: '+92 333 9123406', qual: 'BS Computer Science', desig: 'Robotics & IT Instructor' },
    { fullName: 'Ms. Bushra Noreen', username: 'teacher.bushra', email: 'bushra.noreen@hayatabadmodel.edu.pk', phone: '+92 333 9123407', qual: 'M.Sc Chemistry', desig: 'Senior Chemistry Faculty' },
    { fullName: 'Mr. Muhammad Usman', username: 'teacher.usman', email: 'muhammad.usman@hayatabadmodel.edu.pk', phone: '+92 333 9123408', qual: 'MA Urdu', desig: 'Senior Urdu Faculty' },
    { fullName: 'Ms. Hina Gul', username: 'teacher.hina', email: 'hina.gul@hayatabadmodel.edu.pk', phone: '+92 333 9123409', qual: 'M.Sc Pakistan Studies', desig: 'Social Sciences Incharge' },
    { fullName: 'Ms. Nazia Pervez', username: 'teacher.nazia', email: 'nazia.pervez@hayatabadmodel.edu.pk', phone: '+92 333 9123410', qual: 'Montessori Certified', desig: 'Primary Wing Headmistress' },
  ];

  const defaultTeacherPassword = await hashPassword('Teacher@123');

  for (const t of teacherDefs) {
    let user = await prisma.user.findFirst({ where: { username: t.username } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: t.username,
          email: t.email,
          passwordHash: defaultTeacherPassword,
          role: 'TEACHER',
          status: 'ACTIVE',
        },
      });
    }

    const existingTeacher = await prisma.teacher.findFirst({ where: { userId: user.id } });
    if (!existingTeacher) {
      await prisma.teacher.create({
        data: {
          userId: user.id,
          employeeId: `EMP-${t.username.replace('teacher.', '').toUpperCase()}`,
          fullName: t.fullName,
          email: t.email,
          phone: t.phone,
          qualification: t.qual,
          designation: t.desig,
          joiningDate: new Date('2021-08-15'),
        },
      });
    }
  }
  console.log('✅ 10 Dedicated Faculty accounts and profiles ready.');

  // 5. Seed 24 Students with Parents & Invoices
  const studentDefs = [
    { name: 'Hamza Tariq', classCode: 'C08', gender: 'MALE', father: 'Dr. Tariq Mehmood', phone: '+92 333 9123501', roll: '08-A-001' },
    { name: 'Aiman Tariq', classCode: 'C05', gender: 'FEMALE', father: 'Dr. Tariq Mehmood', phone: '+92 333 9123501', roll: '05-A-001' },
    { name: 'Muhammad Bilal Khan', classCode: 'C09', gender: 'MALE', father: 'Engr. Bilal Khattak', phone: '+92 333 9123502', roll: '09-A-001' },
    { name: 'Fatima Zahra', classCode: 'C10', gender: 'FEMALE', father: 'Syed Zahid Shah', phone: '+92 333 9123503', roll: '10-A-001' },
    { name: 'Daniyal Ahmad', classCode: 'C07', gender: 'MALE', father: 'Ahmad Jan', phone: '+92 333 9123504', roll: '07-A-001' },
    { name: 'Ayesha Noor', classCode: 'C06', gender: 'FEMALE', father: 'Noor Muhammad', phone: '+92 333 9123505', roll: '06-A-001' },
    { name: 'Syed Umar Shah', classCode: 'C04', gender: 'MALE', father: 'Syed Zahid Shah', phone: '+92 333 9123503', roll: '04-A-001' },
    { name: 'Zainab Bibi', classCode: 'C03', gender: 'FEMALE', father: 'Akram Khan', phone: '+92 333 9123506', roll: '03-A-001' },
    { name: 'Rayan Afridi', classCode: 'C02', gender: 'MALE', father: 'Jamil Afridi', phone: '+92 333 9123507', roll: '02-A-001' },
    { name: 'Sara Mehmood', classCode: 'C01', gender: 'FEMALE', father: 'Mehmood Ali', phone: '+92 333 9123508', roll: '01-A-001' },
    { name: 'Mustafa Kamal', classCode: 'PREP', gender: 'MALE', father: 'Kamal Uddin', phone: '+92 333 9123509', roll: 'PR-A-001' },
    { name: 'Eshal Fatima', classCode: 'NUR', gender: 'FEMALE', father: 'Irfan Ullah', phone: '+92 333 9123510', roll: 'NR-A-001' },
    { name: 'Zarak Khan', classCode: 'PG', gender: 'MALE', father: 'Asim Khan', phone: '+92 333 9123511', roll: 'PG-A-001' },
    { name: 'Muhammad Huzaifa', classCode: 'C08', gender: 'MALE', father: 'Haji Fazal Qadir', phone: '+92 333 9123512', roll: '08-A-002' },
    { name: 'Mahnoor Khattak', classCode: 'C09', gender: 'FEMALE', father: 'Arshad Khattak', phone: '+92 333 9123513', roll: '09-A-002' },
    { name: 'Usman Ali', classCode: 'C10', gender: 'MALE', father: 'Ali Asghar', phone: '+92 333 9123514', roll: '10-A-002' },
    { name: 'Hafsa Rehman', classCode: 'C07', gender: 'FEMALE', father: 'Attiq-ur-Rehman', phone: '+92 333 9123515', roll: '07-A-002' },
    { name: 'Abdullah Jan', classCode: 'C06', gender: 'MALE', father: 'Niaz Jan', phone: '+92 333 9123516', roll: '06-A-002' },
    { name: 'Malaika Gul', classCode: 'C05', gender: 'FEMALE', father: 'Sher Gul', phone: '+92 333 9123517', roll: '05-A-002' },
    { name: 'Shahmir Shinwari', classCode: 'C04', gender: 'MALE', father: 'Zahid Shinwari', phone: '+92 333 9123518', roll: '04-A-002' },
    { name: 'Anaya Khan', classCode: 'C03', gender: 'FEMALE', father: 'Noman Khan', phone: '+92 333 9123519', roll: '03-A-002' },
    { name: 'Ammar Yasir', classCode: 'C02', gender: 'MALE', father: 'Yasir Hameed', phone: '+92 333 9123520', roll: '02-A-002' },
    { name: 'Khadija Tul Kubra', classCode: 'C01', gender: 'FEMALE', father: 'Qari Zia-ur-Rehman', phone: '+92 333 9123521', roll: '01-A-002' },
    { name: 'Ibrahim Khalil', classCode: 'PREP', gender: 'MALE', father: 'Khalil Ahmad', phone: '+92 333 9123522', roll: 'PR-A-002' },
  ];

  const defaultStudentPassword = await hashPassword('Student@123');
  const defaultParentPassword = await hashPassword('Parent@123');

  const allSections = await prisma.section.findMany();
  const sectionByClass = new Map<string, string>();
  for (const s of allSections) {
    if (!sectionByClass.has(s.classId)) {
      sectionByClass.set(s.classId, s.id);
    }
  }

  let idx = 1;
  for (const s of studentDefs) {
    const studentId = `THMS-2026-${idx.toString().padStart(6, '0')}`;
    const admissionNo = `ADM-2026-${(1000 + idx).toString()}`;
    const cls = classMap.get(s.classCode) || classMap.get('C08');
    const secId = sectionByClass.get(cls.id) || cls.id;

    // Parent user & profile
    const parentUsername = `parent.${s.phone.replace(/\D/g, '').slice(-7)}`;
    let parentUser = await prisma.user.findFirst({ where: { username: parentUsername } });
    if (!parentUser) {
      parentUser = await prisma.user.create({
        data: {
          username: parentUsername,
          email: `parent.${s.phone.replace(/\D/g, '').slice(-4)}@gmail.com`,
          passwordHash: defaultParentPassword,
          role: 'PARENT',
          status: 'ACTIVE',
        },
      });
    }

    let parent = await prisma.parent.findFirst({ where: { userId: parentUser.id } });
    if (!parent) {
      parent = await prisma.parent.create({
        data: {
          userId: parentUser.id,
          fatherName: s.father,
          fatherPhone: s.phone,
          city: 'Peshawar',
          district: 'Peshawar',
          province: 'KPK',
          address: `House #${idx * 7}, Street 4, Sector F-4, Phase 6, Hayatabad`,
          emergencyContact: s.phone,
        },
      });
    }

    // Student user & profile
    let studentUser = await prisma.user.findFirst({ where: { username: studentId } });
    if (!studentUser) {
      studentUser = await prisma.user.create({
        data: {
          username: studentId,
          email: `student.${studentId.toLowerCase()}@hayatabadmodel.edu.pk`,
          passwordHash: defaultStudentPassword,
          role: 'STUDENT',
          status: 'ACTIVE',
        },
      });
    }

    let existingStudent = await prisma.student.findFirst({ where: { studentId } });
    if (!existingStudent) {
      existingStudent = await prisma.student.create({
        data: {
          studentId,
          admissionNo,
          rollNo: s.roll,
          firstName: s.name.split(' ')[0],
          lastName: s.name.split(' ').slice(1).join(' ') || 'Khan',
          fullName: s.name,
          dob: new Date('2012-05-15'),
          gender: s.gender as any,
          bloodGroup: 'B_POS',
          nationality: 'Pakistani',
          status: 'ENROLLED',
          qrToken: `QR-THMS-2026-${idx.toString().padStart(6, '0')}`,
          classId: cls.id,
          sectionId: secId,
          sessionId: session.id,
          parentId: parent.id,
          userId: studentUser.id,
          emergencyName: s.father,
          emergencyPhone: s.phone,
          emergencyRelation: 'Father',
        },
      });
    }

    // Fee Invoice
    const existingInvoice = await prisma.feeInvoice.findFirst({
      where: { studentId: existingStudent.id },
    });

    if (!existingInvoice) {
      const isPaid = idx % 3 !== 0;
      const totalAmount = 8500;
      const invoice = await prisma.feeInvoice.create({
        data: {
          invoiceNo: `INV-2026-${(5000 + idx).toString()}`,
          studentId: existingStudent.id,
          sessionId: session.id,
          title: 'Monthly Tuition Fee - April 2026',
          month: 'April 2026',
          issueDate: new Date('2026-04-01'),
          dueDate: new Date('2026-04-15'),
          totalAmount,
          discountAmount: 0,
          paidAmount: isPaid ? totalAmount : 0,
          remainingAmount: isPaid ? 0 : totalAmount,
          status: isPaid ? 'PAID' : 'PENDING',
          remarks: 'Regular academic monthly fee voucher',
        },
      });

      if (isPaid) {
        await prisma.payment.create({
          data: {
            receiptNo: `REC-2026-${(7000 + idx).toString()}`,
            invoiceId: invoice.id,
            studentId: existingStudent.id,
            amount: totalAmount,
            paymentMethod: idx % 2 === 0 ? 'BANK_TRANSFER' : 'CASH',
            paymentDate: new Date(),
            remarks: 'Fee received at school accounts counter',
          },
        });
      }
    }

    idx++;
  }
  console.log(`✅ ${studentDefs.length} Students enrolled with parents, fee vouchers, and login accounts.`);

  // 6. Seed Admission Pipeline Applications
  const admissionPipeline = [
    { name: 'Muhammad Rayan', father: 'Fawad Khan', phone: '+92 333 9988111', cls: 'Class 8', status: 'SUBMITTED' },
    { name: 'Zoya Khattak', father: 'Imran Khattak', phone: '+92 333 9988112', cls: 'Class 9', status: 'UNDER_REVIEW' },
    { name: 'Shahzain Afridi', father: 'Naveed Afridi', phone: '+92 333 9988113', cls: 'Class 1', status: 'INTERVIEW_SCHEDULED' },
    { name: 'Areeba Malik', father: 'Malik Tariq', phone: '+92 333 9988114', cls: 'Class 7', status: 'APPROVED' },
    { name: 'Bilal Ahmad', father: 'Ahmad Shah', phone: '+92 333 9988115', cls: 'Prep', status: 'SUBMITTED' },
    { name: 'Fatima Noor', father: 'Noor Zaman', phone: '+92 333 9988116', cls: 'Class 4', status: 'UNDER_REVIEW' },
  ];

  const class8 = classMap.get('C08');
  for (const app of admissionPipeline) {
    const existing = await prisma.admissionApplication.findFirst({
      where: { fatherPhone: app.phone },
    });
    if (!existing) {
      await prisma.admissionApplication.create({
        data: {
          applicationNo: `APP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          firstName: app.name.split(' ')[0],
          lastName: app.name.split(' ')[1] || 'Khan',
          fullName: app.name,
          dob: new Date('2014-06-10'),
          gender: 'MALE',
          fatherName: app.father,
          fatherPhone: app.phone,
          fatherEmail: `parent.${app.phone.slice(-4)}@gmail.com`,
          houseStreet: 'Street 9, Sector F-3',
          area: 'Phase 6, Hayatabad',
          city: 'Peshawar',
          district: 'Peshawar',
          province: 'KPK',
          applyingClassId: class8?.id || '',
          previousClass: app.cls,
          sessionId: session.id,
          emergencyName: app.father,
          emergencyPhone: app.phone,
          emergencyRelation: 'Father',
          status: app.status as any,
        },
      });
    }
  }
  console.log('✅ Admission applications pipeline populated.');

  console.log('\n===============================================================');
  console.log('🎉 EXTENSIVE DATA SEED COMPLETED SUCCESSFULLY!');
  console.log('===============================================================');
}

seedExtensiveSchoolData().catch(console.error);
