import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

// Server-Only Firebase Admin SDK Initialization
// WARNING: NEVER import or execute this file in client-side components.

let firebaseAdminApp: App | null = null;

export function getFirebaseAdmin(): App {
  const existingApps = getApps();
  if (existingApps.length > 0 && existingApps[0]) {
    return existingApps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || 'thms-8273f';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@thms-8273f.iam.gserviceaccount.com';
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error('FIREBASE_PRIVATE_KEY is missing in environment variables.');
  }

  // Ensure newlines in PEM format private key are handled properly
  privateKey = privateKey.replace(/\\n/g, '\n');

  try {
    firebaseAdminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    return firebaseAdminApp;
  } catch (err: any) {
    const currentApps = getApps();
    if (currentApps.length > 0 && currentApps[0]) {
      return currentApps[0];
    }
    console.error('[FirebaseAdmin] Failed to initialize:', err.message);
    throw err;
  }
}

export function getFirebaseMessaging(): Messaging {
  const app = getFirebaseAdmin();
  return getMessaging(app);
}

export default getFirebaseAdmin;
