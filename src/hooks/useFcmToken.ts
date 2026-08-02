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

            let serviceWorkerRegistration = undefined;
            if ('serviceWorker' in navigator) {
              try {
                const configParams = new URLSearchParams({
                  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
                  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
                  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
                  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
                  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
                  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
                  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
                }).toString();
                serviceWorkerRegistration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${configParams}`);
              } catch (error) {
                console.error('Service Worker registration failed:', error);
              }
            }
           
           const options: any = {};
           if (serviceWorkerRegistration) {
             options.serviceWorkerRegistration = serviceWorkerRegistration;
           }
           if (vapidKey) {
             options.vapidKey = vapidKey;
           }
           
           const currentToken = await getToken(messaging, options);
           
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
                 }
             }
           } else { 
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
