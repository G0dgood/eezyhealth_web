import admin from 'firebase-admin';
import 'firebase-admin/firestore'; // Register Firestore service

const originalFirestore = admin.firestore;
const customFirestore = function(databaseId) {
  const dbId = databaseId || 'pilot-life';
  return originalFirestore.call(admin, dbId);
};
Object.assign(customFirestore, originalFirestore);

try {
  Object.defineProperty(admin, 'firestore', {
    get: () => customFirestore,
    configurable: true
  });

  admin.initializeApp({
    projectId: 'eezyhealth-2025'
  });
   
  const db = admin.firestore();  
} catch (e) {
  console.error("Failed patch test:", e);
}
