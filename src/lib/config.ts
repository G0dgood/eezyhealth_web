// Firebase Configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBLGVaA3G1YlLEP8y1YXa-juzQletSYvHM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "eezyhealth-2025.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://eezyhealth-2025-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "eezyhealth-2025",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "eezyhealth-2025.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "746856865371",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:746856865371:web:0e88f6a4469a50919fa97e",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-35Y9WK64FL",
};

// API Configuration
export const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
export const googleUrl = process.env.NEXT_PUBLIC_GOOGLE_URL;
export const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Firebase Cloud Functions
export const firebaseCloudFunctionsUrl = process.env.NEXT_PUBLIC_FIREBASE_CLOUD_FUNCTIONS_URL;

// App Configuration
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME,
  version: process.env.NEXT_PUBLIC_APP_VERSION,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION
};

// Stream Configuration
export const streamApiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

// Favicon Configuration
export const faviconPath = process.env.NEXT_PUBLIC_FAVICON_PATH;

