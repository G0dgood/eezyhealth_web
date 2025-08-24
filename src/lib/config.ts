// Firebase Configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBLGVaA3G1YlLEP8y1YXa-juzQletSYvHM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "eezyhealth-2025.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://eezyhealth-2025-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "eezyhealth-2025",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "eezyhealth-2025.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "746856865371",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:746856865371:web:0e88f6a4469a50919fa97e",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-35Y9WK64FL"
};

// API Configuration
export const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://us-central1-eezyhealth-2023.cloudfunctions.net";
export const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBLGVaA3G1YlLEP8y1YXa-juzQletSYvHM';
export const googleUrl = "https://identitytoolkit.googleapis.com/v1";
export const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "746856865371-j2cp76ong5q4ef6qalmm77vm7jk44hql.apps.googleusercontent.com";

// Firebase Cloud Functions
export const firebaseCloudFunctionsUrl = process.env.NEXT_PUBLIC_FIREBASE_CLOUD_FUNCTIONS_URL || "https://us-central1-eezyhealth-2023.cloudfunctions.net";

// App Configuration
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "EezyHealth",
  version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Healthcare Management System"
};
