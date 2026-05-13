import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC0pF2cfrCqd2QNsvctnUDvVeQWFFpv7L0",
  authDomain: "medina-connect-4d9c3.firebaseapp.com",
  projectId: "medina-connect-4d9c3",
  storageBucket: "medina-connect-4d9c3.firebasestorage.app",
  messagingSenderId: "425029597760",
  appId: "1:425029597760:web:c29dda1d23527164517da5",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);