importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase web config is public by design. Hardcoding it here (rather than
// reading query params from the registration URL) guarantees projectId is always
// present — otherwise a SW registered/cached before params are passed initializes
// with an empty config and throws
// "Installations: Missing App configuration value: projectId".
// Query params, when present, still override these defaults.
const params = new URLSearchParams(location.search);
const firebaseConfig = {
  apiKey: params.get("apiKey") || "AIzaSyBLGVaA3G1YlLEP8y1YXa-juzQletSYvHM",
  authDomain: params.get("authDomain") || "eezyhealth-2025.firebaseapp.com",
  projectId: params.get("projectId") || "eezyhealth-2025",
  storageBucket: params.get("storageBucket") || "eezyhealth-2025.firebasestorage.app",
  messagingSenderId: params.get("messagingSenderId") || "746856865371",
  appId: params.get("appId") || "1:746856865371:web:0e88f6a4469a50919fa97e",
  measurementId: params.get("measurementId") || "G-35Y9WK64FL"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => { 
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico', // Use favicon or app logo
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
