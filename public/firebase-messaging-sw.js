importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
  apiKey: "AIzaSyDSYG5q07XmLx3jxkMm831FgP4ZcoDPPeg",
  authDomain: "prod-clueconn.firebaseapp.com",
  projectId: "prod-clueconn",
  storageBucket: "prod-clueconn.appspot.com",
  messagingSenderId: "232474665634",
  appId: "1:232474665634:web:a39624926ee5e55895edfb",
  measurementId: "G-7TP92H2W4D",
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
