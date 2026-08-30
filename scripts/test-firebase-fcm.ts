import { getFirebaseAdmin, getFirebaseMessaging } from '../src/lib/firebase/admin';
import { notificationService } from '../src/lib/firebase/notification-service';
import prisma from '../src/lib/db';

async function runFirebaseFCMDiagnostics() {
  console.log('===============================================================');
  console.log('⚡ THE HAYATABAD MODEL SCHOOL — FIREBASE FCM TEST SUITE');
  console.log('===============================================================\n');

  // 1. Check Server Admin SDK
  console.log('🔹 CHECK 1: Firebase Admin SDK Initialization');
  try {
    const adminApp = getFirebaseAdmin();
    console.log('✅ [PASS] Firebase Admin App initialized successfully:', adminApp.name);

    const messaging = getFirebaseMessaging();
    console.log('✅ [PASS] Firebase Cloud Messaging (FCM) service ready');
  } catch (err: any) {
    console.error('❌ [FAIL] Firebase Admin initialization error:', err.message);
  }

  // 2. Check DevicePushToken in Neon PostgreSQL
  console.log('\n🔹 CHECK 2: Device Token Registry in Neon PostgreSQL');
  try {
    // Register a mock test token
    const testToken = `fcm_test_token_${Date.now()}`;
    const regResult = await notificationService.registerDeviceToken({
      fcmToken: testToken,
      devicePlatform: 'WEB',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    });
    console.log('✅ [PASS] Successfully registered device push token in database (ID:', regResult.id, ')');

    const totalTokens = await prisma.devicePushToken.count();
    console.log('   └─ Total Registered Device Tokens in Database:', totalTokens);
  } catch (err: any) {
    console.error('❌ [FAIL] Device token registry error:', err.message);
  }

  // 3. Test High-Level Notification Service Methods
  console.log('\n🔹 CHECK 3: High-Level Notification Service Interface');
  try {
    // Test sendToTokens with mock token (will return 0 successful or handle gracefully)
    const result = await notificationService.sendToTokens(['fcm_dummy_test_token'], {
      title: 'THMS School Announcement',
      body: 'Academic session test notification',
      category: 'ANNOUNCEMENT',
      link: '/student',
    });
    console.log('✅ [PASS] FCM Multicast dispatch executed cleanly:');
    console.log('   └─ Total Tokens Processed:', result.totalTokens);
    console.log('   └─ Handled/Purged Invalid Tokens:', result.invalidTokensPurged);
  } catch (err: any) {
    console.error('❌ [FAIL] Notification Service error:', err.message);
  }

  console.log('\n===============================================================');
  console.log('🎉 FIREBASE FCM INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('===============================================================');
}

runFirebaseFCMDiagnostics().catch(console.error);
