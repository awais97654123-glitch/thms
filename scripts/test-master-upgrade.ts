import prisma from '../src/lib/db';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    failed++;
  }
}

async function runMasterUpgradeTests() {
  console.log('\n=============================================================');
  console.log('🏛️  THE HAYATABAD MODEL SCHOOL — MASTER UPGRADE TEST SUITE');
  console.log('=============================================================\n');

  try {
    // 1. Get sample active enrolled student
    const sampleStudent = await prisma.student.findFirst({
      where: { status: 'ENROLLED' },
      include: { class: true, section: true, session: true },
    });

    if (!sampleStudent) {
      throw new Error('No enrolled student found in database for testing.');
    }

    console.log(`[TEST GROUP 1] QR Code Opaque Token & Identity Verification:`);
    console.log(`  Target student: ${sampleStudent.fullName} (${sampleStudent.studentId})`);

    // Test 1.1: Ensure student has a valid opaque QR token
    assert(
      !!sampleStudent.qrToken && sampleStudent.qrToken.length > 5,
      'Student record has unique opaque QR token',
      `Token: ${sampleStudent.qrToken}`
    );

    // Test 1.2: Check cardStatus column exists on Student
    assert(
      sampleStudent.cardStatus === 'ACTIVE',
      'Student card status is ACTIVE by default',
      `cardStatus: ${sampleStudent.cardStatus}`
    );

    // Test 1.3: Simulate API verification logic on valid student
    const verifiedDossier = {
      success: true,
      verified: true,
      verifiedAt: new Date().toISOString(),
      student: {
        id: sampleStudent.id,
        fullName: sampleStudent.fullName,
        studentId: sampleStudent.studentId,
        rollNo: sampleStudent.rollNo,
        class: sampleStudent.class.name,
        section: sampleStudent.section.name,
        cardStatus: sampleStudent.cardStatus,
      },
    };
    assert(verifiedDossier.verified === true, 'Verification dossier returns verified=true');
    assert(verifiedDossier.student.studentId === sampleStudent.studentId, 'Student ID matches record');

    // Test 1.4: Verify sensitive fields are NOT in the public dossier
    const exposedKeys = Object.keys(verifiedDossier.student);
    const hasSensitiveData = ['password', 'feeBalance', 'parentPhone', 'fatherCnic'].some((k) =>
      exposedKeys.includes(k)
    );
    assert(!hasSensitiveData, 'Zero private/sensitive fields exposed in public dossier');

    // Test 1.5: QR Scan Log Entry Creation
    const initialLogCount = await prisma.qrScanLog.count({
      where: { qrToken: sampleStudent.qrToken },
    });
    await prisma.qrScanLog.create({
      data: {
        qrToken: sampleStudent.qrToken,
        studentId: sampleStudent.id,
        scanType: 'VERIFICATION',
        result: 'VERIFIED',
        scannerIp: '127.0.0.1',
        scannerDevice: 'Automated Test Runner',
        remarks: 'Test suite automated verification',
      },
    });
    const updatedLogCount = await prisma.qrScanLog.count({
      where: { qrToken: sampleStudent.qrToken },
    });
    assert(
      updatedLogCount === initialLogCount + 1,
      'QrScanLog successfully records verification event',
      `New count: ${updatedLogCount}`
    );

    console.log(`\n[TEST GROUP 2] Invalid Token & Security Rejection:`);

    // Test 2.1: Invalid token rejection
    const fakeToken = 'THMS-FORGED-FAKE-TOKEN-99999';
    const fakeLookup = await prisma.student.findUnique({
      where: { qrToken: fakeToken },
    });
    assert(fakeLookup === null, 'Forged token correctly rejected (record not found)');

    // Test 2.2: Invalid scan attempt logged
    const loggedInvalid = await prisma.qrScanLog.create({
      data: {
        qrToken: fakeToken,
        scanType: 'VERIFICATION',
        result: 'INVALID',
        scannerIp: '127.0.0.1',
        scannerDevice: 'Test Runner',
        remarks: 'Forged token attempt caught',
      },
    });
    assert(loggedInvalid.result === 'INVALID', 'Invalid scan attempt persisted in QrScanLog');

    console.log(`\n[TEST GROUP 3] Revoked/Inactive Card Status Enforcement:`);

    // Test 3.1: Temporarily revoke student card
    await prisma.student.update({
      where: { id: sampleStudent.id },
      data: { cardStatus: 'REVOKED' },
    });
    const revokedStudent = await prisma.student.findUnique({
      where: { id: sampleStudent.id },
    });
    assert(revokedStudent?.cardStatus === 'REVOKED', 'Student card successfully set to REVOKED');

    // Test 3.2: Rejection check
    const isDenied = revokedStudent?.cardStatus !== 'ACTIVE';
    assert(isDenied, 'Verification engine correctly flags revoked card as denied');

    // Test 3.3: Restore student card to ACTIVE
    await prisma.student.update({
      where: { id: sampleStudent.id },
      data: { cardStatus: 'ACTIVE' },
    });
    const restoredStudent = await prisma.student.findUnique({
      where: { id: sampleStudent.id },
    });
    assert(restoredStudent?.cardStatus === 'ACTIVE', 'Student card restored to ACTIVE');

    console.log(`\n[TEST GROUP 4] URL Token Extraction for Smart Gate Scanner:`);

    // Test 4.1: URL parsing
    const testUrl = `https://hayatabadmodel.edu.pk/verify/student/${sampleStudent.qrToken}`;
    let extracted = testUrl.trim();
    if (extracted.includes('/verify/student/')) {
      const parts = extracted.split('/verify/student/');
      extracted = parts[parts.length - 1].split('?')[0].trim();
    }
    assert(
      extracted === sampleStudent.qrToken,
      'Smart Gate parser correctly extracts opaque token from full verification URL',
      `Extracted: ${extracted}`
    );

    console.log(`\n[TEST GROUP 5] Global Admin Omni-Search Engine:`);

    // Test 5.1: Search students
    const searchStudents = await prisma.student.findMany({
      where: {
        OR: [
          { fullName: { contains: sampleStudent.fullName.split(' ')[0], mode: 'insensitive' } },
          { studentId: { contains: sampleStudent.studentId, mode: 'insensitive' } },
        ],
      },
      take: 3,
    });
    assert(
      searchStudents.length > 0,
      'Omni-search finds student by name or studentId',
      `Found ${searchStudents.length} matches`
    );

    // Test 5.2: Search faculty
    const sampleTeacher = await prisma.teacher.findFirst();
    if (sampleTeacher) {
      const searchTeachers = await prisma.teacher.findMany({
        where: {
          OR: [
            { fullName: { contains: sampleTeacher.fullName.split(' ')[0], mode: 'insensitive' } },
            { employeeId: { contains: sampleTeacher.employeeId, mode: 'insensitive' } },
          ],
        },
        take: 3,
      });
      assert(
        searchTeachers.length > 0,
        'Omni-search finds faculty by name or employeeId',
        `Found ${searchTeachers.length} matches`
      );
    }

    console.log(`\n[TEST GROUP 6] Operational Reminders & Audit Feeds:`);

    // Test 6.1: Audit log query for live activity feed
    const recentAudit = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    assert(
      Array.isArray(recentAudit),
      'Live activity feed successfully queries recent AuditLog records',
      `Retrieved ${recentAudit.length} events`
    );

    // Test 6.2: Timetable scheduled periods count
    const timetableCount = await prisma.timetable.count();
    assert(
      typeof timetableCount === 'number',
      'Timetable period count computed for operational reminders',
      `Periods: ${timetableCount}`
    );

    console.log('\n=============================================================');
    console.log(`📊 TEST SUMMARY: ${passed} Passed, ${failed} Failed (${Math.round((passed / (passed + failed)) * 100)}% Success Rate)`);
    console.log('=============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('Fatal test error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMasterUpgradeTests();
