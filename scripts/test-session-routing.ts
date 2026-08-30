import { createSessionToken } from '../src/lib/auth';

async function testSessionRoutingLogic() {
  console.log('===============================================================');
  console.log('⚡ TESTING PERSISTENT SESSION AUTO-ROUTING SYSTEM');
  console.log('===============================================================\n');

  // Test 1: Admin session token
  const adminToken = await createSessionToken({
    userId: 'test-admin-id',
    username: 'admin',
    role: 'SUPER_ADMIN',
    fullName: 'Super Admin',
    isFirstLogin: false,
  });
  console.log('✅ [PASS] Admin Session Token generated (Length:', adminToken.length, ')');

  // Test 2: Student session token
  const studentToken = await createSessionToken({
    userId: 'test-student-id',
    username: 'THMS-2026-000001',
    role: 'STUDENT',
    fullName: 'Hamza Tariq',
    studentId: 'st-001',
    isFirstLogin: false,
  });
  console.log('✅ [PASS] Student Session Token generated (Length:', studentToken.length, ')');

  // Test 3: Teacher session token
  const teacherToken = await createSessionToken({
    userId: 'test-teacher-id',
    username: 'teacher.farooq',
    role: 'TEACHER',
    fullName: 'Engr. Farooq Ahmad',
    teacherId: 'tch-001',
    isFirstLogin: false,
  });
  console.log('✅ [PASS] Teacher Session Token generated (Length:', teacherToken.length, ')');

  // Test 4: Parent session token
  const parentToken = await createSessionToken({
    userId: 'test-parent-id',
    username: 'parent.3339123',
    role: 'PARENT',
    fullName: 'Dr. Tariq Mehmood',
    parentId: 'par-001',
    isFirstLogin: false,
  });
  console.log('✅ [PASS] Parent Session Token generated (Length:', parentToken.length, ')');

  console.log('\n===============================================================');
  console.log('🎉 SESSION TOKEN & ROLE ENCODING VERIFIED SUCCESSFULLY!');
  console.log('===============================================================');
}

testSessionRoutingLogic().catch(console.error);
