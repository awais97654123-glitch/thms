import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetToCleanState() {
  console.log('\n===============================================================');
  console.log('🧹 Wiping all records to pristine zero-data production state...');
  console.log('===============================================================\n');

  try {
    // 1. Delete dependent transactional records
    await prisma.emailDeliveryLog.deleteMany({});
    await prisma.emailJob.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.notificationPreference.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.mark.deleteMany({});
    await prisma.examSchedule.deleteMany({});
    await prisma.exam.deleteMany({});
    await prisma.attendance.deleteMany({});
    await prisma.homeworkSubmission.deleteMany({});
    await prisma.homework.deleteMany({});
    await prisma.studyMaterial.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.feeItem.deleteMany({});
    await prisma.feeInvoice.deleteMany({});
    await prisma.feeStructure.deleteMany({});
    await prisma.certificate.deleteMany({});
    await prisma.libraryIssue.deleteMany({});
    await prisma.libraryBook.deleteMany({});
    await prisma.studentTransport.deleteMany({});
    await prisma.routeStop.deleteMany({});
    await prisma.transportRoute.deleteMany({});
    await prisma.transportVehicle.deleteMany({});
    await prisma.inventoryTransaction.deleteMany({});
    await prisma.inventoryItem.deleteMany({});
    await prisma.announcement.deleteMany({});

    // 2. Delete admission applications
    await prisma.admissionApplication.deleteMany({});

    // 3. Delete student, teacher, parent, staff entities
    await prisma.student.deleteMany({});
    await prisma.teacher.deleteMany({});
    await prisma.parent.deleteMany({});
    await prisma.staff.deleteMany({});

    // 4. Delete academic structures
    await prisma.timetable.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.academicSession.deleteMany({});
    await prisma.schoolSetting.deleteMany({});

    // 5. Delete non-admin users
    await prisma.user.deleteMany({});

    // 6. Create clean default Super Admin
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@hayatabadmodel.edu.pk',
        passwordHash: adminPasswordHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isFirstLogin: false,
      },
    });

    console.log('✅ Database completely wiped clean!');
    console.log('---------------------------------------------------------------');
    console.log('📊 Current Production State:');
    console.log('   • Students:      0');
    console.log('   • Teachers:      0');
    console.log('   • Parents:       0');
    console.log('   • Staff:         0');
    console.log('   • Classes:       0');
    console.log('   • Admissions:    0');
    console.log('   • Fees:          0');
    console.log('   • Attendance:    0');
    console.log('   • Exams:         0');
    console.log('   • Announcements: 0');
    console.log('---------------------------------------------------------------');
    console.log('🔑 Initial School Admin Credentials:');
    console.log('   • Username: admin');
    console.log('   • Password: Admin@123');
    console.log('   • Setup Wizard: http://localhost:3000/admin/setup');
    console.log('===============================================================\n');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetToCleanState();
