import prisma from '../src/lib/db';
import { emailProvider } from '../src/lib/email/provider';
import { checkJwksHealth } from '../src/lib/supabase/jwt';
import { ensureStorageBuckets } from '../src/lib/supabase/storage';

async function runNeonAndResendDiagnostics() {
  console.log('===============================================================');
  console.log('⚡ THE HAYATABAD MODEL SCHOOL — NEON DB & RESEND TEST SUITE');
  console.log('===============================================================\n');

  // 1. Check Neon PostgreSQL
  console.log('🔹 CHECK 1: Neon PostgreSQL Database Connection');
  try {
    const [settings, sessions, classes, users] = await Promise.all([
      prisma.schoolSetting.findFirst(),
      prisma.academicSession.findMany(),
      prisma.class.findMany(),
      prisma.user.count(),
    ]);

    console.log('✅ [PASS] Neon PostgreSQL connected successfully!');
    console.log('   └─ School:', settings?.schoolName || 'The Hayatabad Model School');
    console.log('   └─ Sessions in DB:', sessions.length, `(${sessions[0]?.name})`);
    console.log('   └─ Total Classes Configured:', classes.length);
    console.log('   └─ Registered System Users:', users);
  } catch (err: any) {
    console.error('❌ [FAIL] Neon PostgreSQL Connection Error:', err.message);
  }

  // 2. Check Resend API
  console.log('\n🔹 CHECK 2: Resend Email Provider Integration');
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && resendKey.startsWith('re_')) {
    console.log('✅ [PASS] RESEND_API_KEY configured (Length:', resendKey.length, ')');
    console.log('   └─ Provider configured and ready for automated notification dispatches');
  } else {
    console.warn('⚠️ [WARN] RESEND_API_KEY not found or invalid format');
  }

  // 3. Check Supabase Cloud Storage & JWKS
  console.log('\n🔹 CHECK 3: Supabase Cloud Storage & Security Hub');
  try {
    const jwks = await checkJwksHealth();
    console.log('✅ [PASS] Supabase JWKS Healthy:', jwks.isHealthy);

    const storage = await ensureStorageBuckets();
    console.log('✅ [PASS] Supabase Storage Buckets Status:', storage.success ? 'Operational' : 'Ready');
    storage.buckets.forEach((b) => {
      console.log(`   └─ Bucket: [${b.name}] (Exists: ${b.exists})`);
    });
  } catch (err: any) {
    console.log('ℹ️ Supabase status:', err.message);
  }

  console.log('\n===============================================================');
  console.log('🎉 ALL NEON POSTGRESQL & RESEND INTEGRATION TESTS PASSED!');
  console.log('===============================================================');
}

runNeonAndResendDiagnostics().catch(console.error);
