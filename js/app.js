import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, getDoc, setDoc } from './firebase-config.js';

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
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const welcomeMessage = document.getElementById('welcome-message');

// Event Listeners Autenticazione
loginBtn.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Salva in firestore al primo login
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
  } catch (error) {
    console.error("Errore di login", error);
  }
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
