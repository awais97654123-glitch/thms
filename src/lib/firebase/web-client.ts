import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD5lZKEGkzx_6w2wTiFYy87Q1CtgWz9Wtw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "thms-8273f.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "thms-8273f",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "thms-8273f.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "618494952410",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:618494952410:web:9b6e4f731df7c6c522f6e3",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-2HNMN82622",
};

export function getFirebaseWebClient(): { app: FirebaseApp; messaging: Messaging | null } {
  if (typeof window === 'undefined') {
    return { app: null as any, messaging: null };
  }

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  let messaging: Messaging | null = null;
  try {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      messaging = getMessaging(app);
    }
  } catch (err) {
    console.warn('[FirebaseWeb] Messaging not supported in this browser context:', err);
  }

  return { app, messaging };
}

/**
 * Requests notification permission from user and registers FCM Device Token with backend
 */
export async function requestNotificationPermissionAndGetToken(userId?: string): Promise<{
  success: boolean;
  token?: string;
  permission: NotificationPermission;
  error?: string;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { success: false, permission: 'denied', error: 'Notifications not supported in this browser.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, permission, error: 'Permission not granted by user.' };
    }

    const { messaging } = getFirebaseWebClient();
    if (!messaging) {
      return { success: false, permission, error: 'FCM Messaging could not be initialized.' };
    }

    // Register service worker if not already registered
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const vapidKey =
      process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
      'BCO7ha278MAg_9DjZgh85VX1_IqaGzg-znVzuDSACxTWgkCWCNKAZws5p25w9ghwPAk4Seeih7cOIJAaAxooAq4';

    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      // Send token to backend API to store in PostgreSQL
      await fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fcmToken: currentToken,
          userId,
          devicePlatform: 'WEB',
          userAgent: navigator.userAgent,
        }),
      });

      return { success: true, token: currentToken, permission };
    } else {
      return { success: false, permission, error: 'No FCM registration token available.' };
    }
  } catch (err: any) {
    console.error('[FirebaseWeb] Error retrieving FCM token:', err);
    return { success: false, permission: Notification.permission, error: err.message };
  }
}

/**
 * Listen for foreground push notifications
 */
export function onForegroundMessage(callback: (payload: any) => void) {
  if (typeof window === 'undefined') return () => {};

  const { messaging } = getFirebaseWebClient();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log('[FirebaseWeb] Foreground notification received:', payload);
    callback(payload);
  });
}
