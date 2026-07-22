import { auth, db, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, doc, getDoc, setDoc } from './firebase-config.js';
import EroiDB from "./db.js";
import { EroiGame } from "./game.js";
import { MapEngine } from "./map.js";

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
        role: 'pending'
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
    const result = await signInWithPopup(auth, googleProvider);
    if (result && result.user) {
      const userDocRef = doc(db, 'users', result.user.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            xp: 0,
            level: 1,
            role: 'pending'
          });
        }
      } catch (e) {
        console.warn("Impossibile leggere/creare il documento utente. Controllo regole Firestore.", e);
      }
    }
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
    // --- MOCK LOGIN PER ACCOUNT DI TEST ---
    const testAccounts = {
        "prof.memmo@lacorte.it": { uid: "mock-teacher", email: "prof.memmo@lacorte.it", displayName: "Prof Memmo", role: "teacher" },
        "studente.test@lacorte.it": { uid: "mock-student", email: "studente.test@lacorte.it", displayName: "Studente Test", role: "student", classId: "TEST-CLASS" },
        "esterno.test@lacorte.it": { uid: "mock-external", email: "esterno.test@lacorte.it", displayName: "Visitatore", role: "external" }
    };
    
    if (testAccounts[email]) {
        console.log("Mock login per test account:", email);
        const user = testAccounts[email];
        // Trigger manuale dello stato auth
        state.user = user;
        window.EroiDB.cache.userProfile = user;
        
        welcomeMessage.textContent = `Bentornato, ${user.displayName}`;
        const userMenu = document.getElementById('user-menu-container');
        if (userMenu) userMenu.style.display = 'block';
        const headerName = document.getElementById('header-user-name');
        if (headerName) headerName.textContent = user.displayName;
        
        viewAuth.classList.remove('active');
        await initializeDashboard(user.email, user.role);
        
        loginEmailBtn.textContent = originalText;
        loginEmailBtn.disabled = false;
        return; // esci senza usare firebase
    }
    // --- FINE MOCK LOGIN ---

    try {
      // Prova il login reale
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // Se non esiste, crea l'utente
        const userCreds = await createUserWithEmailAndPassword(auth, email, password);
        // Estrai nome dall'email per il displayName
        let displayName = email.split('@')[0].replace('.', ' ');
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        
        await updateProfile(userCreds.user, { displayName: displayName });
        
        // Crea record in Firestore (Ruolo pending di default)
        let role = 'pending';

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
  if (state.user && state.user.uid && state.user.uid.startsWith("mock-")) return; // ignora se è un account mock già loggato
  state.user = user;
  if (user) {
    welcomeMessage.textContent = `Bentornato, Giudice ${user.displayName}`;
    
    // Mostra il menu utente
    const userMenu = document.getElementById('user-menu-container');
    if (userMenu) userMenu.style.display = 'block';
    
    const headerName = document.getElementById('header-user-name');
    if (headerName) headerName.textContent = user.displayName || 'Giudice';
    
    
    // Mostra header, nav e footer
    const mainHeader = document.getElementById('main-app-header');
    if (mainHeader) mainHeader.style.display = 'flex';
    const bottomNav = document.getElementById('mobile-bottom-nav');
    if (bottomNav) bottomNav.style.display = 'flex';
    const mainFooter = document.getElementById('main-footer');
    if (mainFooter) mainFooter.style.display = 'block';
    
    // Leggi Profilo dal database tramite EroiDB
    let role = 'student';
    try {
      if (EroiDB) {
        const profile = await EroiDB.getUserProfile(user.uid);
        if (profile) {
          const xp = profile.xp || 0;
          role = profile.role || 'student';
          
          // Auto-upgrade prof.memmo
          if (user.email && user.email.toLowerCase() === 'prof.memmo@gmail.com' && role !== 'admin') {
              try {
                  await window.EroiDB.updateUserRole(user.uid, 'admin');
                  role = 'admin';
                  if (window.EroiDB.cache && window.EroiDB.cache.userProfile) {
                      window.EroiDB.cache.userProfile.role = 'admin';
                  }
              } catch(err) { console.error("Impossibile promuovere prof.memmo ad admin", err); }
          }
          
          const xpText = `XP: ${xp} / 500`;
          
          const xpSpan = document.getElementById('user-xp');
          if (xpSpan) xpSpan.textContent = xpText;
          
          const dropdownXp = document.getElementById('dropdown-user-xp');
          if (dropdownXp) dropdownXp.textContent = `${xp} XP`;
        }
      }
    } catch (e) {
      console.warn("Impossibile caricare il profilo.", e);
    }
    
    const navLabel = document.getElementById('nav-dashboard-label');
    if (navLabel) {
      if (role === 'teacher' || role === 'admin' || (user.email && user.email.toLowerCase() === 'prof.memmo@gmail.com')) {
        navLabel.textContent = 'Loggia';
      } else {
        navLabel.textContent = 'Fascicoli';
      }
    }
    
    // Routing in base al ruolo
    const userEmail = user.email ? user.email.toLowerCase() : '';
    if (role === 'pending') {
      showView('view-onboarding');
      // Nascondi menu utente e nav bar durante l'onboarding
      if (userMenu) userMenu.style.display = 'none';
      if (bottomNav) bottomNav.style.display = 'none';
    } else if (userEmail === 'prof.memmo@gmail.com' || role === 'admin' || role === 'teacher') {
      showView('view-teacher-dashboard');
      if (window.TeacherDashboard) window.TeacherDashboard.init();
      if (window.MapEngine) window.MapEngine.init(); // Initialize map for admin/teachers too
      const btnToAdmin = document.getElementById('btn-to-admin');
      if (btnToAdmin) {
          if (userEmail === 'prof.memmo@gmail.com' || role === 'admin') {
              btnToAdmin.style.display = 'inline-block';
          } else {
              btnToAdmin.style.display = 'none';
          }
      }
    } else if (role === 'external') {
      window.goToDashboard();
      MapEngine.init();
    } else {
      window.goToDashboard();
      MapEngine.init();
    }
  } else {
    // Nascondi il menu utente, header, nav e footer
    const userMenu = document.getElementById('user-menu-container');
    if (userMenu) userMenu.style.display = 'none';
    
    const mainHeader = document.getElementById('main-app-header');
    if (mainHeader) mainHeader.style.display = 'none';
    const bottomNav = document.getElementById('mobile-bottom-nav');
    if (bottomNav) bottomNav.style.display = 'none';
    const mainFooter = document.getElementById('main-footer');
    if (mainFooter) mainFooter.style.display = 'none';
    
    showView('view-login');
  }
});

// Funzione globale per la Dashboard
window.goToDashboard = function() {
    if (!state.user) {
        showView('view-login');
        return;
    }
    const profile = EroiDB && EroiDB.cache ? EroiDB.cache.userProfile : null;
    const role = profile ? profile.role : 'student';
    const userEmail = state.user.email ? state.user.email.toLowerCase() : '';
    
    if (userEmail === 'prof.memmo@gmail.com' || role === 'admin' || role === 'teacher') {
      showView('view-teacher-dashboard');
      if (window.TeacherDashboard) window.TeacherDashboard.init();
      if (window.MapEngine) window.MapEngine.init(); // Initialize map for admin/teachers too
      const btnToAdmin = document.getElementById('btn-to-admin');
      if (btnToAdmin) {
          if (userEmail === 'prof.memmo@gmail.com' || role === 'admin') {
              btnToAdmin.style.display = 'inline-block';
          } else {
              btnToAdmin.style.display = 'none';
          }
      }
    } else if (role === 'external') {
        showView('view-dashboard');
        // Popola i dati nella dashboard studente
        const sName = document.getElementById('stud-dashboard-name');
        const sLevel = document.getElementById('stud-dashboard-level');
        const sFiorini = document.getElementById('stud-dashboard-fiorini');
        const sXpText = document.getElementById('stud-dashboard-xp-text');
        const sXpFill = document.getElementById('stud-dashboard-xp-fill');
        
        const currentXp = profile ? (profile.xp || 0) : 0;
        const currentLevel = profile ? (profile.level || 1) : 1;
        const nextXp = currentLevel * 300; // Formula XP finta
        
        if (sName) sName.textContent = state.user.displayName || 'Studente';
        if (sLevel) sLevel.textContent = currentLevel;
        if (sFiorini) sFiorini.innerHTML = `${profile && profile.fiorini ? profile.fiorini : 0} <i class="fa-solid fa-coins"></i>`;
        
        if (sXpText) sXpText.textContent = `${currentXp} / ${nextXp} XP`;
        if (sXpFill) {
            const perc = Math.min(100, Math.max(0, (currentXp / nextXp) * 100));
            sXpFill.style.width = perc + "%";
        }
        
        // Mock Stats Base
        const logica = document.getElementById('stud-stat-logica');
        const retorica = document.getElementById('stud-stat-retorica');
        const giuris = document.getElementById('stud-stat-giurisprudenza');
        const empatia = document.getElementById('stud-stat-empatia');
        
        if (logica) logica.textContent = 10 + (currentLevel * 2);
        if (retorica) retorica.textContent = 10 + (currentLevel * 2);
        if (giuris) giuris.textContent = 10 + (currentLevel * 2);
        if (empatia) empatia.textContent = 10 + (currentLevel * 2);
    } else {
        showView('view-student-dashboard');
        // Popola i dati nella dashboard studente
        const sName = document.getElementById('stud-dashboard-name');
        const sLevel = document.getElementById('stud-dashboard-level');
        const sFiorini = document.getElementById('stud-dashboard-fiorini');
        const sXpText = document.getElementById('stud-dashboard-xp-text');
        const sXpFill = document.getElementById('stud-dashboard-xp-fill');
        
        const currentXp = profile ? (profile.xp || 0) : 0;
        const currentLevel = profile ? (profile.level || 1) : 1;
        const nextXp = currentLevel * 300; // Formula XP finta
        
        if (sName) sName.textContent = state.user.displayName || 'Studente';
        if (sLevel) sLevel.textContent = currentLevel;
        if (sFiorini) sFiorini.innerHTML = `${profile && profile.fiorini ? profile.fiorini : 0} <i class="fa-solid fa-coins"></i>`;
        
        if (sXpText) sXpText.textContent = `${currentXp} / ${nextXp} XP`;
        if (sXpFill) {
            const perc = Math.min(100, Math.max(0, (currentXp / nextXp) * 100));
            sXpFill.style.width = perc + "%";
        }
        
        // Mock Stats Base
        const logica = document.getElementById('stud-stat-logica');
        const retorica = document.getElementById('stud-stat-retorica');
        const giuris = document.getElementById('stud-stat-giurisprudenza');
        const empatia = document.getElementById('stud-stat-empatia');
        
        if (logica) logica.textContent = 10 + (currentLevel * 2);
        if (retorica) retorica.textContent = 10 + (currentLevel * 2);
        if (giuris) giuris.textContent = 10 + (currentLevel * 2);
        if (empatia) empatia.textContent = 10 + (currentLevel * 2);
    }
};

// LOGICA DEL PROCESSO delegata a game.js
const trialNextBtn = document.getElementById('trial-next-btn');
const trialBackBtn = document.getElementById('trial-back-btn');

if (trialNextBtn) trialNextBtn.addEventListener('click', () => { if(EroiGame) EroiGame.nextPhase(); });
if (trialBackBtn) trialBackBtn.addEventListener('click', () => { if(EroiGame) EroiGame.prevPhase(); });

// Gestione Modal Privacy e Termini
const LEGAL_TEXTS = {
    privacy: `
        <h2>🔒 Privacy Policy</h2>
        <h3>1. Titolare del trattamento</h3>
        <p>Il titolare del trattamento è Guglielmo Piersanti, contattabile all'indirizzo email: prof.memmo@gmail.com</p>
        <h3>2. Finalità del sito</h3>
        <p>"La Corte della Commedia" è un'applicazione web didattica, utilizzata a scopo educativo e ludico e senza fini di lucro per l'apprendimento della lingua italiana.</p>
        <h3>3. Dati raccolti</h3>
        <p>Il sito può raccogliere i seguenti dati: nome utente (scelto dall'utente); informazioni di utilizzo relative alle attività; messaggi inviati tramite il modulo di contatto; dati tecnici minimi per il funzionamento.</p>
        <h3>4. Finalità del trattamento</h3>
        <p>I dati vengono trattati esclusivamente per consentire l'accesso alle funzionalità della Corte, gestire l'esperienza didattica personalizzata, e migliorare il servizio.</p>
        <h3>5. Base giuridica</h3>
        <p>Il trattamento dei dati si basa sul consenso fornito dall'utente al momento del primo accesso.</p>
        <h3>6. Conservazione dei dati</h3>
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
    `,
    regolamento: `
        <h2>⚖️ Regolamento della Corte</h2>
        <h3>1. Lo Scopo del Viaggio</h3>
        <p>Come giudice, il tuo compito è ascoltare le anime, analizzare le prove e i documenti, ed esprimere un verdetto motivato sulle loro colpe o meriti.</p>
        <h3>2. Acquisizione dell'Esperienza (XP)</h3>
        <p>Ogni fascicolo risolto correttamente o valutato dal tuo Docente (se sei in una classe) ti farà guadagnare punti Esperienza (XP). Accumulando XP, sbloccherai nuovi titoli e distintivi di saggezza nella tua Libreria.</p>
        <h3>3. Condotta nella Corte</h3>
        <p>Le argomentazioni fornite nei verdetti devono essere rispettose e scritte in un italiano corretto e pertinente. I docenti hanno la facoltà di respingere o penalizzare verdetti non consoni.</p>
        <h3>4. Esplorazione</h3>
        <p>I Regni si sbloccano progressivamente. Completa i fascicoli dell'Inferno per poter poi accedere al Purgatorio e, infine, al Paradiso.</p>
    `
};

function switchMapTab(tabName) {
  document.querySelectorAll('.map-tab').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.map-container').forEach(map => map.style.display = 'none');
  
  // Find clicked button
  if (window.event && window.event.currentTarget) {
      window.event.currentTarget.classList.add('active');
  }
  
  const mapElement = document.getElementById('map-' + tabName);
  if (mapElement) {
      mapElement.style.display = 'block';
  }
}

function goDashboard() {
  if (window.EroiDB && window.EroiDB.cache && window.EroiDB.cache.userProfile) {
    const role = window.EroiDB.cache.userProfile.role || 'student';
    const email = (window.EroiDB.cache.userProfile.email || '').toLowerCase();
    
    if (role === 'admin' || email === 'prof.memmo@gmail.com') {
      showView('view-admin-dashboard');
      loadStudentCases(true);
    } else if (role === 'teacher') {
      showView('view-teacher-dashboard');
    } else if (role === 'external') {
      showView('view-dashboard');
      loadStudentCases(false);
    } else {
      showView('view-dashboard');
      loadStudentCases(false);
    }
  } else {
    // Fallback se DB non è ancora caricato
    showView('view-dashboard');
    loadStudentCases(false);
  }
}

async function selectRole(role) {
  if (!state.user) return;
  
  try {
    let updateData = { role: role };
    
    // Se è studente, validiamo il codice classe
    if (role === 'student') {
        const codeInput = document.getElementById('onboarding-class-code');
        if (codeInput && codeInput.value.trim() !== '') {
            const code = codeInput.value.trim().toUpperCase();
            if (window.EroiDB && window.EroiDB.getClassByCode) {
                const classObj = await window.EroiDB.getClassByCode(code);
                if (!classObj) {
                    alert("Codice Classe non valido. Riprova o chiedi al tuo docente.");
                    return;
                }
                updateData.classCode = code;
                updateData.classId = classObj.id;
            }
        }
    }

    const userDocRef = doc(db, 'users', state.user.uid);
    await updateDoc(userDocRef, updateData);
    
    // Aggiorna cache locale
    if (window.EroiDB && window.EroiDB.cache && window.EroiDB.cache.userProfile) {
        window.EroiDB.cache.userProfile.role = role;
    }
    
    // Mostra nav bar
    const bottomNav = document.getElementById('mobile-bottom-nav');
    if (bottomNav) bottomNav.style.display = 'flex';
    const userMenu = document.getElementById('user-menu-container');
    if (userMenu) userMenu.style.display = 'block';

    // Vai alla dashboard o mappa
    if (role === 'teacher') {
      showView('view-teacher-dashboard');
    } else if (role === 'external') {
      window.goToDashboard();
    } else {
      showView('view-map');
      MapEngine.init();
    }
  } catch (error) {
    console.error("Errore salvataggio ruolo:", error);
    alert("Errore durante la selezione del ruolo.");
  }
}

// Esponi per l'uso nell'HTML
window.showView = showView;
window.app = {
  openEditProfileModal: function() {
    if (!firebase.auth().currentUser) return;
    const modal = document.getElementById('edit-profile-modal');
    const nameInput = document.getElementById('edit-profile-name');
    const schoolGroup = document.getElementById('edit-profile-school-group');
    const schoolInput = document.getElementById('edit-profile-school');
    
    const profile = window.EroiDB && window.EroiDB.cache ? window.EroiDB.cache.userProfile : null;
    if (!profile) return;
    
    const isTeacher = (profile.role === 'teacher' || profile.role === 'admin');
    
    if (isTeacher) {
      schoolGroup.classList.remove('hidden');
      schoolInput.value = profile.school || ''; 
    } else {
      schoolGroup.classList.add('hidden');
    }
    
    nameInput.value = profile.displayName || '';
    modal.classList.remove('hidden');
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
  },

  saveProfileData: async function() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    const nameInput = document.getElementById('edit-profile-name').value.trim();
    const schoolInput = document.getElementById('edit-profile-school').value.trim();
    
    if (!nameInput) {
      alert('Il nome non può essere vuoto.');
      return;
    }
    
    const profile = window.EroiDB && window.EroiDB.cache ? window.EroiDB.cache.userProfile : null;
    if (!profile) return;
    const isTeacher = (profile.role === 'teacher' || profile.role === 'admin');
    
    try {
      const updateData = { displayName: nameInput };
      if (isTeacher) {
        updateData.school = schoolInput;
      }
      await firebase.firestore().collection('users').doc(user.uid).update(updateData);
      
      // Update local cache
      profile.displayName = nameInput;
      if (isTeacher) profile.school = schoolInput;
      
      document.getElementById('edit-profile-modal').classList.add('hidden');
      alert('Profilo aggiornato con successo!');
      
      // Refresh UI
      const headerName = document.getElementById('header-user-name');
      if (headerName) headerName.textContent = nameInput;
      
    } catch (err) {
      console.error(err);
      alert('Errore durante il salvataggio.');
    }
  },
  switchMapTab,
  showView,
  goDashboard,
  selectRole
};

async function loadStudentCases(isAdmin = false) {
  if (isAdmin) {
      const listEl = document.getElementById('admin-cases-list');
      if (!listEl || !EroiDB) return;
      listEl.innerHTML = '<li style="padding: 1rem; text-align: center; color: #888;">Ricerca fascicoli nell\'archivio...</li>';
      try {
        const campaigns = await EroiDB.getCampaigns();
        const activeCamp = campaigns[0];
        const cases = await EroiDB.getCasesByCampaign(activeCamp.id);
        listEl.innerHTML = '';
        cases.forEach(c => {
          const li = document.createElement('li');
          li.style.cssText = "padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);";
          const a = document.createElement('a');
          a.href = "#";
          a.style.cssText = "color: var(--text-primary); text-decoration: none;";
          a.innerHTML = `📕 ${activeCamp.name} - ${c.characterName} (Clicca per avviare)`;
          a.onclick = (e) => {
            e.preventDefault();
            if (window.EroiGame) window.EroiGame.startTrial(c.id);
          };
          li.appendChild(a);
          listEl.appendChild(li);
        });
      } catch (e) {
          console.error(e);
      }
      return;
  }

  // STUDENTE: LOGICA LIBRERIA
  const libraryEl = document.getElementById('library-shelves');
  if (!libraryEl || !EroiDB) return;
  
  libraryEl.innerHTML = '<div style="width: 100%; text-align: center; color: #aaa; font-style: italic; margin-top: 2rem;">Spolverando gli scaffali...</div>';
  
  try {
    const campaigns = await EroiDB.getCampaigns();
    if (campaigns.length === 0) return;
    const activeCamp = campaigns[0];
    const allCases = await EroiDB.getCasesByCampaign(activeCamp.id);
    
    // Recupera casi completati da localStorage o UserProfile
    let completedCaseIds = [];
    if (EroiDB.cache.userProfile && EroiDB.cache.userProfile.completedCases) {
        completedCaseIds = EroiDB.cache.userProfile.completedCases;
    } else {
        completedCaseIds = JSON.parse(localStorage.getItem('completedCases') || '[]');
    }

    // Calcolo XP (100 a caso) e Titolo
    const xp = completedCaseIds.length * 100;
    const maxXP = allCases.length * 100 || 500;
    document.getElementById('user-xp').textContent = `XP: ${xp} / ${maxXP}`;
    
    let title = "Lettore Novizio";
    if (xp >= 100) title = "Lettore Instancabile";
    if (xp >= 300) title = "Custode delle Fonti";
    if (xp >= 500) title = "Conoscitore di Dante";
    if (xp >= 800) title = "Maestro dell'argomentazione";
    if (xp >= 1000) title = "Giudice Imparziale";
    
    document.getElementById('profile-name').textContent = title;

    // Aggiorna Badge
    if (xp >= 100) document.getElementById('badge-lettore').style.opacity = '1';
    if (xp >= 300) document.getElementById('badge-fonti').style.opacity = '1';
    if (xp >= 500) document.getElementById('badge-conoscitore').style.opacity = '1';
    if (xp >= 800) document.getElementById('badge-maestro').style.opacity = '1';
    if (xp >= 1000) document.getElementById('badge-giudice').style.opacity = '1';

    // Disegna Pergamene
    libraryEl.innerHTML = '';
    const completedCases = allCases.filter(c => completedCaseIds.includes(c.id));
    
    if (completedCases.length === 0) {
        libraryEl.innerHTML = '<div style="width: 100%; text-align: center; color: #aaa; font-style: italic; margin-top: 2rem;">Non hai ancora completato alcun fascicolo. Gli scaffali sono vuoti.</div>';
        return;
    }

    completedCases.forEach(c => {
        const scroll = document.createElement('div');
        scroll.style.cssText = "display: flex; flex-direction: column; align-items: center; width: 120px; cursor: pointer; transition: transform 0.2s;";
        scroll.onmouseover = () => scroll.style.transform = 'scale(1.05)';
        scroll.onmouseout = () => scroll.style.transform = 'scale(1)';
        scroll.onclick = () => {
            if (window.EroiGame) window.EroiGame.startTrial(c.id);
        };

        // Mostra l'immagine del personaggio o l'icona pergamena di default
        const imgPath = c.image ? c.image : "assets/Immagini/3.png";
        const imgStyle = c.image ? "width: 70px; height: 70px; object-fit: cover; border-radius: 50%; border: 2px solid var(--accent-gold); margin-bottom: 10px;" : "width: 60px; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.5)); margin-bottom: 10px;";
        
        scroll.innerHTML = `
            <img src="${imgPath}" alt="${c.characterName}" style="${imgStyle}">
            <div style="text-align: center; width: 100%; margin-top: 5px;">
                <span style="color: var(--accent-gold); font-size: 0.8rem; font-weight: bold; display: block; line-height: 1.1;">${c.characterName}</span>
                <span style="color: #ccc; font-size: 0.7rem;">${c.canto}</span>
            </div>
        `;
        libraryEl.appendChild(scroll);
    });

  } catch (e) {
    console.error("Errore libreria", e);
  }
}

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
});

window.switchTeacherTab = function(tabName) {
    // Nascondi tutti i tab content
    document.querySelectorAll('.teacher-tab-content').forEach(el => {
        el.style.display = 'none';
    });
    
    // Ripristina lo stile di tutti i bottoni tab
    document.querySelectorAll('#view-teacher-dashboard .btn.map-tab').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '#4a4a4a';
        btn.style.color = '#888';
        btn.style.border = '1px solid #333';
    });
    
    // Mostra il tab selezionato
    const activeTab = document.getElementById('t-tab-' + tabName);
    if (activeTab) {
        activeTab.style.display = 'block';
    }
    
    // Evidenzia il bottone corrispondente
    const activeBtn = document.getElementById('tab-btn-' + tabName);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = 'var(--accent-crimson)';
        activeBtn.style.color = 'white';
        activeBtn.style.border = '2px solid #fff';
    }
};

// --- LOGICA TEACHER DASHBOARD ---
import { firebaseConfig, initializeApp, getAuth } from "./firebase-config.js";

window.TeacherDashboard = {
  init: async function() {
    console.log("Init Teacher Dashboard");
    this.switchTab('panoramica'); // Default tab
    this.selectStatsCategory('classes'); // Default stats panel
    await this.renderClasses();
    this.bindEvents();
  },

  switchTab: function(tabId) {
    // Rimuovi active dai bottoni
    const btns = document.querySelectorAll('.tabs-header .tab-btn');
    btns.forEach(btn => {
      btn.classList.remove('active');
      btn.style.borderBottom = 'none';
      btn.style.color = '#888';
    });
    const activeBtn = document.getElementById('t-btn-' + tabId);
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.style.borderBottom = '2px solid var(--accent-gold)';
      activeBtn.style.color = 'var(--accent-gold)';
    }

    // Nascondi tutti i tab content
    const contents = document.querySelectorAll('.teacher-tab-content');
    contents.forEach(c => c.style.display = 'none');
    
    // Mostra quello corretto
    const target = document.getElementById('t-tab-' + tabId);
    if (target) {
      target.style.display = 'block';
    }
  },

  selectStatsCategory: function(category) {
    // Aggiorna styling card
    const cards = document.querySelectorAll('.stat-card-interactive');
    cards.forEach(card => {
      card.classList.remove('active');
      card.style.border = '1px solid #333';
      card.style.background = '#111';
    });
    
    const activeCard = document.getElementById('card-stats-' + category);
    if (activeCard) {
      activeCard.classList.add('active');
      activeCard.style.border = '1px solid var(--accent-gold)';
      activeCard.style.background = '#1a1a1a';
    }

    // Nascondi sottomenu panoramica
    const subPanels = document.querySelectorAll('.panoramica-sub-panel');
    subPanels.forEach(p => p.style.display = 'none');
    
    const targetPanel = document.getElementById('panel-stats-' + category);
    if (targetPanel) {
      targetPanel.style.display = 'block';
    }
  },

  renderClasses: async function() {
    if (!state.user) return;
    const classes = await EroiDB.getTeacherClasses(state.user.email);
    
    // Popola select classe
    const selectStudentClass = document.getElementById('new-student-class');
    if (selectStudentClass) {
        selectStudentClass.innerHTML = classes.length ? '' : '<option disabled>Crea prima una classe</option>';
        classes.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name + " (" + c.id + ")";
            selectStudentClass.appendChild(opt);
        });
    }

    // Popola lista iscritti globale
    const listContainer = document.getElementById('teacher-students-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = ''; 
    let totalStudents = 0;
    
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.textAlign = 'left';
    table.innerHTML = `
              <tr style="border-bottom: 1px solid var(--border-color); color: var(--accent-gold);">
                <th style="cursor:pointer; padding: 10px;" onclick="window.sortTeacherStudents('name')"><div style="display: flex; align-items: center; white-space: nowrap;">Nome <i class="fa-solid fa-sort" style="margin-left:5px; font-size:0.8em; color:#888;"></i></div></th>
                <th style="cursor:pointer; padding: 10px;" onclick="window.sortTeacherStudents('email')"><div style="display: flex; align-items: center; white-space: nowrap;">Email <i class="fa-solid fa-sort" style="margin-left:5px; font-size:0.8em; color:#888;"></i></div></th>
                <th style="cursor:pointer; padding: 10px;" onclick="window.sortTeacherStudents('class')"><div style="display: flex; align-items: center; white-space: nowrap;">Classe <i class="fa-solid fa-sort" style="margin-left:5px; font-size:0.8em; color:#888;"></i></div></th>
                <th style="cursor:pointer; padding: 10px;" onclick="window.sortTeacherStudents('level')"><div style="display: flex; align-items: center; white-space: nowrap;">Livello <i class="fa-solid fa-sort" style="margin-left:5px; font-size:0.8em; color:#888;"></i></div></th>
                <th style="cursor:pointer; padding: 10px;" onclick="window.sortTeacherStudents('date')"><div style="display: flex; align-items: center; white-space: nowrap;">Data Iscrizione <i class="fa-solid fa-sort" style="margin-left:5px; font-size:0.8em; color:#888;"></i></div></th>
                <th style="padding: 10px;"></th>
              </tr>
            `;

        let allStudents = [];
        for (let c of classes) {
            const students = await EroiDB.getStudentsByClass(c.id);
            students.forEach(s => {
                s.className = c.name;
                allStudents.push(s);
            });
        }
        totalStudents = allStudents.length;

        // Sort
        const state = window.teacherStudentsSort || { col: 'date', asc: false };
        allStudents.sort((a, b) => {
            let valA, valB;
            if (state.col === 'name') { valA = (a.displayName || a.name || '').toLowerCase(); valB = (b.displayName || b.name || '').toLowerCase(); }
            else if (state.col === 'email') { valA = (a.email || '').toLowerCase(); valB = (b.email || '').toLowerCase(); }
            else if (state.col === 'class') { valA = (a.className || '').toLowerCase(); valB = (b.className || '').toLowerCase(); }
            else if (state.col === 'level') { valA = a.level || 0; valB = b.level || 0; }
            else if (state.col === 'date') { 
                valA = a.createdAt ? new Date(a.createdAt).getTime() : 0; 
                valB = b.createdAt ? new Date(b.createdAt).getTime() : 0; 
            }
            else { valA = (a.displayName || a.name || '').toLowerCase(); valB = (b.displayName || b.name || '').toLowerCase(); }
            
            if (valA < valB) return state.asc ? -1 : 1;
            if (valA > valB) return state.asc ? 1 : -1;
            return 0;
        });

        allStudents.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 10px;">${s.displayName || s.name}</td>
                <td style="padding: 10px; color: #aaa;">${s.email}</td>
                <td style="padding: 10px;">${s.className}</td>
                <td style="padding: 10px;">${s.level || 1}</td>
                <td style="padding: 10px; color: #888; font-size: 0.8rem;">${s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td style="padding: 10px; text-align: right;"><a href="mailto:${s.email}" title="Scrivi a ${s.displayName || s.name}" style="color:var(--accent-gold); text-decoration:none;"><i class="fa-solid fa-envelope"></i></a></td>
            `;
            table.appendChild(tr);
        });

    if (totalStudents > 0) {
        listContainer.style.background = 'transparent';
        listContainer.appendChild(table);
    } else {
        listContainer.innerHTML = '<p style="color: #888; font-style: italic; text-align: center;">Nessuno studente iscritto al momento.</p>';
    }

    // Aggiorna contatori
    const classBadge = document.getElementById('teacher-stats-classes');
    if (classBadge) classBadge.textContent = classes.length;
    
    const studentBadge = document.getElementById('teacher-stats-students');
    if (studentBadge) studentBadge.textContent = totalStudents;

    // --- LOGICA COLLABORATORI ---
    const colleagueEmails = new Set();
    classes.forEach(c => {
      if (c.teacher && c.teacher !== state.user.email) colleagueEmails.add(c.teacher);
      if (c.collaborators) {
        c.collaborators.forEach(email => {
          if (email !== state.user.email) colleagueEmails.add(email);
        });
      }
    });

    const docentiBadge = document.getElementById('teacher-stats-docenti');
    if (docentiBadge) docentiBadge.textContent = colleagueEmails.size;

    const tbodyDocenti = document.querySelector('#teacher-docenti-table tbody');
    if (tbodyDocenti) {
        tbodyDocenti.innerHTML = '';
        if (colleagueEmails.size === 0) {
            tbodyDocenti.innerHTML = `<tr><td style="padding: 10px; text-align: left; color: #888;"><i>Nessun collega associato.</i></td></tr>`;
        } else {
            colleagueEmails.forEach(email => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td style="padding: 10px; color: #ddd;">${email}</td>`;
                tbodyDocenti.appendChild(tr);
            });
        }
    }
  },

  bindEvents: function() {
    const self = this;
    // Crea Studente
    const formStudent = document.getElementById('form-create-student');
    if (formStudent && !formStudent.hasAttribute('data-bound')) {
        formStudent.setAttribute('data-bound', 'true');
        formStudent.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-save-new-student');
            const name = document.getElementById('new-student-name').value;
            const email = document.getElementById('new-student-email').value;
            const classId = document.getElementById('new-student-class').value;

            if (!classId) return alert("Crea prima una classe!");
            btn.disabled = true;
            btn.textContent = 'Creazione...';

            try {
                const secondaryApp = initializeApp(firebaseConfig, "Secondary");
                const secondaryAuth = getAuth(secondaryApp);
                const defaultPassword = name.toLowerCase().replace(/\\s+/g, '') + "123";

                const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, defaultPassword);
                
                await setDoc(doc(db, 'users', userCred.user.uid), {
                  uid: userCred.user.uid,
                  email: email,
                  displayName: name,
                  xp: 0,
                  level: 1,
                  role: 'student',
                  classId: classId
                });

                await secondaryAuth.signOut();

                alert("Studente creato con successo!\\nEmail: " + email + "\\nPassword: " + defaultPassword);
                formStudent.reset();
                self.renderClasses();
            } catch (err) {
                console.error(err);
                alert("Errore: " + err.message);
            } finally {
                btn.disabled = false;
                btn.textContent = 'Aggiungi';
            }
        });
    }

    // Crea Classe
    const formClass = document.getElementById('form-create-class');
    if (formClass && !formClass.hasAttribute('data-bound')) {
        formClass.setAttribute('data-bound', 'true');
        formClass.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.querySelector('#form-create-class input[placeholder*="Codice"]').value.trim().toUpperCase();
            const name = document.querySelector('#form-create-class input[placeholder*="Nome esteso"]').value.trim();
            
            if (!id || !name) return alert("Inserisci codice e nome classe.");

            try {
                await EroiDB.saveClass({
                    id: id,
                    name: name,
                    teacher: state.user.email,
                    createdAt: new Date().toISOString()
                });
                alert("Classe creata con successo!");
                formClass.reset();
                self.renderClasses();
            } catch (err) {
                alert("Errore creazione classe: " + err.message);
            }
        });
    }

    // Join Collaborator
    const formJoin = document.getElementById('form-join-collaborator');
    if (formJoin && !formJoin.hasAttribute('data-bound')) {
        formJoin.setAttribute('data-bound', 'true');
        formJoin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const classId = document.getElementById('join-collaborator-code').value.trim().toUpperCase();
            if (!classId) return alert("Inserisci il codice fascicolo classe.");

            try {
                const success = await EroiDB.joinClassAsCollaborator(classId, state.user.email);
                if (success) {
                    alert("Sei stato aggiunto come collaboratore alla classe!");
                    formJoin.reset();
                    self.renderClasses();
                }
            } catch (err) {
                alert("Errore: " + err.message);
            }
        });
    }
  }
};


window.switchAdminTab = function(tabName) {
    ['utenti', 'scuole', 'sistema', 'fascicoli'].forEach(id => {
        const btn = document.getElementById('a-btn-' + id);
        if (btn) {
            btn.classList.remove('active');
            btn.style.borderBottom = 'none';
            btn.style.color = '#888';
        }
        const tab = document.getElementById('a-tab-' + id);
        if (tab) tab.style.display = 'none';
    });
    
    const btnActive = document.getElementById('a-btn-' + tabName);
    if (btnActive) {
        btnActive.classList.add('active');
        btnActive.style.borderBottom = '2px solid var(--accent-gold)';
        btnActive.style.color = 'var(--accent-gold)';
    }
    const tabActive = document.getElementById('a-tab-' + tabName);
    if (tabActive) tabActive.style.display = 'block';
    
    if (tabName === 'utenti') {
        loadAdminUsers();
    } else if (tabName === 'scuole') {
        renderAdminSchoolsList();
    }
};

window.renderAdminSchoolsList = async function() {
    const list = document.getElementById('admin-schools-list');
    if (!list) return;
    
    list.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center; color: #888;">Caricamento scuole in corso...</td></tr>';
    
    try {
        const users = await EroiDB.getAllUsers();
        const schoolsMap = new Map();
        
        users.forEach(u => {
            if (u.role === 'teacher' && u.school) {
                const schoolName = u.school.trim();
                if (!schoolsMap.has(schoolName)) {
                    schoolsMap.set(schoolName, {
                        name: schoolName,
                        city: u.city || 'N/A',
                        referentName: u.displayName || u.name || 'Sconosciuto',
                        referentEmail: u.email
                    });
                }
            }
        });

        if (schoolsMap.size === 0) {
            list.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center; color: #888;">Nessuna scuola registrata.</td></tr>';
            return;
        }

        let html = '';
        Array.from(schoolsMap.values()).forEach(s => {
            html += `
              <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 10px; font-weight: bold; color: var(--accent-gold);">${s.name}</td>
                <td style="padding: 10px; color: #ccc;">${s.city}</td>
                <td style="padding: 10px;">${s.referentName}</td>
                <td style="padding: 10px; text-align: right;">
                    <a href="mailto:${s.referentEmail}" title="Scrivi al referente ${s.referentName}" class="btn" style="background: rgba(255,255,255,0.1); color: var(--accent-gold); padding: 5px 10px; border-radius: 5px; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
                        <i class="fa-solid fa-envelope"></i> Contatta
                    </a>
                </td>
              </tr>
            `;
        });
        list.innerHTML = html;
    } catch (e) {
        console.error("Errore renderAdminSchoolsList", e);
        list.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center; color: red;">Errore caricamento scuole</td></tr>';
    }
};

window.sortAdminUsers = function(col) {
    if (!window.adminUsersSort) window.adminUsersSort = { col: 'date', asc: false };
    if (window.adminUsersSort.col === col) {
        window.adminUsersSort.asc = !window.adminUsersSort.asc;
    } else {
        window.adminUsersSort.col = col;
        window.adminUsersSort.asc = true;
    }
    window.loadAdminUsers();
};

window.sortTeacherStudents = function(col) {
    if (!window.teacherStudentsSort) window.teacherStudentsSort = { col: 'date', asc: false };
    if (window.teacherStudentsSort.col === col) {
        window.teacherStudentsSort.asc = !window.teacherStudentsSort.asc;
    } else {
        window.teacherStudentsSort.col = col;
        window.teacherStudentsSort.asc = true;
    }
    if (window.TeacherDashboard) window.TeacherDashboard.renderClasses();
};

window.loadAdminUsers = async function() {
    const list = document.getElementById('admin-users-list');
    if (!list) return;
    
    list.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center; color: #888;">Caricamento in corso...</td></tr>';
    
    try {
        const users = await EroiDB.getAllUsers();
        if (!users || users.length === 0) {
            list.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center; color: #888;">Nessun utente trovato</td></tr>';
            return;
        }
        
        let html = '';
        const state = window.adminUsersSort || { col: 'date', asc: false };
        users.sort((a, b) => {
            let valA, valB;
            if (state.col === 'email') { valA = (a.email || '').toLowerCase(); valB = (b.email || '').toLowerCase(); }
            else if (state.col === 'role') { valA = (a.role || '').toLowerCase(); valB = (b.role || '').toLowerCase(); }
            else if (state.col === 'date') { 
                valA = a.createdAt ? new Date(a.createdAt).getTime() : 0; 
                valB = b.createdAt ? new Date(b.createdAt).getTime() : 0; 
            }
            else { valA = (a.email || '').toLowerCase(); valB = (b.email || '').toLowerCase(); }
            
            if (valA < valB) return state.asc ? -1 : 1;
            if (valA > valB) return state.asc ? 1 : -1;
            return 0;
        });

        users.forEach(u => {
            html += `
              <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 10px;">
                    <strong>${u.email || 'Anonimo'}</strong>
                    ${u.classCode ? `<br><span style="font-size:0.7rem; color: var(--accent-gold);">Classe: ${u.classCode}</span>` : ''}
                </td>
                <td style="padding: 10px; text-transform: uppercase; font-size: 0.8rem;">
                    ${u.role === 'admin' ? '<span style="color:var(--accent-crimson)">Admin</span>' : (u.role === 'teacher' ? '<span style="color:var(--accent-gold)">Docente</span>' : '<span style="color:#888">Studente</span>')}
                </td>
                <td style="padding: 10px; font-size: 0.8rem; color: #888;">${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td style="padding: 10px; text-align: right;">
                    <a href="mailto:${u.email}" title="Scrivi a ${u.email}" style="color:var(--accent-gold); margin-right:10px; text-decoration:none;"><i class="fa-solid fa-envelope"></i></a>
                    <select class="input-form" style="padding: 5px; font-size: 0.75rem;" onchange="window.updateUserRole('${u.id}', this.value)">
                        <option value="student" ${u.role === 'student' ? 'selected' : ''}>Studente</option>
                        <option value="teacher" ${u.role === 'teacher' ? 'selected' : ''}>Docente</option>
                        <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
              </tr>
            `;
        });
        list.innerHTML = html;
    } catch (e) {
        console.error("Errore loadAdminUsers", e);
        list.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center; color: red;">Errore caricamento utenti</td></tr>';
    }
};

window.updateUserRole = async function(uid, newRole) {
    if (confirm("Sei sicuro di voler cambiare il ruolo di questo utente?")) {
        try {
            await EroiDB.updateUserRole(uid, newRole);
            alert("Ruolo aggiornato!");
            loadAdminUsers();
        } catch (e) {
            alert("Errore aggiornamento ruolo: " + e.message);
        }
    } else {
        loadAdminUsers(); // reset UI
    }
};


window.showContattiModal = function() {
    const modal = document.getElementById('legal-modal');
    const content = document.getElementById('legal-text-container');
    if (!modal || !content) return;
    
    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <h2 style="color: var(--accent-gold); font-family: 'Cinzel', serif; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">📧 Contatti</h2>
        <div style="padding: 16px; background: rgba(212,175,55,0.08); border-left: 4px solid var(--accent-gold); border-radius: 8px;">
          <h4 style="color: var(--accent-gold); margin-bottom: 8px;">Scopri il mondo Prof. Memmo</h4>
          <p style="color: #666; font-size: 0.9rem; margin-bottom: 10px;"><a href="https://prof-memmo.github.io/games/" target="_blank" style="color: var(--accent-gold); font-weight: bold; text-decoration: underline;">Visita il sito</a> per scoprire i materiali, i giochi e la filosofia, oppure <a href="https://prof-memmo.github.io/games/condividi-esperienza.html" target="_blank" style="color: var(--accent-gold); font-weight: bold; text-decoration: underline;">condividi la tua esperienza</a> lasciando commenti e feedback tramite il modulo!</p>
          <div style="display: flex; align-items: center; gap: 10px; color: var(--accent-gold); font-weight: bold;">
            <i class="fa-solid fa-envelope"></i> <span>prof.memmo@gmail.com</span>
          </div>
          <div style="margin-top: 1rem; display: flex; align-items: center; gap: 10px;">
            <span style="font-weight: 600; color: #333;">Seguimi sui social:</span>
            <a href="https://www.instagram.com/prof.memmo_games?igsh=MW5pNHY3dHBxMHEyag%3D%3D&utm_source=qr" target="_blank" style="color: #E1306C; font-size: 2.2rem; display: inline-flex; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                <i class="fa-brands fa-instagram"></i>
            </a>
          </div>
        </div>
        <div style="padding: 16px; background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.1); border-radius: 8px;">
          <h4 style="color: #333; margin-bottom: 12px; font-size: 0.95rem;">Invia un Messaggio</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <input type="text" id="contact-modal-name" placeholder="Il tuo nome" class="input-form" style="padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px;">
            <input type="email" id="contact-modal-email" placeholder="La tua email" class="input-form" style="padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px;">
            <select id="contact-modal-topic" class="input-form" style="padding: 8px 12px; background-color: #fff; border: 1px solid #ccc; border-radius: 4px;">
                <option value="" disabled selected style="color: #888;">Tipologia della comunicazione...</option>
                <option value="Richiesta di informazioni" style="color: black;">Richiesta di informazioni</option>
                <option value="Opinioni" style="color: black;">Opinioni</option>
                <option value="Altro" style="color: black;">Altro</option>
            </select>
            <textarea id="contact-modal-message" placeholder="Come posso aiutarti?" class="input-form" style="height: 80px; resize: none; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
            <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 0.8rem; color: #555; cursor: pointer;">
              <input type="checkbox" id="contact-modal-check" style="margin-top: 2px;">
              <span>Ho almeno 16 anni o sono sotto supervisione di un adulto. Accetto la 
                <a href="#" onclick="event.preventDefault(); window.showLegal('privacy')" style="color: var(--accent-gold);">Privacy Policy</a> e i 
                <a href="#" onclick="event.preventDefault(); window.showLegal('terms')" style="color: var(--accent-gold);">Termini</a>.
              </span>
            </label>
            <button class="btn btn-primary" style="width: 100%; padding: 10px;" onclick="window.submitContattiModal()">
              <i class="fa-solid fa-paper-plane"></i> Invia Messaggio
            </button>
          </div>
        </div>
      </div>
    `;
    modal.classList.remove('hidden');
};

window.submitContattiModal = function() {
    const name = document.getElementById('contact-modal-name')?.value.trim();
    const email = document.getElementById('contact-modal-email')?.value.trim();
    const topic = document.getElementById('contact-modal-topic')?.value;
    const message = document.getElementById('contact-modal-message')?.value.trim();
    const check = document.getElementById('contact-modal-check')?.checked;
    if (!name || !email || !topic || !message) { alert('Compila tutti i campi, compresa la tipologia.'); return; }
    if (!check) { alert('Devi accettare la Privacy Policy e i Termini.'); return; }
    
    // Mostriamo un toast di successo
    alert('Messaggio inviato! Ti risponderemo presto.');
    document.getElementById('legal-modal').classList.add('hidden');
};
