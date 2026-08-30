import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { ensureStorageBuckets } from '@/lib/supabase/storage';
import { checkJwksHealth } from '@/lib/supabase/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const hasSecretKey = Boolean(process.env.SUPABASE_SECRET_KEY);
  const hasPublishableKey = Boolean(process.env.SUPABASE_PUBLISHABLE_KEY);

  let restApiHealth = false;
  let restApiLatencyMs = 0;
  let restApiError: string | undefined;

  // 1. Check Supabase REST / Auth Health
  try {
    const t0 = Date.now();
    const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: {
        apikey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
      },
      cache: 'no-store',
    });
    restApiLatencyMs = Date.now() - t0;
    if (res.ok) {
      restApiHealth = true;
    } else {
      restApiError = `Supabase API returned HTTP ${res.status}`;
    }
  } catch (err: any) {
    restApiError = err.message;
  }

  // 2. Check JWKS Endpoint
  const jwksCheck = await checkJwksHealth();

  // 3. Check Storage Buckets
  let storageCheck = { success: false, buckets: [] as any[] };
  if (hasSecretKey) {
    storageCheck = await ensureStorageBuckets();
  }

  // 4. Check Prisma Database
  let dbHealthy = false;
  let dbCount = 0;
  try {
    const [stCount, sessCount] = await Promise.all([
      prisma.student.count(),
      prisma.academicSession.count(),
    ]);
    dbCount = stCount;
    dbHealthy = true;
  } catch (dbErr: any) {
    console.error('Prisma check error:', dbErr.message);
  }

  const totalTimeMs = Date.now() - startTime;
  const overallConnected = restApiHealth || jwksCheck.isHealthy;

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    totalLatencyMs: totalTimeMs,
    overallStatus: overallConnected ? 'CONNECTED' : 'DISCONNECTED',
    supabase: {
      url: supabaseUrl,
      hasPublishableKey,
      hasSecretKey,
      restApi: {
        isHealthy: restApiHealth,
        latencyMs: restApiLatencyMs,
        error: restApiError,
      },
      jwks: {
        isHealthy: jwksCheck.isHealthy,
        url: jwksCheck.jwksUrl,
        error: jwksCheck.error,
      },
      storage: {
        isHealthy: storageCheck.success,
        buckets: storageCheck.buckets,
      },
    },
    database: {
      isHealthy: dbHealthy,
      activeStudentsCount: dbCount,
      provider: 'Prisma ORM',
    },
  });
}
