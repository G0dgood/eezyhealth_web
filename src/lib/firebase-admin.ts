import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      if (!process.env.FIREBASE_CLIENT_EMAIL) {
        console.warn('Warning: FIREBASE_CLIENT_EMAIL is missing, but FIREBASE_PRIVATE_KEY is present.');
      }
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'eezyhealth-2025',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      }); 
    } else {
      // Fallback to default (useful for local dev if GOOGLE_APPLICATION_CREDENTIALS is set)
       
      admin.initializeApp();
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export const adminMessaging = admin.apps.length ? admin.messaging() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminAuth = admin.apps.length ? admin.auth() : null;
