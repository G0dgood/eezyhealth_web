import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getDatabase, ref, get, child } from 'firebase/database';
import { firebaseConfig } from './config';
import { getStorage } from 'firebase/storage';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Suppress Firebase console errors in development
if (process.env.NODE_ENV === 'development') {
  // Override console.error to filter out Firebase auth errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Filter out Firebase auth error messages
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Firebase: Error (auth/')) {
      return; // Don't log Firebase auth errors to console
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
    console.error('Error signing out:', error);
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
    console.log('Attempting to fetch users from Realtime Database...');
    const usersRef = ref(realtimeDb, 'users');
    console.log('Database reference created:', usersRef.toString());
    
    const snapshot = await get(usersRef);
    console.log('Snapshot received:', snapshot.exists() ? 'Data exists' : 'No data');
    
    if (snapshot.exists()) {
      const usersData = snapshot.val();
      console.log('Raw users data:', usersData);
      
      // Convert object to array and add uid as property
      const usersArray = Object.keys(usersData).map(uid => ({
        uid,
        ...usersData[uid]
      }));
      
      console.log('Processed users array:', usersArray);
      return usersArray;
    } else {
      console.log('No users found in database');
      return [];
    }
  } catch (error) {
    console.error('Error fetching users from Realtime Database:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    throw error;
  }
};

export default app;
