// 📁 backend/firebase-admin.js
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Option 1: Using GOOGLE_APPLICATION_CREDENTIALS environment variable (Recommended for deployment)
// If you set GOOGLE_APPLICATION_CREDENTIALS to the path of your service account key JSON file,
// Firebase Admin SDK will automatically pick it up.
// Example: GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/serviceAccountKey.json

// Option 2: Directly providing the path to the service account key JSON file
// Make sure 'serviceAccountKey.json' is in your backend directory or provide its full path.
const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    // You might also need a databaseURL if you're using other Firebase services like Realtime Database
    // databaseURL: "https://<YOUR_FIREBASE_PROJECT_ID>.firebaseio.com"
  });
  console.log("✅ Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("❌ Firebase Admin SDK initialization error:", error);
  // If the app is already initialized, it will throw an error, which is fine.
  // This can happen in development with hot-reloading.
  if (error.code === 'app/duplicate-app') {
    console.warn("Firebase app already initialized. Proceeding.");
  } else {
    // Exit if it's a critical error preventing Firebase from working
    process.exit(1);
  }
}

module.exports = admin;