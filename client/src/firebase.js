// 📁 frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth } from "firebase/auth"; // Assuming you use Firebase Auth on frontend
import { getFirestore } from "firebase/firestore"; // Assuming you use Firestore on frontend

// ⭐ IMPORTANT: Use environment variables for all sensitive/dynamic values
// Netlify will populate these when deployed.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID // Optional: Only if you actually use Analytics
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Export Firebase services you use
export const messaging = getMessaging(firebaseApp);
export const auth = getAuth(firebaseApp); // Export auth instance
export const db = getFirestore(firebaseApp); // Export firestore instance

export { getToken, onMessage }; // Still export these functions
export default firebaseApp; // Export the app instance itself