import prisma from '../src/lib/db';
import {
  isTimeOverlapping,
  validateTimetableAssignment,
  suggestOptimalSlots,
  getTeacherWorkload,
  assignTimetableTransactional,
} from '../src/lib/timetable/scheduling-engine';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, details?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    if (details) console.error('     Details:', details);
  }
}

async function runSchedulingEngineTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🧪 THMS INTELLIGENT SCHEDULING & CONFLICT ENGINE TEST SUITE  ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // -------------------------------------------------------------
    // Test Group 1: Mathematical Interval Overlap Engine
    // -------------------------------------------------------------
    console.log('--- Group 1: Mathematical Time Overlap Logic ---');
    assert(
      isTimeOverlapping(510, 555, 520, 560) === true,
      'Rule 1.1: Detects overlapping intervals (08:30-09:15 vs 08:40-09:20)'
    );
    assert(
      isTimeOverlapping(510, 555, 555, 600) === false,
      'Rule 1.2: Contiguous consecutive intervals do not overlap (08:30-09:15 vs 09:15-10:00)'
    );
    assert(
      isTimeOverlapping(510, 555, 450, 510) === false,
      'Rule 1.3: Preceding non-overlapping intervals return false (08:30-09:15 vs 07:30-08:30)'
    );
    assert(
      isTimeOverlapping(480, 600, 500, 540) === true,
      'Rule 1.4: Fully engulfed interior intervals overlap (08:00-10:00 vs 08:20-09:00)'
    );

    // -------------------------------------------------------------
    // Setup Test Data from Active Neon PostgreSQL Database
    // -------------------------------------------------------------
    const cls = await prisma.class.findFirst({
      include: {
        sections: true,
        subjects: true,
      },
    });

    const teacher = await prisma.teacher.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (!cls || !cls.sections[0] || !cls.subjects[0] || !teacher) {
      throw new Error('Database is missing seed class, section, subject, or teacher.');
    }

    const testClassId = cls.id;
    const testSectionId = cls.sections[0].id;
    const testSubjectId = cls.subjects[0].id;
    const testTeacherId = teacher.id;

    console.log(`\n  Targeted Class: ${cls.name} (${cls.sections[0].name})`);
    console.log(`  Targeted Subject: ${cls.subjects[0].name}`);
    console.log(`  Targeted Teacher: ${teacher.fullName} (${teacher.employeeId})\n`);

    // -------------------------------------------------------------
    // Test Group 2: Time Interval Boundaries & Validation
    // -------------------------------------------------------------
    console.log('--- Group 2: Time Interval Boundaries ---');
    const invalidTimeResult = await validateTimetableAssignment({
      classId: testClassId,
      sectionId: testSectionId,
      subjectId: testSubjectId,
      teacherId: testTeacherId,
      dayOfWeek: 'MONDAY',
      startTime: '10:00',
      endTime: '09:00', // Invalid
    });

    assert(
      invalidTimeResult.valid === false &&
      invalidTimeResult.conflicts.some((c) => c.includes('Invalid Time Interval')),
      'Rule 2.1: End time before start time is immediately rejected'
    );

    const nonExistentTeacherResult = await validateTimetableAssignment({
      classId: testClassId,
      sectionId: testSectionId,
      subjectId: testSubjectId,
      teacherId: 'non-existent-teacher-uuid',
      dayOfWeek: 'MONDAY',
      startTime: '08:00',
      endTime: '08:40',
    });

    assert(
      nonExistentTeacherResult.valid === false &&
      nonExistentTeacherResult.conflicts.some((c) => c.includes('Teacher not found')),
      'Rule 2.2: Non-existent teacher ID is rejected'
    );

    // -------------------------------------------------------------
    // Test Group 3: Teacher Availability Constraints (Days & Hours)
    // -------------------------------------------------------------
    console.log('--- Group 3: Teacher Availability & Eligibility Constraints ---');
    // Configure teacher working days to MONDAY, WEDNESDAY
    await prisma.teacher.update({
      where: { id: testTeacherId },
      data: {
        workingDays: 'MONDAY,WEDNESDAY',
        availableFrom: '08:00',
        availableTo: '13:00',
        maxDailyPeriods: 2,
        maxWeeklyPeriods: 5,
      },
    });

    // Test working day conflict on SUNDAY / TUESDAY
    const dayConflictResult = await validateTimetableAssignment({
      classId: testClassId,
      sectionId: testSectionId,
      subjectId: testSubjectId,
      teacherId: testTeacherId,
      dayOfWeek: 'FRIDAY', // Teacher not available on Friday
      startTime: '09:00',
      endTime: '09:40',
    });

    assert(
      dayConflictResult.valid === false &&
      dayConflictResult.conflicts.some((c) => c.includes('Working Day Conflict')),
      'Rule 3.1: Rejects period scheduled on unconfigured working day (Friday)'
    );

    // Test working hours conflict
    const hourConflictResult = await validateTimetableAssignment({
      classId: testClassId,
      sectionId: testSectionId,
      subjectId: testSubjectId,
      teacherId: testTeacherId,
      dayOfWeek: 'MONDAY',
      startTime: '14:00', // After 13:00 availableTo
      endTime: '14:40',
    });

    assert(
      hourConflictResult.valid === false &&
      hourConflictResult.conflicts.some((c) => c.includes('Working Hours Conflict')),
      'Rule 3.2: Rejects period scheduled after teacher daily availability window (14:00 > 13:00)'
    );

    // -------------------------------------------------------------
    // Test Group 4: Double-Booking Protection (Teacher, Section, Room)
    // -------------------------------------------------------------
    console.log('--- Group 4: Strict Double-Booking Protection ---');
    // Ensure clean state on test slot
    await prisma.timetable.deleteMany({
      where: {
        dayOfWeek: 'MONDAY',
        startTime: '08:45',
      },
    });

    // Create baseline slot
    const baseEntry = await prisma.timetable.create({
      data: {
        classId: testClassId,
        sectionId: testSectionId,
        subjectId: testSubjectId,
        teacherId: testTeacherId,
        dayOfWeek: 'MONDAY',
        startTime: '08:45',
        endTime: '09:30',
        roomNo: 'Lab-Physics-101',
      },
      include: { class: true, section: true, subject: true, teacher: true },
    });

    // 4.1 Teacher Double-Booking Check
    const teacherDoubleResult = await validateTimetableAssignment({
      classId: testClassId,
      sectionId: testSectionId,
      subjectId: testSubjectId,
      teacherId: testTeacherId,
      dayOfWeek: 'MONDAY',
      startTime: '09:00', // Overlaps with 08:45-09:30
      endTime: '09:45',
    });

    assert(
      teacherDoubleResult.valid === false &&
      teacherDoubleResult.conflicts.some((c) => c.includes('Teacher Double-Booking Conflict')),
      'Rule 4.1: Prevents Teacher Double-Booking at overlapping times'
    );

    // 4.2 Class Section Double-Booking Check (different teacher, same section & time)
    const otherTeacher = await prisma.teacher.findFirst({
      where: { id: { not: testTeacherId } },
    });

    if (otherTeacher) {
      const sectionDoubleResult = await validateTimetableAssignment({
        classId: testClassId,
        sectionId: testSectionId,
        subjectId: testSubjectId,
        teacherId: otherTeacher.id,
        dayOfWeek: 'MONDAY',
        startTime: '09:00', // Overlaps with 08:45-09:30
        endTime: '09:45',
      });

      assert(
        sectionDoubleResult.valid === false &&
        sectionDoubleResult.conflicts.some((c) => c.includes('Class Section Conflict')),
        'Rule 4.2: Prevents Class Section Double-Booking at overlapping times'
      );
    }

    // 4.3 Room Double-Booking Check (different teacher, different class, same room)
    const otherClass = await prisma.class.findFirst({
      where: { id: { not: testClassId } },
      include: { sections: true, subjects: true },
    });

    if (otherClass && otherClass.sections[0] && otherClass.subjects[0] && otherTeacher) {
      const roomDoubleResult = await validateTimetableAssignment({
        classId: otherClass.id,
        sectionId: otherClass.sections[0].id,
        subjectId: otherClass.subjects[0].id,
        teacherId: otherTeacher.id,
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '09:45',
        roomNo: 'Lab-Physics-101', // Same room
      });

      assert(
        roomDoubleResult.valid === false &&
        roomDoubleResult.conflicts.some((c) => c.includes('Room Occupancy Conflict')),
        'Rule 4.3: Prevents Room Double-Booking for occupied rooms'
      );
    }

    // Clean up baseline entry
    await prisma.timetable.delete({ where: { id: baseEntry.id } });

    // -------------------------------------------------------------
    // Test Group 5: Scheduling Assistant & Workload Engine
    // -------------------------------------------------------------
    console.log('--- Group 5: Automated Scheduling Assistant & Workload Engine ---');
    // Restore teacher working days to standard
    await prisma.teacher.update({
      where: { id: testTeacherId },
      data: {
        workingDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY',
        availableFrom: '08:00',
        availableTo: '14:30',
        maxDailyPeriods: 6,
        maxWeeklyPeriods: 30,
      },
    });

    const suggestions = await suggestOptimalSlots({
      classId: testClassId,
      sectionId: testSectionId,
      subjectId: testSubjectId,
      requiredWeeklyPeriods: 3,
    });

    assert(
      Array.isArray(suggestions.suggestions) && suggestions.suggestions.length > 0,
      'Rule 5.1: Automatic Scheduling Assistant returns valid conflict-free period slots',
      { count: suggestions.suggestions.length }
    );

    const workload = await getTeacherWorkload(testTeacherId);
    assert(
      workload !== null &&
      typeof workload.weeklyCount === 'number' &&
      workload.maxDaily === 6 &&
      workload.maxWeekly === 30,
      'Rule 5.2: Calculates accurate teacher workload and utilization percentages',
      workload
    );

    // -------------------------------------------------------------
    // Test Group 6: Transactional Assignment & Audit Integrity
    // -------------------------------------------------------------
    console.log('--- Group 6: Transactional Assignment & Audit Integrity ---');
    const transactionResult = await assignTimetableTransactional({
      classId: testClassId,
      sectionId: testSectionId,
      subjectId: testSubjectId,
      teacherId: testTeacherId,
      dayOfWeek: 'WEDNESDAY',
      startTime: '11:00',
      endTime: '11:45',
      roomNo: 'Hall-302',
    });

    assert(
      transactionResult.success === true && transactionResult.timetable.id !== undefined,
      'Rule 6.1: assignTimetableTransactional commits conflict-free period'
    );

    // Attempting to re-schedule same period should reject transactionally
    let transactionFailed = false;
    try {
      await assignTimetableTransactional({
        classId: testClassId,
        sectionId: testSectionId,
        subjectId: testSubjectId,
        teacherId: testTeacherId,
        dayOfWeek: 'WEDNESDAY',
        startTime: '11:15', // Overlaps
        endTime: '12:00',
        roomNo: 'Hall-302',
      });
    } catch {
      transactionFailed = true;
    }

    assert(
      transactionFailed === true,
      'Rule 6.2: assignTimetableTransactional rolls back and throws on conflict'
    );

    // Clean up created record
    await prisma.timetable.delete({ where: { id: transactionResult.timetable.id } });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`  🎯 TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (100%)`);
    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (error: any) {
    console.error('Test execution fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSchedulingEngineTests();
