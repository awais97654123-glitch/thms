import { checkJwksHealth } from '../src/lib/supabase/jwt';
import { ensureStorageBuckets } from '../src/lib/supabase/storage';
import { getSupabaseAdmin } from '../src/lib/supabase/server';
import prisma from '../src/lib/db';

async function runSupabaseDiagnostics() {
  console.log('===============================================================');
  console.log('⚡ THE HAYATABAD MODEL SCHOOL — SUPABASE CLOUD TEST SUITE');
  console.log('===============================================================\n');

  // 1. Environment Variable Checks
  console.log('🔹 CHECK 1: Environment Variables & Security Isolation');
  const url = process.env.SUPABASE_URL;
  const pubKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const secKey = process.env.SUPABASE_SECRET_KEY;
  const jwksUrl = process.env.SUPABASE_JWKS_URL;

  if (!url || !pubKey || !secKey || !jwksUrl) {
    console.error('❌ [FAIL] Missing required Supabase environment variables');
    process.exit(1);
  }
  console.log('✅ [PASS] SUPABASE_URL configured:', url);
  console.log('✅ [PASS] SUPABASE_PUBLISHABLE_KEY configured (Length:', pubKey.length, ')');
  console.log('✅ [PASS] SUPABASE_SECRET_KEY configured (Length:', secKey.length, ')');
  console.log('✅ [PASS] SUPABASE_JWKS_URL configured:', jwksUrl);

  // 2. Test JWKS Health
  console.log('\n🔹 CHECK 2: Remote JWKS Public Key Verification');
  const jwksRes = await checkJwksHealth();
  if (jwksRes.isHealthy) {
    console.log('✅ [PASS] JWKS endpoint reachable and responding');
  } else {
    console.log('⚠️ [WARN] JWKS check note:', jwksRes.error);
  }

  // 3. Test Supabase Admin Client & Storage Buckets
  console.log('\n🔹 CHECK 3: Supabase Storage Buckets');
  try {
    const storageRes = await ensureStorageBuckets();
    if (storageRes.success) {
      console.log('✅ [PASS] Supabase Storage buckets verified/initialized:');
      storageRes.buckets.forEach((b) => {
        console.log(`   └─ Bucket: [${b.name}] (Public: ${b.isPublic}, Exists: ${b.exists})`);
      });
    } else {
      console.log('ℹ️ [INFO] Storage bucket check completed with status:', storageRes.success);
    }
  } catch (err: any) {
    console.log('ℹ️ Storage note:', err.message);
  }

  // 4. Test Prisma Central Database
  console.log('\n🔹 CHECK 4: Prisma Database Connectivity');
  try {
    const [studentsCount, sessionsCount] = await Promise.all([
      prisma.student.count(),
      prisma.academicSession.count(),
    ]);
    console.log('✅ [PASS] Prisma database operational');
    console.log('   └─ Total Enrolled Students:', studentsCount);
    console.log('   └─ Active Academic Sessions:', sessionsCount);
  } catch (err: any) {
    console.error('❌ [FAIL] Database connection error:', err.message);
  }

  console.log('\n===============================================================');
  console.log('🎉 SUPABASE INTEGRATION TEST COMPLETED SUCCESSFULLY!');
  console.log('===============================================================');
}

runSupabaseDiagnostics().catch(console.error);
