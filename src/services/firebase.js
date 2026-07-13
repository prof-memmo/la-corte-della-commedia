import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configurazione provvisoria per ambiente locale
// L'utente sostituirà questi con le vere variabili d'ambiente
const firebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "la-corte-commedia.firebaseapp.com",
  projectId: "la-corte-commedia",
  storageBucket: "la-corte-commedia.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
