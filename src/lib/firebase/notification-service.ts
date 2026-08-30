import { getFirebaseMessaging } from './admin';
import prisma from '../db';

export interface PushNotificationPayload {
  title: string;
  body: string;
  link?: string;
  icon?: string;
  data?: Record<string, string>;
  category?: 'HOMEWORK' | 'FEE' | 'ATTENDANCE' | 'EXAM' | 'ANNOUNCEMENT' | 'GENERAL';
}

export interface PushSendResult {
  success: boolean;
  totalTokens: number;
  successCount: number;
  failureCount: number;
  invalidTokensPurged: number;
  error?: string;
}

class FCMNotificationService {
  /**
   * Send push notification to a specific list of FCM tokens
   */
  async sendToTokens(tokens: string[], payload: PushNotificationPayload): Promise<PushSendResult> {
    if (!tokens || tokens.length === 0) {
      return { success: true, totalTokens: 0, successCount: 0, failureCount: 0, invalidTokensPurged: 0 };
    }

    try {
      const messaging = getFirebaseMessaging();

      const messagePayload = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: {
          title: payload.title,
          body: payload.body,
          link: payload.link || '/',
          category: payload.category || 'GENERAL',
          icon: payload.icon || '/school-logo.png',
          timestamp: new Date().toISOString(),
          ...(payload.data || {}),
        },
        webpush: {
          notification: {
            icon: payload.icon || '/school-logo.png',
            badge: '/favicon.ico',
            clickAction: payload.link || '/',
          },
          fcmOptions: {
            link: payload.link || '/',
          },
        },
      };

      const response = await messaging.sendEachForMulticast({
        tokens,
        ...messagePayload,
      });

      const invalidTokens: string[] = [];
      response.responses.forEach((res, idx) => {
        if (!res.success && res.error) {
          const errorCode = res.error.code;
          if (
            errorCode === 'messaging/registration-token-not-registered' ||
            errorCode === 'messaging/invalid-registration-token'
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      // Cleanup invalid tokens from database
      if (invalidTokens.length > 0) {
        await prisma.devicePushToken.updateMany({
          where: { fcmToken: { in: invalidTokens } },
          data: { isActive: false },
        });
      }

      return {
        success: response.successCount > 0,
        totalTokens: tokens.length,
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokensPurged: invalidTokens.length,
      };
    } catch (err: any) {
      console.error('[FCMNotificationService] Error sending multicast:', err.message);
      return {
        success: false,
        totalTokens: tokens.length,
        successCount: 0,
        failureCount: tokens.length,
        invalidTokensPurged: 0,
        error: err.message,
      };
    }
  }

  /**
   * Send notification to a specific user by userId
   */
  async sendToUser(userId: string, payload: PushNotificationPayload): Promise<PushSendResult> {
    const devices = await prisma.devicePushToken.findMany({
      where: { userId, isActive: true },
      select: { fcmToken: true },
    });

    const tokens = devices.map((d) => d.fcmToken);

    // Also create in-app notification record
    try {
      await prisma.notification.create({
        data: {
          userId,
          title: payload.title,
          message: payload.body,
          link: payload.link,
          type: payload.category || 'INFO',
        },
      });
    } catch (err) {
      console.warn('Could not record in-app notification:', err);
    }

    return this.sendToTokens(tokens, payload);
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(userIds: string[], payload: PushNotificationPayload): Promise<PushSendResult> {
    const devices = await prisma.devicePushToken.findMany({
      where: { userId: { in: userIds }, isActive: true },
      select: { fcmToken: true },
    });

    const tokens = devices.map((d) => d.fcmToken);

    // Record in-app notifications
    try {
      await prisma.notification.createMany({
        data: userIds.map((uid) => ({
          userId: uid,
          title: payload.title,
          message: payload.body,
          link: payload.link,
          type: payload.category || 'INFO',
        })),
      });
    } catch (err) {
      console.warn('Could not record in-app notifications in batch:', err);
    }

    return this.sendToTokens(tokens, payload);
  }

  /**
   * Send notification to a student by studentId
   */
  async sendToStudent(studentId: string, payload: PushNotificationPayload): Promise<PushSendResult> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });

    if (!student?.userId) {
      return { success: false, totalTokens: 0, successCount: 0, failureCount: 0, invalidTokensPurged: 0, error: 'Student user account not found' };
    }

    return this.sendToUser(student.userId, payload);
  }

  /**
   * Send notification to a parent by parentId
   */
  async sendToParent(parentId: string, payload: PushNotificationPayload): Promise<PushSendResult> {
    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      select: { userId: true },
    });

    if (!parent?.userId) {
      return { success: false, totalTokens: 0, successCount: 0, failureCount: 0, invalidTokensPurged: 0, error: 'Parent user account not found' };
    }

    return this.sendToUser(parent.userId, payload);
  }

  /**
   * Send notification to all students and parents in a class
   */
  async sendToClass(classId: string, payload: PushNotificationPayload): Promise<PushSendResult> {
    const students = await prisma.student.findMany({
      where: { classId, status: 'ENROLLED' },
      select: { userId: true, parent: { select: { userId: true } } },
    });

    const userIds: string[] = [];
    students.forEach((st) => {
      if (st.userId) userIds.push(st.userId);
      if (st.parent?.userId) userIds.push(st.parent.userId);
    });

    return this.sendToUsers(Array.from(new Set(userIds)), payload);
  }

  /**
   * Send notification to all students and parents in a specific class section
   */
  async sendToSection(sectionId: string, payload: PushNotificationPayload): Promise<PushSendResult> {
    const students = await prisma.student.findMany({
      where: { sectionId, status: 'ENROLLED' },
      select: { userId: true, parent: { select: { userId: true } } },
    });

    const userIds: string[] = [];
    students.forEach((st) => {
      if (st.userId) userIds.push(st.userId);
      if (st.parent?.userId) userIds.push(st.parent.userId);
    });

    return this.sendToUsers(Array.from(new Set(userIds)), payload);
  }

  /**
   * Register or update an FCM device token in the database
   */
  async registerDeviceToken(data: {
    fcmToken: string;
    userId?: string;
    devicePlatform?: string;
    userAgent?: string;
  }): Promise<{ success: boolean; id: string }> {
    const record = await prisma.devicePushToken.upsert({
      where: { fcmToken: data.fcmToken },
      update: {
        userId: data.userId || null,
        devicePlatform: data.devicePlatform || 'WEB',
        userAgent: data.userAgent || null,
        isActive: true,
        lastSeenAt: new Date(),
      },
      create: {
        fcmToken: data.fcmToken,
        userId: data.userId || null,
        devicePlatform: data.devicePlatform || 'WEB',
        userAgent: data.userAgent || null,
        isActive: true,
      },
    });

    return { success: true, id: record.id };
  }
}

export const notificationService = new FCMNotificationService();
export default notificationService;
