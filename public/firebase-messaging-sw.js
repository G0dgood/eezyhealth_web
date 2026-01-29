importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBLGVaA3G1YlLEP8y1YXa-juzQletSYvHM",
  authDomain: "eezyhealth-2025.firebaseapp.com",
  projectId: "eezyhealth-2025",
  storageBucket: "eezyhealth-2025.firebasestorage.app",
  messagingSenderId: "746856865371",
  appId: "1:746856865371:web:0e88f6a4469a50919fa97e",
  measurementId: "G-35Y9WK64FL"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico', // Use favicon or app logo
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
