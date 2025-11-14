// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFgp-jr5C1Yk2UpATh-lrAK7zOsp0Mpzw",
  authDomain: "business-card-app-free.firebaseapp.com",
  projectId: "business-card-app-free",
  storageBucket: "business-card-app-free.firebasestorage.app",
  messagingSenderId: "213073960336",
  appId: "1:213073960336:web:0891af2a437604e482e715"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;