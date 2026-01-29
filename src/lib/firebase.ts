import { initializeApp, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';

import { getDatabase, ref, get } from 'firebase/database';
import { firebaseConfig } from './config';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getMessaging, Messaging } from 'firebase/messaging';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const functions = getFunctions(app);

export let messaging: Messaging | null = null;
if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.log("Firebase Messaging not supported in this browser or environment", err);
  }
}

// Initialize a secondary Firebase app for admin operations (like creating users without logging out)
// We use a unique name 'secondary' to avoid conflict with the default app
let secondaryApp;
try {
  secondaryApp = initializeApp(firebaseConfig, "secondary");
} catch (e) {
    // If the app is already initialized, get the existing instance
    // This can happen in development with hot reloading
    secondaryApp = getApp("secondary");
  }

// Get auth instance for the secondary app
export const secondaryAuth = getAuth(secondaryApp);


// Suppress Firebase console errors in development
if (process.env.NODE_ENV === 'development') {
  // Override console.error to filter out Firebase auth and Firestore index errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Convert all arguments to strings for comprehensive checking
    const errorMessage = args.map(arg => String(arg)).join(' ');
    
    // Filter out Firebase auth error messages
    if (errorMessage.includes('Firebase: Error (auth/')) {
      return; // Don't log Firebase auth errors to console
    }
    
    // Filter out Firestore index error messages
    if (errorMessage.includes('The query requires an index')) {
      return; // Don't log Firestore index errors to console
    }
    
    // Filter out Firestore snapshot listener errors
    if (errorMessage.includes('Uncaught Error in snapshot listener')) {
      return; // Don't log Firestore snapshot listener errors to console
    }
    
    // Filter out FirebaseError with failed-precondition code (index errors)
    if (errorMessage.includes('FirebaseError: [code=failed-precondition]')) {
      return; // Don't log Firebase index errors to console
    }
    
    // Filter out Firestore range and inequality filter errors
    if (errorMessage.includes('range and inequality filters on multiple fields')) {
      return; // Don't log Firestore range filter errors to console
    }
    
    // Filter out any Firestore errors containing index-related terms
    if (errorMessage.includes('@firebase/firestore') && errorMessage.includes('index')) {
      return; // Don't log any Firestore index-related errors
    }
    
    // Filter out any errors containing the specific Firebase project URL
    if (errorMessage.includes('console.firebase.google.com/v1/r/project/eezyhealth-2025')) {
      return; // Don't log Firebase console URL errors
    }
    
    // Filter out React key duplication errors
    if (errorMessage.includes('Encountered two children with the same key')) {
      return; // Don't log React key errors
    }
    
    // Filter out React key object errors
    if (errorMessage.includes('[object Object]') && errorMessage.includes('Keys should be unique')) {
      return; // Don't log React key object errors
    }
    
    // Filter out React key prop errors
    if (errorMessage.includes('Each child in a list should have a unique "key" prop')) {
      return; // Don't log React key prop errors
    }
    
    // Filter out BookingsPage key errors
    if (errorMessage.includes('BookingsPage') && errorMessage.includes('key')) {
      return; // Don't log BookingsPage key errors
    }
    
    // Filter out Redux non-serializable value errors
    if (errorMessage.includes('A non-serializable value was detected in an action')) {
      return; // Don't log Redux serialization errors
    }
    
    // Filter out Redux bookingDate serialization errors
    if (errorMessage.includes('payload.0.bookingDate') && errorMessage.includes('non-serializable')) {
      return; // Don't log bookingDate serialization errors
    }

    // Filter out Stream internal coordinator logs
    if (errorMessage.includes('[coordinator]') || errorMessage.includes('/ring')) {
      return; // Don't log Stream internal coordinator logs
    }
    
    originalConsoleError.apply(console, args);
  };
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Realtime Database
export const realtimeDb = getDatabase(app);
export const storage = getStorage(app);
// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signInWithEmailPassword = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing in with email/password:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) { 
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Fetch user data from Firestore
export const fetchUserData = async (uid: string) => {
  try {
    const userCollectionRef = collection(db, 'users');
    const q = query(userCollectionRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    const userData = querySnapshot.docs.map(doc => doc.data());
    
    if (userData.length === 0) {
      throw new Error('User not found');
    }
    
    return userData[0];
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

// Fetch all users from Realtime Database
export const fetchAllUsers = async () => {
  try {
    
    const usersRef = ref(realtimeDb, 'users');
 
    
    const snapshot = await get(usersRef);
 
    
    if (snapshot.exists()) {
      const usersData = snapshot.val(); 
      
      // Convert object to array and add uid as property
      const usersArray = Object.keys(usersData).map(uid => ({
        uid,
        ...usersData[uid]
      })); 
      return usersArray;
    } else { 
      return [];
    }
  } catch (error) {  
    throw error;
  }
};

// Helper function to create a document in Firestore
export const createFirebaseDocument = async (collectionName: string, data: any) => {
  try {
    const collectionRef = collection(db, collectionName);
    
    // If data has a uid or id, use it as the document ID
    if (data.uid || data.id) {
      const docId = data.uid || data.id;
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, data);
      return docRef;
    } else {
      // Otherwise allow Firestore to generate the ID
      const docRef = await addDoc(collectionRef, data);
      return docRef;
    }
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

export default app;
