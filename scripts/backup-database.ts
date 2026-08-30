import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/db';

async function performDatabaseBackup() {
  console.log('\n===============================================================');
  console.log('💾 THE HAYATABAD MODEL SCHOOL — DATABASE BACKUP ENGINE');
  console.log('===============================================================\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(backupDir, `thms_backup_${timestamp}.json`);

  try {
    console.log('📦 Extracting all relational models...');

    const [
      schoolSettings,
      academicSessions,
      classes,
      sections,
      subjects,
      users,
      teachers,
      students,
      parents,
      staff,
      admissions,
      feeStructures,
      feeInvoices,
      feeItems,
      payments,
      attendance,
      exams,
      examSchedules,
      marks,
      gradeRules,
      homework,
      homeworkSubmissions,
      announcements,
      auditLogs,
      emailTemplates,
      emailJobs,
      emailLogs,
    ] = await Promise.all([
      prisma.schoolSetting.findMany(),
      prisma.academicSession.findMany(),
      prisma.class.findMany(),
      prisma.section.findMany(),
      prisma.subject.findMany(),
      prisma.user.findMany(),
      prisma.teacher.findMany(),
      prisma.student.findMany(),
      prisma.parent.findMany(),
      prisma.staff.findMany(),
      prisma.admissionApplication.findMany(),
      prisma.feeStructure.findMany(),
      prisma.feeInvoice.findMany(),
      prisma.feeItem.findMany(),
      prisma.payment.findMany(),
      prisma.attendance.findMany(),
      prisma.exam.findMany(),
      prisma.examSchedule.findMany(),
      prisma.mark.findMany(),
      prisma.gradeRule.findMany(),
      prisma.homework.findMany(),
      prisma.homeworkSubmission.findMany(),
      prisma.announcement.findMany(),
      prisma.auditLog.findMany(),
      prisma.notificationTemplate.findMany(),
      prisma.emailJob.findMany(),
      prisma.emailDeliveryLog.findMany(),
    ]);

    const backupData = {
      meta: {
        schoolName: 'The Hayatabad Model School',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        totalEntities: {
          users: users.length,
          students: students.length,
          teachers: teachers.length,
          admissions: admissions.length,
          feeInvoices: feeInvoices.length,
          payments: payments.length,
          attendance: attendance.length,
        },
      },
      data: {
        schoolSettings,
        academicSessions,
        classes,
        sections,
        subjects,
        users,
        teachers,
        students,
        parents,
        staff,
        admissions,
        feeStructures,
        feeInvoices,
        feeItems,
        payments,
        attendance,
        exams,
        examSchedules,
        marks,
        gradeRules,
        homework,
        homeworkSubmissions,
        announcements,
        auditLogs,
        emailTemplates,
        emailJobs,
        emailLogs,
      },
    };

    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
    const stats = fs.statSync(backupFilePath);

    console.log(`✅ Snapshot backup created successfully!`);
    console.log(`   • Location: ${backupFilePath}`);
    console.log(`   • File Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   • Timestamp: ${new Date().toLocaleString()}`);
    console.log('===============================================================\n');
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

performDatabaseBackup();
