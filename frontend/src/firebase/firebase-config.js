import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAXvJwye-Mqebk7-ezZZ_KS2dyhKZno0Nk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cgpa-calculator-2-ae13a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cgpa-calculator-2-ae13a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cgpa-calculator-2-ae13a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1938463392",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1938463392:web:b99f0fcd7e56a9162007c5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  onSnapshot
};
