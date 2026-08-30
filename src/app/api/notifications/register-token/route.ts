import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { notificationService } from '@/lib/firebase/notification-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fcmToken, userId, devicePlatform, userAgent } = body;

    if (!fcmToken) {
      return NextResponse.json({ error: 'fcmToken is required' }, { status: 400 });
    }

    const result = await notificationService.registerDeviceToken({
      fcmToken,
      userId,
      devicePlatform: devicePlatform || 'WEB',
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'FCM Device Token registered successfully',
      id: result.id,
    });
  } catch (err: any) {
    console.error('Error registering FCM token:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
