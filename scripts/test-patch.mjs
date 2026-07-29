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
  
  console.log("Checking patched admin.firestore()...");
  const db = admin.firestore();
  console.log("Patched firestore succeeded! Database ID:", db.databaseId);
  
  console.log("Checking sub-properties...");
  console.log("FieldValue:", typeof admin.firestore.FieldValue);
  console.log("Timestamp:", typeof admin.firestore.Timestamp);
} catch (e) {
  console.error("Failed patch test:", e);
}
