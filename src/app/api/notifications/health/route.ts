import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  let fcmHealthy = false;
  let fcmError: string | undefined;

  try {
    const adminApp = getFirebaseAdmin();
    fcmHealthy = Boolean(adminApp);
  } catch (err: any) {
    fcmError = err.message;
  }

  let totalDevices = 0;
  let activeWebDevices = 0;
  let activeMobileDevices = 0;

  try {
    const [total, web, mobile] = await Promise.all([
      prisma.devicePushToken.count({ where: { isActive: true } }),
      prisma.devicePushToken.count({ where: { isActive: true, devicePlatform: 'WEB' } }),
      prisma.devicePushToken.count({
        where: { isActive: true, devicePlatform: { in: ['ANDROID', 'IOS'] } },
      }),
    ]);
    totalDevices = total;
    activeWebDevices = web;
    activeMobileDevices = mobile;
  } catch (dbErr: any) {
    console.warn('Could not query push tokens:', dbErr.message);
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startTime,
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID || 'thms-8273f',
      isHealthy: fcmHealthy,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'Configured',
      hasVapidKey: Boolean(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY),
      error: fcmError,
    },
    deviceRegistry: {
      totalActiveDevices: totalDevices,
      webBrowsers: activeWebDevices,
      mobileApps: activeMobileDevices,
    },
  });
}
