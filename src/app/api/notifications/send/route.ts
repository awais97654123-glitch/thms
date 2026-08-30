import { NextRequest, NextResponse } from 'next/server';
import { notificationService, PushNotificationPayload } from '@/lib/firebase/notification-service';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetType, targetId, title, body: contentBody, link, category, data } = body;

    if (!title || !contentBody) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const payload: PushNotificationPayload = {
      title,
      body: contentBody,
      link: link || '/',
      category: category || 'GENERAL',
      data,
    };

    let result;
    switch (targetType) {
      case 'USER':
        if (!targetId) return NextResponse.json({ error: 'targetId is required for USER' }, { status: 400 });
        result = await notificationService.sendToUser(targetId, payload);
        break;

      case 'STUDENT':
        if (!targetId) return NextResponse.json({ error: 'targetId is required for STUDENT' }, { status: 400 });
        result = await notificationService.sendToStudent(targetId, payload);
        break;

      case 'PARENT':
        if (!targetId) return NextResponse.json({ error: 'targetId is required for PARENT' }, { status: 400 });
        result = await notificationService.sendToParent(targetId, payload);
        break;

      case 'CLASS':
        if (!targetId) return NextResponse.json({ error: 'targetId is required for CLASS' }, { status: 400 });
        result = await notificationService.sendToClass(targetId, payload);
        break;

      case 'SECTION':
        if (!targetId) return NextResponse.json({ error: 'targetId is required for SECTION' }, { status: 400 });
        result = await notificationService.sendToSection(targetId, payload);
        break;

      case 'BROADCAST':
      default: {
        const activeTokens = await prisma.devicePushToken.findMany({
          where: { isActive: true },
          select: { fcmToken: true },
        });
        result = await notificationService.sendToTokens(
          activeTokens.map((t) => t.fcmToken),
          payload
        );
        break;
      }
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error('Error dispatching push notification:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
