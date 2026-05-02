import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyClxcSg3FkcPnxB218QcUPi8Ae3Hl7A5i4",
  authDomain: "interra-trust-bank.firebaseapp.com",
  projectId: "interra-trust-bank",
  storageBucket: "interra-trust-bank.firebasestorage.app",
  messagingSenderId: "921368597620",
  appId: "1:921368597620:web:6939f4330a10c643102d21"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);