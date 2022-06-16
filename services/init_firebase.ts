import { initializeApp, getApps, FirebaseApp, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";




const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID,
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

// enableIndexedDbPersistence(firestore, { forceOwnership: false }).catch((err) => {
//     if (err.code == 'failed-precondition') {
//         console.log('multiple tabs open')
//     } else if (err.code == 'unimplemented') {
//         console.log('unimplemented')
//     }
// });




export { firebaseAuth, firebaseAnalytics, googleAuthProvider, firestore, firebaseStorage };