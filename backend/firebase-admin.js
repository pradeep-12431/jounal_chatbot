// 📁 backend/firebase-admin.js
const admin = require('firebase-admin');
// const path = require('path'); // No longer needed as we're not reading from a file
require('dotenv').config();

try {
  // ⭐ IMPORTANT CHANGE: Use an environment variable for the service account JSON
  // The value of process.env.FIREBASE_ADMIN_SDK_CONFIG must be the full JSON string
  if (!process.env.FIREBASE_ADMIN_SDK_CONFIG) {
      throw new Error("FIREBASE_ADMIN_SDK_CONFIG environment variable is not set.");
  }
  
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // If you're using Realtime Database, uncomment and set your databaseURL:
    // databaseURL: "https://<YOUR_FIREBASE_PROJECT_ID>.firebaseio.com"
  });
  console.log("✅ Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("❌ Firebase Admin SDK initialization error:", error);
  // Only exit process for critical errors when Firebase is essential
  if (error.code !== 'app/duplicate-app') { // Allow duplicate-app in dev
    process.exit(1);
  } else {
    console.warn("Firebase app already initialized (likely in development hot-reloading). Proceeding.");
  }
}

module.exports = admin;