import { auth, db, googleProvider, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, doc, getDoc, setDoc } from './firebase-config.js';

// Stato dell'applicazione
const state = {
  user: null,
  currentPhase: 1,
  currentCaseId: null
};

// Gestione delle Viste (SPA manuale)
function showView(viewId) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
}

// Elementi DOM
const loginGoogleBtn = document.getElementById('login-google-btn');
const loginEmailBtn = document.getElementById('login-email-btn');
const ageCheck = document.getElementById('age-check');
const privacyCheck = document.getElementById('privacy-check');
const logoutBtn = document.getElementById('logout-btn');
const welcomeMessage = document.getElementById('welcome-message');

// Abilitazione dei bottoni in base alle checkbox
function updateLoginButtons() {
  const isChecked = ageCheck.checked && privacyCheck.checked;
  loginGoogleBtn.disabled = !isChecked;
  loginEmailBtn.disabled = !isChecked;
}
ageCheck.addEventListener('change', updateLoginButtons);
privacyCheck.addEventListener('change', updateLoginButtons);

// Controllo del risultato del redirect (se veniamo da un login su Safari)
getRedirectResult(auth).then(async (result) => {
  if (result && result.user) {
    const userDocRef = doc(db, 'users', result.user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        xp: 0,
        level: 1,
        role: 'student'
      });
    }
  }
}).catch((error) => {
  console.error("Errore di login da redirect", error);
  alert("Errore durante il login: " + error.message);
});

// Event Listeners Autenticazione
loginGoogleBtn.addEventListener('click', async () => {
  try {
    // signInWithRedirect evita i problemi di popup bloccati su Safari
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error("Errore avvio redirect", error);
    alert("Impossibile avviare il login: " + error.message);
  }
});

loginEmailBtn.addEventListener('click', () => {
  alert("Login con email da implementare!");
});

logoutBtn.addEventListener('click', () => {
  signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
  state.user = user;
  if (user) {
    welcomeMessage.textContent = `Bentornato, Giudice ${user.displayName}`;
    logoutBtn.style.display = 'block';
    
    // Leggi XP dal database
    const docSnap = await getDoc(doc(db, 'users', user.uid));
    if (docSnap.exists()) {
      document.getElementById('user-xp').textContent = `XP: ${docSnap.data().xp || 0} / 500`;
    }
    
    showView('view-dashboard');
  } else {
    logoutBtn.style.display = 'none';
    showView('view-login');
  }
});

// LOGICA DEL PROCESSO (TRIAL FLOW)
const trialContent = document.getElementById('trial-content');
const trialNextBtn = document.getElementById('trial-next-btn');
const trialBackBtn = document.getElementById('trial-back-btn');

window.app = {
  startTrial: function(caseId) {
    state.currentCaseId = caseId;
    state.currentPhase = 1;
    showView('view-trial');
    this.renderPhase();
  },
  
  nextPhase: function() {
    if (state.currentPhase < 8) {
      state.currentPhase++;
      this.renderPhase();
    }
  },

  renderPhase: function() {
    document.getElementById('trial-phase-text').textContent = `Fase ${state.currentPhase} di 8`;
    document.getElementById('trial-progress').style.width = `${(state.currentPhase / 8) * 100}%`;
    
    trialBackBtn.style.display = 'none';
    trialNextBtn.style.display = 'inline-block';
    trialNextBtn.textContent = 'Procedi';

    if (state.currentPhase === 1) {
      trialContent.innerHTML = `
        <h3 class="text-crimson" style="text-align:center;">Apertura del Fascicolo</h3>
        <p style="text-align:center;">Paolo e Francesca (Canto V, Secondo Cerchio)</p>
        <p>Giudice, la Corte è convocata. Analizza i fatti e ascolta l'accusa.</p>
      `;
    } else if (state.currentPhase === 7) {
      trialContent.innerHTML = `
        <h3 class="text-crimson" style="text-align:center;">Emetti il tuo Verdetto</h3>
        <p>Decidi la sorte dell'anima e motiva la tua sentenza.</p>
      `;
      trialNextBtn.textContent = 'Sigilla Sentenza';
    } else if (state.currentPhase === 8) {
      trialContent.innerHTML = `
        <div style="text-align:center;">
          <h2 class="text-gold">Sentenza Eseguita!</h2>
          <p>Hai ottenuto +500 XP per la tua motivazione.</p>
        </div>
      `;
      trialNextBtn.style.display = 'none';
      trialBackBtn.style.display = 'inline-block';
    } else {
      trialContent.innerHTML = `<p style="text-align:center;">Contenuto della Fase ${state.currentPhase} in caricamento...</p>`;
    }
  }
};

trialNextBtn.addEventListener('click', () => window.app.nextPhase());
trialBackBtn.addEventListener('click', () => showView('view-dashboard'));

// Gestione Modal Privacy e Termini
window.showLegal = function(type) {
    const modal = document.getElementById('legal-modal');
    const content = document.getElementById('legal-text-container');
    
    if (type === 'privacy') {
        content.innerHTML = `
            <h3 style="color:var(--accent-gold); margin-bottom:1rem;">Privacy Policy</h3>
            <p style="margin-bottom:0.5rem;"><strong>Ultimo aggiornamento:</strong> 2026</p>
            <p style="margin-bottom:0.5rem;">Ai sensi del Regolamento (UE) 2016/679 (GDPR), ti informiamo che "La Corte della Commedia" raccoglie e tratta i tuoi dati personali (nome, cognome, indirizzo email e avatar) esclusivamente per le finalità legate al funzionamento dell'applicazione didattica.</p>
            <p style="margin-bottom:0.5rem;"><strong>1. Titolare del Trattamento:</strong> Guglielmo Piersanti.</p>
            <p style="margin-bottom:0.5rem;"><strong>2. Dati Raccolti:</strong> Vengono salvati l'indirizzo email e il nome associato all'account fornito per permettere il salvataggio dei progressi (XP, Livelli) nel database Firebase.</p>
            <p style="margin-bottom:0.5rem;"><strong>3. Condivisione dei Dati:</strong> Nessun dato verrà ceduto o venduto a terzi per fini commerciali. I docenti registrati potranno visionare il nome e i progressi degli studenti iscritti alle proprie classi.</p>
            <p style="margin-bottom:0.5rem;"><strong>4. Conservazione:</strong> I dati sono conservati su server sicuri (Google Firebase) e possono essere cancellati in qualsiasi momento tramite richiesta esplicita all'amministratore.</p>
        `;
    } else {
        content.innerHTML = `
            <h3 style="color:var(--accent-gold); margin-bottom:1rem;">Termini e Condizioni</h3>
            <p style="margin-bottom:0.5rem;"><strong>Ultimo aggiornamento:</strong> 2026</p>
            <p style="margin-bottom:0.5rem;">Benvenuto in "La Corte della Commedia", una piattaforma didattica interattiva.</p>
            <p style="margin-bottom:0.5rem;"><strong>1. Età minima:</strong> L'accesso è consentito agli utenti con età minima di 16 anni, o inferiore se sotto la supervisione e l'autorizzazione di un genitore, tutore o docente.</p>
            <p style="margin-bottom:0.5rem;"><strong>2. Utilizzo:</strong> È vietato l'uso della piattaforma per scopi illeciti o dannosi. Gli utenti (studenti e docenti) sono tenuti a mantenere un linguaggio consono e rispettoso nelle riflessioni inviate e nei nomi scelti.</p>
            <p style="margin-bottom:0.5rem;"><strong>3. Proprietà Intellettuale:</strong> I contenuti testuali, le regole di gioco e le grafiche presenti nel sito sono di proprietà di Guglielmo Piersanti e sono protetti tramite deposito Patamu. Distribuiti con licenza CC BY-NC-ND 4.0.</p>
            <p style="margin-bottom:0.5rem;"><strong>4. Interruzioni:</strong> La piattaforma è uno strumento didattico. Non si garantisce la continuità del servizio 24/7 e ci si riserva il diritto di sospendere l'accesso per manutenzione.</p>
        `;
    }
    
    modal.classList.remove('hidden');
};

document.getElementById('close-legal-btn').addEventListener('click', () => {
    document.getElementById('legal-modal').classList.add('hidden');
});
document.getElementById('confirm-legal-btn').addEventListener('click', () => {
    document.getElementById('legal-modal').classList.add('hidden');
});
