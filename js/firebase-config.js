// Import Firebase from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgz52XehTx0qQQ1MkKtTnIM5LmjJKcPls",
  authDomain: "la-corte-della-commedia.firebaseapp.com",
  projectId: "la-corte-della-commedia",
  storageBucket: "la-corte-della-commedia.firebasestorage.app",
  messagingSenderId: "298739188542",
  appId: "1:298739188542:web:f1613b00d197ff4859e26f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, doc, getDoc, setDoc };
