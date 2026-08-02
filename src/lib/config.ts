// Firebase Configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
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

