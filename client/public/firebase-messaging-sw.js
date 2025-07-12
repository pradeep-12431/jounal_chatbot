// 📁 frontend/public/firebase-messaging-sw.js
// This file needs to be in the 'public' directory of your React app.

// Import and configure the Firebase SDK
// Replace '<YOUR_FIREBASE_API_KEY>', '<YOUR_FIREBASE_PROJECT_ID>', etc.
// with your actual Firebase project configuration from the Firebase Console.
// You can get this from Project settings -> General -> Your apps -> Firebase SDK snippet -> Config
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyA2JvoTNFyrE6bELgzlsSPgFyN9DIUjI4k",
    authDomain: "mental-health-journal-62e9f.firebaseapp.com",
    projectId: "mental-health-journal-62e9f",
    storageBucket: "mental-health-journal-62e9f.firebasestorage.app",
    messagingSenderId: "126840674864",
    appId: "1:126840674864:web:50dfef8bdcfcab83e46bf5",
    measurementId: "G-41X3PVC5WP"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png', // Path to your app's icon in the public folder
    data: payload.data // Custom data payload
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle clicks on notifications (optional, but good for opening app)
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Close the notification

  // Check if a URL is provided in the notification data
  const urlToOpen = event.notification.data?.journalUrl || '/journal'; // Default to /journal

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus(); // Focus existing tab if URL matches
        }
      }
      // If no matching tab, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});