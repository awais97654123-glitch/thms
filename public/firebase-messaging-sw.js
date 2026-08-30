// Firebase Cloud Messaging Service Worker — The Hayatabad Model School

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyD5lZKEGkzx_6w2wTiFYy87Q1CtgWz9Wtw",
  authDomain: "thms-8273f.firebaseapp.com",
  projectId: "thms-8273f",
  storageBucket: "thms-8273f.firebasestorage.app",
  messagingSenderId: "618494952410",
  appId: "1:618494952410:web:9b6e4f731df7c6c522f6e3",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'The Hayatabad Model School';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'New school notification received.',
    icon: payload.data?.icon || '/school-logo.png',
    badge: '/favicon.ico',
    data: {
      url: payload.data?.link || payload.fcmOptions?.link || '/',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'open', title: 'Open Portal' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
