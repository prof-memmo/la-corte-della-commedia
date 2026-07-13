import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configurazione provvisoria per ambiente locale
// L'utente sostituirà questi con le vere variabili d'ambiente
const firebaseConfig = {
  apiKey: "AIzaSyCgz52XehTx0qQQ1MkKtTnIM5LmjJKcPls",
  authDomain: "la-corte-della-commedia.firebaseapp.com",
  projectId: "la-corte-della-commedia",
  storageBucket: "la-corte-della-commedia.firebasestorage.app",
  messagingSenderId: "298739188542",
  appId: "1:298739188542:web:f1613b00d197ff4859e26f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
