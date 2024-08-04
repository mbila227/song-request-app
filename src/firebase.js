// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateEmail, updatePassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8zdM8wpcVOX1RzUmgUpbV0y3DXesGA1M",
  authDomain: "song-request-app-7952d.firebaseapp.com",
  projectId: "song-request-app-7952d",
  storageBucket: "song-request-app-7952d.appspot.com",
  messagingSenderId: "634826153500",
  appId: "1:634826153500:web:d5d00268b756d0277389d9",
  measurementId: "G-FYDWZ1JN1G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  db
};
