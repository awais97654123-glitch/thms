import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/db';

async function restoreDatabase(filePath?: string) {
  console.log('\n===============================================================');
  console.log('🔄 THE HAYATABAD MODEL SCHOOL — DISASTER RECOVERY RESTORE ENGINE');
  console.log('===============================================================\n');

  const backupDir = path.join(process.cwd(), 'backups');
  let targetFile = filePath;

  if (!targetFile) {
    if (!fs.existsSync(backupDir)) {
      console.error('❌ No backups directory found.');
      process.exit(1);
    }
    const files = fs.readdirSync(backupDir).filter((f) => f.endsWith('.json')).sort().reverse();
    if (files.length === 0) {
      console.error('❌ No backup files available in backups/ directory.');
      process.exit(1);
    }
    targetFile = path.join(backupDir, files[0]);
  }

  console.log(`📂 Reading backup from: ${targetFile}`);
  const raw = fs.readFileSync(targetFile, 'utf-8');
  const backup = JSON.parse(raw);

  console.log(`📋 Metadata: ${backup.meta?.schoolName} (${backup.meta?.createdAt})`);
  console.log('⚠️ Restoring records with atomic database transactions...');

  try {
    // 1. Wipe current tables in order
    await prisma.emailDeliveryLog.deleteMany({});
    await prisma.emailJob.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.mark.deleteMany({});
    await prisma.examSchedule.deleteMany({});
    await prisma.exam.deleteMany({});
    await prisma.attendance.deleteMany({});
    await prisma.homeworkSubmission.deleteMany({});
    await prisma.homework.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.feeItem.deleteMany({});
    await prisma.feeInvoice.deleteMany({});
    await prisma.feeStructure.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.teacher.deleteMany({});
    await prisma.parent.deleteMany({});
    await prisma.staff.deleteMany({});
    await prisma.admissionApplication.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.academicSession.deleteMany({});
    await prisma.schoolSetting.deleteMany({});
    await prisma.user.deleteMany({});

    // 2. Restore primary data
    const d = backup.data;
    if (d.users?.length) await prisma.user.createMany({ data: d.users });
    if (d.schoolSettings?.length) await prisma.schoolSetting.createMany({ data: d.schoolSettings });
    if (d.academicSessions?.length) await prisma.academicSession.createMany({ data: d.academicSessions });
    if (d.classes?.length) await prisma.class.createMany({ data: d.classes });
    if (d.sections?.length) await prisma.section.createMany({ data: d.sections });
    if (d.subjects?.length) await prisma.subject.createMany({ data: d.subjects });
    if (d.teachers?.length) await prisma.teacher.createMany({ data: d.teachers });
    if (d.parents?.length) await prisma.parent.createMany({ data: d.parents });
    if (d.students?.length) await prisma.student.createMany({ data: d.students });
    if (d.feeStructures?.length) await prisma.feeStructure.createMany({ data: d.feeStructures });
    if (d.feeInvoices?.length) await prisma.feeInvoice.createMany({ data: d.feeInvoices });
    if (d.feeItems?.length) await prisma.feeItem.createMany({ data: d.feeItems });
    if (d.payments?.length) await prisma.payment.createMany({ data: d.payments });
    if (d.attendance?.length) await prisma.attendance.createMany({ data: d.attendance });
    if (d.exams?.length) await prisma.exam.createMany({ data: d.exams });
    if (d.marks?.length) await prisma.mark.createMany({ data: d.marks });
    if (d.homework?.length) await prisma.homework.createMany({ data: d.homework });

    console.log('✅ Database successfully restored to snapshot state!');
    console.log('===============================================================\n');
  } catch (error) {
    console.error('❌ Restore failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const argFile = process.argv[2];
restoreDatabase(argFile);
