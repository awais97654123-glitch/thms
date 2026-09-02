import { PrismaClient } from '@prisma/client';

const poolerUrl = "postgresql://neondb_owner:npg_KbkTGp7hmd6r@ep-falling-cherry-axc1e8cn-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=60&pool_timeout=60&connection_limit=5";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: poolerUrl,
    },
  },
  log: ['error', 'warn'],
});

async function migratePeriodTables() {
  console.log('🚀 Applying real-time period operations schema to Neon PostgreSQL...');

  const sqlStatements = [
    // 1. PeriodCancellation
    `CREATE TABLE IF NOT EXISTS "PeriodCancellation" (
      "id" TEXT NOT NULL,
      "timetableId" TEXT NOT NULL,
      "date" TIMESTAMP(3) NOT NULL,
      "reason" TEXT NOT NULL,
      "cancelledById" TEXT NOT NULL,
      "cancelledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "status" TEXT NOT NULL DEFAULT 'CANCELLED',
      "notificationsSent" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PeriodCancellation_pkey" PRIMARY KEY ("id")
    );`,

    `CREATE UNIQUE INDEX IF NOT EXISTS "PeriodCancellation_timetableId_date_key" ON "PeriodCancellation"("timetableId", "date");`,
    `CREATE INDEX IF NOT EXISTS "PeriodCancellation_date_idx" ON "PeriodCancellation"("date");`,
    `CREATE INDEX IF NOT EXISTS "PeriodCancellation_timetableId_idx" ON "PeriodCancellation"("timetableId");`,
    `CREATE INDEX IF NOT EXISTS "PeriodCancellation_status_idx" ON "PeriodCancellation"("status");`,

    // 2. SubstituteAssignment
    `CREATE TABLE IF NOT EXISTS "SubstituteAssignment" (
      "id" TEXT NOT NULL,
      "timetableId" TEXT NOT NULL,
      "date" TIMESTAMP(3) NOT NULL,
      "originalTeacherId" TEXT NOT NULL,
      "substituteTeacherId" TEXT NOT NULL,
      "assignedById" TEXT NOT NULL,
      "reason" TEXT,
      "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "SubstituteAssignment_pkey" PRIMARY KEY ("id")
    );`,

    `CREATE UNIQUE INDEX IF NOT EXISTS "SubstituteAssignment_timetableId_date_key" ON "SubstituteAssignment"("timetableId", "date");`,
    `CREATE INDEX IF NOT EXISTS "SubstituteAssignment_date_idx" ON "SubstituteAssignment"("date");`,
    `CREATE INDEX IF NOT EXISTS "SubstituteAssignment_substituteTeacherId_idx" ON "SubstituteAssignment"("substituteTeacherId");`,
    `CREATE INDEX IF NOT EXISTS "SubstituteAssignment_originalTeacherId_idx" ON "SubstituteAssignment"("originalTeacherId");`,
    `CREATE INDEX IF NOT EXISTS "SubstituteAssignment_timetableId_idx" ON "SubstituteAssignment"("timetableId");`,

    // 3. SchoolClosure
    `CREATE TABLE IF NOT EXISTS "SchoolClosure" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "reason" TEXT NOT NULL,
      "closureType" TEXT NOT NULL DEFAULT 'FULL_DAY',
      "startDate" TIMESTAMP(3) NOT NULL,
      "endDate" TIMESTAMP(3) NOT NULL,
      "targetAudience" TEXT NOT NULL DEFAULT 'ALL',
      "isEmergency" BOOLEAN NOT NULL DEFAULT false,
      "affectsTimetable" BOOLEAN NOT NULL DEFAULT true,
      "affectsAttendance" BOOLEAN NOT NULL DEFAULT true,
      "createdById" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "SchoolClosure_pkey" PRIMARY KEY ("id")
    );`,

    `CREATE INDEX IF NOT EXISTS "SchoolClosure_startDate_endDate_idx" ON "SchoolClosure"("startDate", "endDate");`,
    `CREATE INDEX IF NOT EXISTS "SchoolClosure_isEmergency_idx" ON "SchoolClosure"("isEmergency");`,
    `CREATE INDEX IF NOT EXISTS "SchoolClosure_closureType_idx" ON "SchoolClosure"("closureType");`,
  ];

  for (const sql of sqlStatements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err: any) {
      console.warn('Notice during SQL execution:', err.message);
    }
  }

  // Foreign keys
  const fkeys = [
    `ALTER TABLE "PeriodCancellation" DROP CONSTRAINT IF EXISTS "PeriodCancellation_timetableId_fkey";`,
    `ALTER TABLE "PeriodCancellation" ADD CONSTRAINT "PeriodCancellation_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "Timetable"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `ALTER TABLE "PeriodCancellation" DROP CONSTRAINT IF EXISTS "PeriodCancellation_cancelledById_fkey";`,
    `ALTER TABLE "PeriodCancellation" ADD CONSTRAINT "PeriodCancellation_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `ALTER TABLE "SubstituteAssignment" DROP CONSTRAINT IF EXISTS "SubstituteAssignment_timetableId_fkey";`,
    `ALTER TABLE "SubstituteAssignment" ADD CONSTRAINT "SubstituteAssignment_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "Timetable"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `ALTER TABLE "SubstituteAssignment" DROP CONSTRAINT IF EXISTS "SubstituteAssignment_originalTeacherId_fkey";`,
    `ALTER TABLE "SubstituteAssignment" ADD CONSTRAINT "SubstituteAssignment_originalTeacherId_fkey" FOREIGN KEY ("originalTeacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `ALTER TABLE "SubstituteAssignment" DROP CONSTRAINT IF EXISTS "SubstituteAssignment_substituteTeacherId_fkey";`,
    `ALTER TABLE "SubstituteAssignment" ADD CONSTRAINT "SubstituteAssignment_substituteTeacherId_fkey" FOREIGN KEY ("substituteTeacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
  ];

  for (const fk of fkeys) {
    try {
      await prisma.$executeRawUnsafe(fk);
    } catch (err: any) {
      console.warn('Foreign key notice:', err.message);
    }
  }

  console.log('✅ Successfully applied real-time period tables to Neon PostgreSQL!');
}

migratePeriodTables()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
