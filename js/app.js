import { auth, db, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, doc, getDoc, setDoc } from './firebase-config.js';

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
    // Usa signInWithPopup invece di Redirect per un feedback immediato a schermo
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Errore avvio login Google", error);
    alert("Errore avvio login: " + error.message);
  }
});

loginEmailBtn.addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  if (!email || !password) {
    alert("Inserisci email e password.");
    return;
  }
  
  // Disable button to prevent double click
  const originalText = loginEmailBtn.textContent;
  loginEmailBtn.textContent = 'Accesso in corso...';
  loginEmailBtn.disabled = true;

  try {
    try {
      // Prova il login
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // Se non esiste, crea l'utente
        const userCreds = await createUserWithEmailAndPassword(auth, email, password);
        // Estrai nome dall'email per il displayName
        let displayName = email.split('@')[0].replace('.', ' ');
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        
        await updateProfile(userCreds.user, { displayName: displayName });
        
        // Crea record in Firestore
        let role = 'student';
        if (email.includes('prof')) role = 'teacher';
        if (email.includes('esterno')) role = 'external';

        await setDoc(doc(db, 'users', userCreds.user.uid), {
          uid: userCreds.user.uid,
          email: email,
          displayName: displayName,
          xp: 0,
          level: 1,
          role: role
        });
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error("Errore email login", error);
    alert("Errore: " + error.message);
  } finally {
    loginEmailBtn.textContent = originalText;
    loginEmailBtn.disabled = false;
  }
});

logoutBtn.addEventListener('click', () => {
  signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
  state.user = user;
  if (user) {
    welcomeMessage.textContent = `Bentornato, Giudice ${user.displayName}`;
    
    // Mostra il menu utente
    const userMenu = document.getElementById('user-menu-container');
    if (userMenu) userMenu.style.display = 'block';
    
    const headerName = document.getElementById('header-user-name');
    if (headerName) headerName.textContent = user.displayName || 'Giudice';
    
    
    // Leggi XP dal database
    const docSnap = await getDoc(doc(db, 'users', user.uid));
    if (docSnap.exists()) {
      const xp = docSnap.data().xp || 0;
      const xpText = `XP: ${xp} / 500`;
      
      const xpSpan = document.getElementById('user-xp');
      if (xpSpan) xpSpan.textContent = xpText;
      
      const dropdownXp = document.getElementById('dropdown-user-xp');
      if (dropdownXp) dropdownXp.textContent = `${xp} XP`;
    }
    
    showView('view-dashboard');
  } else {
    // Nascondi il menu utente
    const userMenu = document.getElementById('user-menu-container');
    if (userMenu) userMenu.style.display = 'none';
    
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
const LEGAL_TEXTS = {
    privacy: `
        <h2>🔒 Privacy Policy</h2>
        <h3>1. Titolare del trattamento</h3>
        <p>Il titolare del trattamento è Guglielmo Piersanti, contattabile all'indirizzo email: prof.memmo@gmail.com</p>
        <h3>2. Finalità del sito</h3>
        <p>"La Corte della Commedia" è un'applicazione web didattica, utilizzata a scopo educativo e ludico e senza fini di lucro per l'apprendimento della lingua italiana.</p>
        <h3>3. Dati raccolti</h3>
        <p>Il sito può raccogliere i seguenti dati: nome utente (scelto dall'utente); informazioni di utilizzo relative agli esercizi (punteggi, attività completate, progressi); messaggi inviati tramite il modulo di contatto (nome, email, messaggio); dati tecnici minimi per il funzionamento (es. tipo di dispositivo tramite browser).</p>
        <h3>4. Finalità del trattamento</h3>
        <p>I dati vengono trattati esclusivamente per consentire l'accesso alle funzionalità della Corte, gestire l'esperienza didattica personalizzata (come il salvataggio dei progressi), rispondere alle richieste inviate tramite il modulo di contatto e migliorare il servizio didattico. Non vengono utilizzati per scopi commerciali o pubblicitari.</p>
        <h3>5. Base giuridica</h3>
        <p>Il trattamento dei dati si basa sul consenso fornito dall'utente al momento del primo accesso e sull'utilizzo delle funzionalità didattiche del sito.</p>
        <h3>6. Conservazione dei dati</h3>
        <p>I dati sono salvati localmente sul browser dell'utente (LocalStorage) e su database sicuri (Firebase). Non vengono venduti né ceduti a terzi. Sono mantenuti solo per il tempo necessario al funzionamento didattico o fino alla richiesta di cancellazione da parte dell'utente.</p>
        <h3>8. Diritti dell'utente</h3>
        <p>L'utente può richiedere in qualsiasi momento l'accesso ai propri dati o la loro cancellazione (che può avvenire anche tramite il proprio profilo utente cancellando i dati locali). Per assistenza, è possibile contattare il titolare all'indirizzo email sopra indicato.</p>
        <h3>9. Cookie</h3>
        <p>Il sito non utilizza cookie di profilazione a scopo pubblicitario. Utilizza esclusivamente elementi tecnici necessari per il salvataggio dei progressi di studio.</p>
        <h3>10. Utenti minori</h3>
        <p>Il sito è destinato a un uso didattico scolastico. Per l'utilizzo da parte di minori, è responsabilità di un genitore o di un docente assicurare la supervisione necessaria. I tutori possono richiedere la cancellazione dei dati in qualsiasi momento.</p>
        <h3>11. Modifiche alla Policy</h3>
        <p>Questa informativa può essere aggiornata per riflettere nuove funzionalità didattiche. Le modifiche rilevanti verranno segnalate agli utenti.</p>
        <h3>12. Riferimenti normativi</h3>
        <p>Questa informativa è redatta in conformità ai principi del GDPR.</p>
    `,
    terms: `
        <h2>📜 Termini e Condizioni</h2>
        <p>Ultimo aggiornamento: 02/05/26</p>
        <h3>1. Titolare del sito</h3>
        <p>Il presente sito web "La Corte della Commedia" è gestito da: Guglielmo Piersanti. Email di contatto: prof.memmo@gmail.com</p>
        <h3>2. Accettazione dei termini</h3>
        <p>L'accesso alla Corte implica l'accettazione dei presenti Termini e Condizioni. Se non si accettano tali condizioni, si invita a non utilizzare il sito.</p>
        <h3>3. Descrizione del servizio</h3>
        <p>Il sito offre esercizi interattivi, simulazioni di processi e contenuti per la scuola secondaria. Gli utenti possono: svolgere missioni, monitorare i propri progressi e contattare il gestore per supporto o collaborazione.</p>
        <h3>4. Utilizzo del sito</h3>
        <p>L'utente si impegna a utilizzare il sito in modo corretto, evitando comportamenti che possano danneggiare la piattaforma o gli altri utenti. È vietato l'invio di messaggi offensivi o spam tramite il modulo di contatto.</p>
        <h3>5. Modulo di contatto</h3>
        <p>L'utente è responsabile dei dati inviati tramite il modulo. Il titolare si riserva il diritto di non rispondere a messaggi non pertinenti o inappropriati.</p>
        <h3>6. Proprietà intellettuale</h3>
        <p>I testi e i materiali didattici originali contenuti nel sito sono di proprietà del titolare, protetti tramite deposito Patamu. Distribuiti con licenza CC BY-NC-ND 4.0. È vietata la riproduzione per scopi commerciali senza autorizzazione.</p>
        <h3>7. Limitazione di responsabilità</h3>
        <p>Il sito è fornito a scopo didattico gratuito. Il titolare non è responsabile per eventuali problemi tecnici temporanei o per l'uso improprio delle informazioni contenute. L'obiettivo è fornire uno strumento di supporto all'apprendimento il più accurato possibile.</p>
        <h3>8. Link esterni</h3>
        <p>Eventuali link a siti esterni sono forniti per approfondimento didattico; il titolare non è responsabile del contenuto di tali siti.</p>
        <h3>9. Modifiche</h3>
        <p>Il titolare può modificare i presenti Termini in base all'evoluzione del progetto didattico.</p>
        <h3>10. Legge applicabile</h3>
        <p>I presenti Termini sono regolati dalla normativa italiana.</p>
    `
};

window.showLegal = function(type) {
    const modal = document.getElementById('legal-modal');
    const content = document.getElementById('legal-text-container');
    
    content.innerHTML = LEGAL_TEXTS[type] || '';
    modal.classList.remove('hidden');
};

document.getElementById('close-legal-btn').addEventListener('click', () => {
    document.getElementById('legal-modal').classList.add('hidden');
});
document.getElementById('confirm-legal-btn').addEventListener('click', () => {
    document.getElementById('legal-modal').classList.add('hidden');
});
