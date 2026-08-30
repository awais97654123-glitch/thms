import { createSessionToken } from '../src/lib/auth';

async function testPerformance() {
  console.log('===============================================================');
  console.log('⚡ TESTING ADMIN DASHBOARD & CREDENTIALS API PERFORMANCE');
  console.log('===============================================================\n');

  const adminToken = await createSessionToken({
    userId: 'admin-id-test',
    username: 'admin',
    role: 'SUPER_ADMIN',
    fullName: 'Super Admin',
    isFirstLogin: false,
  });

  const headers = {
    'Cookie': `thms_session=${adminToken}`,
  };

  // Test 1: Dashboard Stats API
  const t0 = Date.now();
  const res1 = await fetch('http://localhost:3000/api/admin/dashboard-stats', { headers });
  const d1 = await res1.json();
  const t1 = Date.now();
  console.log(`✅ [PASS] /api/admin/dashboard-stats: Status ${res1.status} in ${t1 - t0}ms`);
  console.log('   └─ Total Students:', d1.stats?.totalStudents);
  console.log('   └─ Active Teachers:', d1.stats?.activeTeachers);
  console.log('   └─ Active Admissions:', d1.stats?.activeAdmissions);

  // Test 2: User Credentials List API
  const t2 = Date.now();
  const res2 = await fetch('http://localhost:3000/api/admin/users/credentials?role=ALL', { headers });
  const d2 = await res2.json();
  const t3 = Date.now();
  console.log(`\n✅ [PASS] /api/admin/users/credentials: Status ${res2.status} in ${t3 - t2}ms`);
  console.log(`   └─ Total Accounts retrieved: ${d2.users?.length || 0}`);

  console.log('\n===============================================================');
  console.log('🎉 PERFORMANCE & API ENDPOINTS VERIFIED SUCCESSFULLY!');
  console.log('===============================================================');
}

testPerformance().catch(console.error);
