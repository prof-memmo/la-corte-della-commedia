// Import Firebase from CDN (PUNTA AL DATABASE HUB PER IL LOGIN UNICO)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc as _originalDoc, collection as _originalCollection, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, or, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-n2m-kYEuzGXPMKclZTggf4Y5Zm8_cdM",
  authDomain: "prof-memmo-hub.firebaseapp.com",
  projectId: "prof-memmo-hub",
  storageBucket: "prof-memmo-hub.firebasestorage.app",
  messagingSenderId: "839149485689",
  appId: "1:839149485689:web:04ee4fa6237d94d0b71ea8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

function getPrefixedPath(path) {
  if (!path || typeof path !== 'string') return path;
  // Eccezioni per le collezioni globali dell'Hub o di altri giochi
  if (path.startsWith('hub_') || path === 'games_status' || path === 'vetrina' || path.startsWith('fanta_') || path.startsWith('eroi_') || path.startsWith('palestra_')) {
    return path;
  }
  if (path.startsWith('corte_')) return path;
  return 'corte_' + path;
}

// Wrapper per doc(...)
function doc(firstArg, ...rest) {
  if (typeof firstArg === 'object' && rest.length > 0 && typeof rest[0] === 'string') {
    const copyRest = [...rest];
    copyRest[0] = getPrefixedPath(copyRest[0]);
    return _originalDoc(firstArg, ...copyRest);
  }
  return _originalDoc(firstArg, ...rest);
}

// Wrapper per collection(...)
function collection(firstArg, ...rest) {
  if (typeof firstArg === 'object' && rest.length > 0 && typeof rest[0] === 'string') {
    const copyRest = [...rest];
    copyRest[0] = getPrefixedPath(copyRest[0]);
    return _originalCollection(firstArg, ...copyRest);
  }
  return _originalCollection(firstArg, ...rest);
}

// Esposizione per compatibilità legacy se usata
window.hubApp = app;
window.hubDb = db;
window.fbDb = { app: { collection: (p) => _originalCollection(db, getPrefixedPath(p)) } };

export { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  doc, 
  collection,
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  query,
  where,
  orderBy,
  or,
  arrayUnion,
  firebaseConfig, 
  initializeApp, 
  getAuth 
};
