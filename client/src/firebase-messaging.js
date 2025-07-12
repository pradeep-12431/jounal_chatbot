// 📄 src/firebase-messaging.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA2JvoTNFyrE6bELgzlsSPgFyN9DIUjI4k",
  authDomain: "mental-health-journal-62e9f.firebaseapp.com",
  projectId: "mental-health-journal-62e9f",
  storageBucket: "mental-health-journal-62e9f.firebasestorage.app",
  messagingSenderId: "126840674864",
  appId: "1:126840674864:web:50dfef8bdcfcab83e46bf5",
  measurementId: "G-41X3PVC5WP",
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

// ✅ Register the service worker and request token
export const requestForToken = async () => {
  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const currentToken = await getToken(messaging, {
      vapidKey: "BN-hqocSdRL9HrfQT8nsfvmGFhpldAfhp2U9lEFvaEjdo4Z4LKtL0ue_TVkp3oQ_lFk8t0FGGDU9GsvkBZwtzyQ",
      serviceWorkerRegistration: registration, // ✅ this line is critical
    });

    if (currentToken) {
      console.log("✅ FCM Token:", currentToken);
    } else {
      console.warn("⚠️ No registration token available. Request permission to generate one.");
    }
  } catch (err) {
    console.error("❌ An error occurred while retrieving token.", err);
  }
};

// 📩 Foreground message listener
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("📬 New foreground message:", payload);
      resolve(payload);
    });
  });
