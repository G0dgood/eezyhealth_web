"use client";

import { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export function useFCMToken() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const retrieveToken = async () => {
      if (!user || !messaging) return;

      try {
        if (permission === 'granted') {
           // Get VAPID key from env or fallback (it's optional for some setups but recommended)
           // If missing, getToken might throw or work depending on project config.
           const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
           
           const currentToken = await getToken(messaging, {
             vapidKey
           });
           
           if (currentToken) {
             setToken(currentToken);
             
             // Check if token needs update in Firestore
             const userRef = doc(db, 'users', user.uid);
             const userSnap = await getDoc(userRef);
             
             if (userSnap.exists()) {
                 const userData = userSnap.data();
                 if (userData.fcmToken !== currentToken) {
                     await updateDoc(userRef, {
                       fcmToken: currentToken
                     });
                     console.log("FCM Token updated in Firestore");
                 }
             }
           } else {
             console.log('No registration token available.');
           }
        } else if (permission === 'default') {
           // We can request permission here, or let the UI trigger it.
           // For now, let's request it automatically to ensure notifications work
           const permissionResult = await Notification.requestPermission();
           setPermission(permissionResult);
        }
      } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
      }
    };

    retrieveToken();
  }, [user, permission]);

  return { token, permission };
}
