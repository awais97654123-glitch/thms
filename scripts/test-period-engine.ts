import prisma from '../src/lib/db';
import {
  getSchoolCurrentTime,
  parseTimeToMinutes,
  evaluatePeriodStatus,
  getActiveSchoolClosure,
  getStudentLiveSchedule,
  getTeacherLiveSchedule,
} from '../src/lib/timetable/period-engine';
import { logAuditEvent } from '../src/lib/audit';

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 3000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (i < retries - 1) {
        console.log(`   ⏳ Cold start/connection delay. Retrying in ${delay / 1000}s (Attempt ${i + 2}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

async function runPeriodEngineWorkflowTests() {
  console.log('\n===============================================================');
  console.log('🏛️  THE HAYATABAD MODEL SCHOOL — LIVE PERIOD ENGINE TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (detail) console.log(`   └─ ${detail}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error(`   └─ ${detail}`);
      throw new Error(`Assertion failed for: ${testName}`);
    }
  }

  try {
    // ----------------------------------------------------------------
    // 1. TIMEZONE & TIME ENGINE UNIT TESTS
    // ----------------------------------------------------------------
    console.log('🔹 TEST 1: School Timezone & Time Parsing Engine (Asia/Karachi)');
    const schoolTime = getSchoolCurrentTime();
    assert(!!schoolTime.dateString, 'Current school date formatted', `Date: ${schoolTime.dateString}`);
    assert(!!schoolTime.timeString, 'Current school time formatted', `Time: ${schoolTime.timeString}`);
    assert(!!schoolTime.dayOfWeek, 'Current day of week identified', `Day: ${schoolTime.dayOfWeek}`);

    const morningMin = parseTimeToMinutes('08:30');
    assert(morningMin === 8 * 60 + 30, 'Parse 24-hr morning time', `08:30 = ${morningMin} min`);

    const afternoonMin = parseTimeToMinutes('02:15 PM');
    assert(afternoonMin === 14 * 60 + 15, 'Parse 12-hr PM time', `02:15 PM = ${afternoonMin} min`);

    // ----------------------------------------------------------------
    // 2. PERIOD STATUS RESOLUTION UNIT TESTS
    // ----------------------------------------------------------------
    console.log('\n🔹 TEST 2: Single Period Status Resolution Engine');
    
    // Upcoming
    const upcoming = evaluatePeriodStatus({
      startTime: '10:00',
      endTime: '10:45',
      currentMinutes: 9 * 60, // 09:00 AM
    });
    assert(upcoming.status === 'UPCOMING', 'Upcoming period detected', `Status: ${upcoming.status}, Starts in: ${upcoming.minutesUntilStart}m`);

    // Active
    const active = evaluatePeriodStatus({
      startTime: '10:00',
      endTime: '10:45',
      currentMinutes: 10 * 60 + 20, // 10:20 AM
    });
    assert(active.status === 'ACTIVE', 'Active in-progress period detected', `Status: ${active.status}, Remaining: ${active.minutesRemaining}m`);

    // Completed
    const completed = evaluatePeriodStatus({
      startTime: '10:00',
      endTime: '10:45',
      currentMinutes: 11 * 60, // 11:00 AM
    });
    assert(completed.status === 'COMPLETED', 'Completed period detected', `Status: ${completed.status}`);

    // Cancelled overrides timeslot
    const cancelled = evaluatePeriodStatus({
      startTime: '10:00',
      endTime: '10:45',
      currentMinutes: 10 * 60 + 20,
      cancellation: {
        id: 'test-canc-1',
        reason: 'Faculty Emergency',
        cancelledAt: new Date(),
      },
    });
    assert(cancelled.status === 'CANCELLED', 'Cancelled status overrides active timeslot', `Reason: ${cancelled.cancellationReason}`);

    // Substitute overrides normal teacher
    const substituted = evaluatePeriodStatus({
      startTime: '10:00',
      endTime: '10:45',
      currentMinutes: 10 * 60 + 20,
      substitute: {
        id: 'test-sub-1',
        substituteTeacher: { fullName: 'Ms. Sara Khan', employeeId: 'EMP-T-0205' },
        reason: 'Medical Leave',
      },
    });
    assert(substituted.status === 'ACTIVE', 'Substitute period active during timeslot');
    assert(substituted.substituteTeacherName === 'Ms. Sara Khan', 'Substitute teacher name attached', `Sub: ${substituted.substituteTeacherName}`);

    // School closure overrides all
    const closed = evaluatePeriodStatus({
      startTime: '10:00',
      endTime: '10:45',
      currentMinutes: 10 * 60 + 20,
      activeClosure: {
        title: 'Emergency Flood Alert',
        reason: 'Government declared red alert',
        isEmergency: true,
      },
    });
    assert(closed.status === 'SCHOOL_CLOSED', 'Emergency school closure overrides all states', `Label: ${closed.label}`);

    // ----------------------------------------------------------------
    // 3. DATABASE WORKFLOW: CLASS PERIOD CANCELLATION & AUDIT LOG
    // ----------------------------------------------------------------
    console.log('\n🔹 TEST 3: Database Period Cancellation Workflow');

    let timetable = await withRetry(() =>
      prisma.timetable.findFirst({
        include: { class: true, section: true, subject: true, teacher: true },
      })
    );

    if (!timetable) {
      console.log('   Creating sample timetable record for testing...');
      const cls = await withRetry(() => prisma.class.findFirst({ include: { sections: true, subjects: true } }));
      const teacher = await withRetry(() => prisma.teacher.findFirst());

      if (cls && cls.sections[0] && cls.subjects[0] && teacher) {
        timetable = await withRetry(() =>
          prisma.timetable.create({
            data: {
              classId: cls.id,
              sectionId: cls.sections[0].id,
              subjectId: cls.subjects[0].id,
              teacherId: teacher.id,
              dayOfWeek: 'MONDAY',
              startTime: '09:00',
              endTime: '09:45',
              roomNo: 'Room 101',
            },
            include: { class: true, section: true, subject: true, teacher: true },
          })
        );
      }
    }

    assert(!!timetable, 'Timetable item available for cancellation test', `Subject: ${timetable?.subject.name}`);

    if (timetable) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find an admin or teacher user
      const adminUser = await withRetry(() =>
        prisma.user.findFirst({
          where: { role: { in: ['ADMIN', 'SUPER_ADMIN', 'TEACHER'] } },
        })
      );

      if (adminUser) {
        // Record cancellation
        const cancellation = await withRetry(() =>
          prisma.periodCancellation.upsert({
            where: {
              timetableId_date: {
                timetableId: timetable!.id,
                date: today,
              },
            },
            update: {
              reason: 'Automated Integration Test Cancellation',
              status: 'CANCELLED',
              cancelledById: adminUser.id,
            },
            create: {
              timetableId: timetable!.id,
              date: today,
              reason: 'Automated Integration Test Cancellation',
              status: 'CANCELLED',
              cancelledById: adminUser.id,
            },
          })
        );

        assert(!!cancellation.id, 'PeriodCancellation DB record upserted', `Cancellation ID: ${cancellation.id}`);

        // Verify status reflects in evaluatePeriodStatus
        const statusAfterCanc = evaluatePeriodStatus({
          startTime: timetable.startTime,
          endTime: timetable.endTime,
          currentMinutes: parseTimeToMinutes(timetable.startTime) + 10,
          cancellation,
        });

        assert(statusAfterCanc.status === 'CANCELLED', 'Status evaluates to CANCELLED in real-time engine');
        assert(statusAfterCanc.cancellationReason === 'Automated Integration Test Cancellation', 'Cancellation reason matches');

        // Audit log creation
        await logAuditEvent({
          userId: adminUser.id,
          userName: adminUser.username,
          role: adminUser.role,
          action: 'CLASS_PERIOD_CANCELLED',
          entity: 'Timetable',
          entityId: timetable.id,
          details: JSON.stringify({ reason: cancellation.reason, date: today }),
        });

        const logged = await withRetry(() =>
          prisma.auditLog.findFirst({
            where: { action: 'CLASS_PERIOD_CANCELLED', entityId: timetable!.id },
            orderBy: { createdAt: 'desc' },
          })
        );

        assert(!!logged, 'Audit log created for class period cancellation', `Audit Log ID: ${logged?.id}`);
      }
    }

    // ----------------------------------------------------------------
    // 4. DATABASE WORKFLOW: SUBSTITUTE TEACHER ALLOCATION
    // ----------------------------------------------------------------
    console.log('\n🔹 TEST 4: Substitute Teacher Allocation Workflow');

    const teachers = await withRetry(() => prisma.teacher.findMany({ take: 2 }));
    if (teachers.length >= 2 && timetable) {
      const origTeacher = teachers[0];
      const subTeacher = teachers[1];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const adminUser = await withRetry(() =>
        prisma.user.findFirst({
          where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        })
      );

      await withRetry(() =>
        prisma.substituteAssignment.deleteMany({
          where: {
            timetableId: timetable!.id,
            date: today,
          },
        })
      );

      const subAssign = await withRetry(() =>
        prisma.substituteAssignment.create({
          data: {
            timetableId: timetable!.id,
            date: today,
            originalTeacherId: origTeacher.id,
            substituteTeacherId: subTeacher.id,
            assignedById: adminUser?.id || origTeacher.id,
            reason: 'Medical Leave Coverage',
            status: 'ACTIVE',
          },
          include: {
            substituteTeacher: true,
          },
        })
      );

      assert(!!subAssign.id, 'SubstituteAssignment DB record upserted', `Assignment ID: ${subAssign.id}`);

      const statusWithSub = evaluatePeriodStatus({
        startTime: timetable.startTime,
        endTime: timetable.endTime,
        currentMinutes: parseTimeToMinutes(timetable.startTime) + 10,
        substitute: subAssign,
      });

      assert(statusWithSub.substituteTeacherName === subTeacher.fullName, 'Substitute teacher identified in status engine');
    } else {
      console.log('   Substitute test noted (requires 2 registered teachers)');
    }

    // ----------------------------------------------------------------
    // 5. DATABASE WORKFLOW: EMERGENCY SCHOOL CLOSURE
    // ----------------------------------------------------------------
    console.log('\n🔹 TEST 5: School Closure / Emergency Mode Workflow');

    const testClosure = await withRetry(() =>
      prisma.schoolClosure.create({
        data: {
          title: 'Integration Test Emergency Closure',
          reason: 'Heavy Rain Precautionary Closure',
          closureType: 'WEATHER_EMERGENCY',
          startDate: new Date(),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          isEmergency: true,
          targetAudience: 'ALL',
        },
      })
    );

    assert(!!testClosure.id, 'Emergency SchoolClosure created in database', `Title: ${testClosure.title}`);

    const activeClosure = await withRetry(() => getActiveSchoolClosure(new Date()));
    assert(!!activeClosure, 'Active emergency closure detected by timetable engine', `Active: ${activeClosure?.title}`);

    // Clean up test closure
    await withRetry(() => prisma.schoolClosure.delete({ where: { id: testClosure.id } }));
    console.log('   Cleaned up temporary integration test closure.');

    // ----------------------------------------------------------------
    // 6. DATABASE WORKFLOW: HOMEWORK SUBMISSION & GRADING
    // ----------------------------------------------------------------
    console.log('\n🔹 TEST 6: Student Assignment Submission & Faculty Grading');

    const testStudent = await withRetry(() =>
      prisma.student.findFirst({
        include: { user: true, class: true },
      })
    );

    const testHomework = await withRetry(() =>
      prisma.homework.findFirst({
        include: { teacher: true, subject: true },
      })
    );

    if (testStudent && testHomework) {
      // 1. Student submits
      await withRetry(() =>
        prisma.homeworkSubmission.deleteMany({
          where: {
            homeworkId: testHomework.id,
            studentId: testStudent.id,
          },
        })
      );

      const submission = await withRetry(() =>
        prisma.homeworkSubmission.create({
          data: {
            homeworkId: testHomework.id,
            studentId: testStudent.id,
            submissionText: 'Here is my solved homework worksheet response.',
            status: 'SUBMITTED',
          },
        })
      );

      assert(!!submission.id, 'HomeworkSubmission recorded by student', `Status: ${submission.status}`);

      // 2. Teacher grades
      const reviewed = await withRetry(() =>
        prisma.homeworkSubmission.update({
          where: { id: submission.id },
          data: {
            marks: 95,
            feedback: 'Excellent mathematical derivation and clear handwriting.',
            status: 'REVIEWED',
            reviewedAt: new Date(),
          },
        })
      );

      assert(reviewed.status === 'REVIEWED', 'Submission marked as REVIEWED by teacher');
      assert(reviewed.marks === 95, 'Marks recorded correctly (95/100)');
      assert(!!reviewed.feedback, 'Qualitative feedback recorded', `Feedback: "${reviewed.feedback}"`);
    } else {
      console.log('   Homework test skipped (requires student and homework record in active term)');
    }

    console.log('\n===============================================================');
    console.log(`🎉 ALL ${passed}/${total} LIVE PERIOD ENGINE & WORKFLOW TESTS PASSED!`);
    console.log('===============================================================\n');
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPeriodEngineWorkflowTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
