// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCdljSVjv59eiaeqp2h-HBUPDCQ45dnJSY",
  authDomain: "conference-alert-81ecf.firebaseapp.com",
  projectId: "conference-alert-81ecf",
  storageBucket: "conference-alert-81ecf.firebasestorage.app",
  messagingSenderId: "1073325460861",
  appId: "1:1073325460861:android:fe07f5ee8981bced8b9014",
  measurementId: "G-KP2WJG1NX9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


