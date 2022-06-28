import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, updateDoc, doc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import localforage from "localforage";
import { getUser } from "./firestore/users";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const firebaseAuth = getAuth(app);
const getFirebaseAnalytics = () => {
  if (typeof window !== 'undefined') {
    return getAnalytics()
  }
};
const firebaseAnalytics = getFirebaseAnalytics();

const googleAuthProvider = new GoogleAuthProvider();

const firestore = getFirestore(app);

const firebaseStorage = getStorage(app);

// const firebaseMessaging = getMessaging(app);

async function tokenInServer(token?: string) {
  const currentAuthUser = firebaseAuth.currentUser;
  if (currentAuthUser && token) {
    const authUserData = await getUser(currentAuthUser.uid);
    if(!authUserData.fcmToken ||  authUserData.fcmToken !== token) {
          await updateDoc(doc(firestore, "users", authUserData.uid), {
            fcmToken: token
          })
    }
  }
}

const firebaseCloudMessaging = {
  tokenInlocalforage: async () => {
    const token = await localforage.getItem("fcm_token");
    console.log("fcm_token tokenInlocalforage", token);
    await tokenInServer(token ? token as string : undefined);
    return token;
  },
  onMessage: async () => {
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);
      alert("Notification");
    });
  },
  init: async function () {
    try {
      if ((await this.tokenInlocalforage()) !== null) {
        console.log("it already exists");
        return false;
      }
      console.log("it is creating it.");
      const messaging = getMessaging(app);
      await Notification.requestPermission();
      getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY
      })
        .then(async (currentToken) => {
          console.log("current Token", currentToken);
          if (currentToken) {
            // Send the token to your server and update the UI if necessary
            // save the token in your database
            await tokenInServer(currentToken);
            localforage.setItem("fcm_token", currentToken);
            console.log("fcm_token", currentToken);
          } else {
            // Show permission request UI

            console.log(
              "NOTIFICACION, No registration token available. Request permission to generate one."
            );
            // ...
          }
        })
        .catch((err) => {
          console.log(
            "NOTIFICACIONAn error occurred while retrieving token . "
          );
          console.log(err);
        });
    } catch (error) {
      console.error(error);
    }
  },
};

export { firebaseAuth, firebaseAnalytics, googleAuthProvider, firestore, firebaseStorage, firebaseCloudMessaging };