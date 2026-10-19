import { auth, db, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, doc, getDoc, setDoc, updateDoc } from './firebase-config.js';
import EroiDB from "./db.js";
import { EroiGame } from "./game.js";
import { MapEngine } from "./map.js";
import { CommediaTrials } from "./trials.js";

// Stato dell'applicazione
const state = {
  user: null,
  currentPhase: 1,
  currentCaseId: null
};

// Gestione delle Viste (SPA manuale)
async function showView(viewId) {
  const publicViews = ['view-login', 'view-regolamento'];
  const isPublic = publicViews.includes(viewId);

  // Se l'utente non è in memory, tenta recupero da sessione locale prima di forzare il login
  if (!state.user) {
    try {
      const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (stored && stored.email) {
        state.user = { email: stored.email, uid: stored.uid || 'admin-local', displayName: stored.name || 'Prof. Memmo' };
      }
    } catch(e) {}
    if (!state.user && localStorage.getItem('adminLoggedIn') === 'true') {
      state.user = { email: 'prof.memmo@gmail.com', uid: 'admin-local', displayName: 'Prof. Memmo' };
    }
  }

  // Se l'utente non è autenticato e la vista è privata, forza il login
  if (!state.user && !isPublic) {
    viewId = 'view-login';
  }

  const isFinalPublic = publicViews.includes(viewId);
  if (window.HubSubscriptionGuard) {
    if (isFinalPublic) {
      window.HubSubscriptionGuard.hideBlockOverlay();
    } else {
      let checkUser = state.user;
      const profile = (window.EroiDB && window.EroiDB.cache) ? window.EroiDB.cache.userProfile : null;
      const role = profile ? profile.role : 'student';

      if (role === 'student' && profile && profile.teacherId) {
        checkUser = { ...state.user, uid: profile.teacherId, email: profile.teacherEmail };
      }

      try {
        const isAllowed = await window.HubSubscriptionGuard.verifyAccess({
          user: checkUser,
          role: role,
          isPublicView: false
        });
        if (!isAllowed) {
          document.documentElement.classList.remove('corte-pre-auth');
          return; // Interrompi: blocco attivo, la vista protetta non viene attivata
        }
      } catch (errGuard) {
        console.warn("HubSubscriptionGuard check error (fallback procedi):", errGuard);
      }
    }
  }

  document.documentElement.classList.remove('corte-pre-auth');
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
  
  if (viewId === 'view-regolamento') {
    if (window.CommediaRulesService) {
      window.CommediaRulesService.renderPublicView();
    }
    let currentRole = 'student';
    if (window.EroiDB && window.EroiDB.cache && window.EroiDB.cache.userProfile) {
        currentRole = window.EroiDB.cache.userProfile.role || 'student';
    }
    const isStudent = (currentRole === 'student' || currentRole === 'admin');
    const isTeacher = (currentRole === 'teacher' || currentRole === 'admin');
    const isExternal = (currentRole === 'external' || currentRole === 'admin');
    
    const regStudente = document.getElementById('reg-studente');
    const regDocente = document.getElementById('reg-docente');
    const regPellegrino = document.getElementById('reg-pellegrino');
    
    if (regStudente) regStudente.style.display = isStudent ? 'block' : 'none';
    if (regDocente) regDocente.style.display = isTeacher ? 'block' : 'none';
    if (regPellegrino) regPellegrino.style.display = isExternal ? 'block' : 'none';
  }
}

// Elementi DOM
const loginGoogleBtn = document.getElementById('login-google-btn');
const loginEmailBtn = document.getElementById('login-email-btn');
const ageCheck = document.getElementById('age-check');
const privacyCheck = document.getElementById('privacy-check');
const logoutBtn = document.getElementById('logout-btn');
const welcomeMessage = document.getElementById('welcome-message');

// Abilitazione dei bottoni in base alle checkbox (se presenti)
function updateLoginButtons() {
  if (!ageCheck || !privacyCheck) return;
  const isChecked = ageCheck.checked && privacyCheck.checked;
  if (loginGoogleBtn) loginGoogleBtn.disabled = !isChecked;
  if (loginEmailBtn) loginEmailBtn.disabled = !isChecked;
}
if (ageCheck) ageCheck.addEventListener('change', updateLoginButtons);
if (privacyCheck) privacyCheck.addEventListener('change', updateLoginButtons);

// Controllo del risultato del redirect (se veniamo da un login su Safari)
getRedirectResult(auth).catch((error) => {
  console.error("Errore di login da redirect", error);
});

// Event Listeners Autenticazione legacy
if (loginGoogleBtn) {
  loginGoogleBtn.addEventListener('click', async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Errore avvio login Google", error);
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        alert("Errore login: " + error.message);
      }
    }
  });
}

if (loginEmailBtn) {
  loginEmailBtn.addEventListener('click', async () => {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const email = emailInput ? emailInput.value : '';
    const password = passInput ? passInput.value : '';
    if (!email || !password) {
      alert("Inserisci email e password.");
      return;
    }
    
    const originalText = loginEmailBtn.textContent;
    loginEmailBtn.textContent = 'Accesso in corso...';
    loginEmailBtn.disabled = true;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Errore email login", error);
      alert("Errore: " + error.message);
    } finally {
      loginEmailBtn.textContent = originalText;
      loginEmailBtn.disabled = false;
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    try {
      localStorage.removeItem('corte_user');
      document.documentElement.classList.remove('corte-pre-auth');
    } catch(e) {}
    signOut(auth);
  });
}

onAuthStateChanged(auth, async (user) => {
  if (state.user && state.user.uid && state.user.uid.startsWith("mock-")) return; // ignora se è un account mock già loggato
  state.user = user;
  window.app.user = user;
  
  if (user) {
    const userEmail = user.email ? user.email.toLowerCase() : '';
    let isSuperAdmin = (userEmail === 'prof.memmo@gmail.com');
    let hubRole = 'student';
    let hubName = user.displayName || 'Giudice';
    let hubAvatar = '';

    // 1. Verifica sull'Hub Centrale (Single Sign-On Auth)
    try {
      const hubDocRef = doc(db, 'hub_users', user.uid);
      const hubDoc = await getDoc(hubDocRef);
      if (hubDoc.exists()) {
        const hubData = hubDoc.data();
        if (hubData.role === 'admin' || isSuperAdmin) {
          isSuperAdmin = true;
          hubRole = 'admin';
        } else if (hubData.role === 'docente') {
          hubRole = 'teacher';
        } else if (hubData.role === 'viandante' || hubData.role === 'forestiero') {
          hubRole = 'external';
        } else {
          hubRole = 'student';
        }
        if (hubData.anagrafica && hubData.anagrafica.nome) {
          hubName = hubData.anagrafica.nome;
        }
        if (hubData.avatar || (hubData.anagrafica && hubData.anagrafica.avatar)) {
          hubAvatar = hubData.avatar || hubData.anagrafica.avatar;
        }
        if (!isSuperAdmin && hubData.statusAccount && (hubData.statusAccount === 'rejected' || hubData.statusAccount === 'suspended')) {
          alert("Accesso negato: L'account è stato sospeso nell'Hub.");
          window.location.href = 'https://prof-memmo.github.io/prof-memmo-gestione-siti/portal.html';
          return;
        }
      } else {
        hubRole = isSuperAdmin ? 'admin' : 'student';
      }
    } catch (err) {
      console.warn("Verifica Hub (fallback locale):", err);
      hubRole = isSuperAdmin ? 'admin' : 'student';
    }

    if (welcomeMessage) welcomeMessage.textContent = `Bentornato, Giudice ${hubName}`;
    
    // Mostra il menu utente
    const userMenu = document.getElementById('user-menu-container');
    if (userMenu) userMenu.style.display = 'block';
    
    const headerName = document.getElementById('header-user-name');
    if (headerName) headerName.textContent = hubName;
    
    // Mostra header, nav e footer
    const mainHeader = document.getElementById('main-app-header');
    if (mainHeader) mainHeader.style.display = 'flex';
    const bottomNav = document.getElementById('mobile-bottom-nav');
    if (bottomNav) bottomNav.style.display = 'flex';
    const mainFooter = document.getElementById('main-footer');
    if (mainFooter) mainFooter.style.display = 'flex';
    
    // Leggi Profilo dal database tramite EroiDB
    let role = isSuperAdmin ? 'admin' : hubRole;
    try {
      if (EroiDB) {
        let profile = await EroiDB.getUserProfile(user.uid);
        if (!profile) {
          profile = {
            uid: user.uid,
            email: userEmail,
            displayName: hubName,
            role: role,
            xp: 0,
            fiorini: 50,
            level: 1,
            completedCases: []
          };
          try {
            await setDoc(doc(db, "users", user.uid), profile);
            EroiDB.cache.userProfile = profile;
          } catch(errSet) {
            console.warn("Impossibile salvare profilo locale iniziale:", errSet);
          }
        } else {
          role = profile.role || role;
        }
        
        if (isSuperAdmin) {
          role = 'admin';
          if (profile && profile.role !== 'admin') {
            try {
              await window.EroiDB.updateUserRole(user.uid, 'admin');
              profile.role = 'admin';
            } catch(e) {}
          }
        }
        
        const xp = profile ? (profile.xp || 0) : 0;
        const xpText = `XP: ${xp} / 500`;
        
        const xpSpan = document.getElementById('user-xp');
        if (xpSpan) xpSpan.textContent = xpText;
        
        const dropdownXp = document.getElementById('dropdown-user-xp');
        if (dropdownXp) dropdownXp.textContent = `${xp} XP`;
        
        const hAvatarImg = document.getElementById('header-user-avatar-img');
        const userAvatar = (profile && profile.avatar) || hubAvatar || user.photoURL || 'assets/avatars/6.png';
        if (profile) profile.avatar = userAvatar;
        if (hAvatarImg) {
          hAvatarImg.src = userAvatar;
        }
        
        window.app.profile = profile;
        try {
          localStorage.setItem('corte_user', JSON.stringify({
            uid: user.uid,
            email: userEmail,
            name: hubName,
            avatar: userAvatar,
            role: role
          }));
        } catch(e) {}
      }
    } catch (e) {
      console.warn("Impossibile caricare il profilo.", e);
    }
    
    const navLabel = document.getElementById('nav-dashboard-label');
    if (navLabel) {
      if (role === 'teacher' || role === 'admin' || isSuperAdmin) {
        navLabel.textContent = 'Loggia';
      } else {
        navLabel.textContent = 'Fascicoli';
      }
    }
    
    // Routing in base al ruolo
    if (isSuperAdmin || role === 'admin' || role === 'teacher') {
      showView('view-teacher-dashboard');
      
      // Mostra il bottone LIM nella bottom bar per i docenti
      const dossierNav = document.getElementById('nav-item-dossier');
      if (dossierNav) dossierNav.style.display = 'block';
      
      const adminNav = document.getElementById('nav-item-admin');
      if (adminNav) {
          if (isSuperAdmin || role === 'admin') {
              adminNav.style.display = 'block';
          } else {
              adminNav.style.display = 'none';
          }
      }
      
      if (window.commediaApp && window.commediaApp.trialsEngine) {
          window.commediaApp.trialsEngine.populateTeacherDossier();
      }
      
      if (window.TeacherDashboard) window.TeacherDashboard.init();
      if (window.MapEngine) window.MapEngine.init();
    } else if (role === 'external') {
      window.goToDashboard();
      if (window.MapEngine) window.MapEngine.init();
    } else {
      window.goToDashboard();
      if (window.MapEngine) window.MapEngine.init();
    }

  } else {
    try {
      localStorage.removeItem('corte_user');
      document.documentElement.classList.remove('corte-pre-auth');
    } catch(e) {}
    // Nascondi il menu utente, header, nav e footer
    const userMenu = document.getElementById('user-menu-container');
    if (userMenu) userMenu.style.display = 'none';
    
    const mainHeader = document.getElementById('main-app-header');
    if (mainHeader) mainHeader.style.display = 'none';
    const bottomNav = document.getElementById('mobile-bottom-nav');
    if (bottomNav) bottomNav.style.display = 'none';
    const mainFooter = document.getElementById('main-footer');
    if (mainFooter) mainFooter.style.display = 'flex';
    
    showView('view-login');
  }
});

// Funzione globale per la Dashboard
window.goToDashboard = function(isAdmin = false) {
    if (!state.user) {
        showView('view-login');
        return;
    }
    const profile = EroiDB && EroiDB.cache ? EroiDB.cache.userProfile : null;
    const role = profile ? profile.role : 'student';
    const userEmail = state.user.email ? state.user.email.toLowerCase() : '';
    
    if (userEmail === 'prof.memmo@gmail.com' || role === 'admin' || role === 'teacher') {
      if (isAdmin && (userEmail === 'prof.memmo@gmail.com' || role === 'admin')) {
        showView('view-admin-dashboard');
      } else {
        showView('view-teacher-dashboard');
        if (window.TeacherDashboard) window.TeacherDashboard.init();
      }
      if (window.MapEngine) window.MapEngine.init(); // Initialize map for admin/teachers too
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
        <p>Il titolare del trattamento è Guglielmo Piersanti, contattabile all'indirizzo email: <a href="mailto:prof.memmo@gmail.com" style="color:var(--accent-gold);">prof.memmo@gmail.com</a></p>
        <h3>2. Finalità dell'app</h3>
        <p>"La Corte della Commedia" è un'app didattica, utilizzata a scopo educativo e ludico e senza fini di lucro.</p>
        <h3>3. Dati raccolti</h3>
        <p>L'app può raccogliere i seguenti dati personali: indirizzo e-mail; informazioni di utilizzo relative ai giochi online (punteggi, attività didattiche ecc.); messaggio inviato tramite modulo di contatto; dati tecnici forniti automaticamente dalla piattaforma (es. tipo di dispositivo, dati di log)</p>
        <h3>4. Finalità del trattamento</h3>
        <p>I dati vengono trattati esclusivamente per consentire l'accesso all'app e alle sue funzionalità, gestire l'esperienza didattica e le classifiche interne, migliorare il funzionamento del servizio, rispondere alle richieste inviate tramite il modulo di contatto, fornire assistenza o informazioni richieste dall'utente. Non vengono utilizzati per scopi commerciali o pubblicitari.</p>
        <h3>5. Base giuridica</h3>
        <p>Il trattamento dei dati si basa sull'utilizzo dell'app e sul consenso dell'utente.</p>
        <h3>6. Conservazione dei dati</h3>
        <p>I dati sono trattati in modo lecito e sicuro. Non vengono venduti né ceduti a terzi. Sono mantenuti solo per il tempo necessario al funzionamento didattico dell'app o su richiesta o in maniera autonoma tramite il profilo utente, salvo obblighi di legge. Vengono utilizzati servizi terzi per l'archiviazione dei dati (Firebase).</p>
        <h3>8. Diritti dell'utente</h3>
        <p>L'utente può richiedere in qualsiasi momento: accesso ai propri dati, rettifica o cancellazione, limitazione del trattamento, revoca del consenso. Per esercitare questi diritti, è possibile contattare il titolare all'indirizzo email sopra indicato.</p>
        <h3>9. Cookie</h3>
        <p>Il sito non utilizza cookie di profilazione.</p>
        <h3>9. Utenti minori</h3>
        <p>L'app è destinata a un uso didattico. Per l'utilizzo da parte di minori, è responsabilità di un adulto assicurare le autorizzazioni necessarie. I genitori o tutori possono richiedere la cancellazione dei dati contattando il titolare.</p>
        <h3>10. Modifiche alla Policy</h3>
        <p>La presente informativa può essere aggiornata. Gli utenti verranno informati in caso di modifiche rilevanti.</p>
        <h3>11. Riferimenti normativi</h3>
        <p>Questa informativa è redatta in conformità al GDPR.</p>
    `,
    terms: `
        <h2>📜 Termini e Condizioni</h2>
        <p><strong>Ultimo aggiornamento: 31/04/26</strong></p>
        <h3>1. Titolare del sito</h3>
        <p>Il presente sito web è gestito da: Guglielmo Piersanti. Email di contatto: <a href="mailto:prof.memmo@gmail.com" style="color:var(--accent-gold);">prof.memmo@gmail.com</a></p>
        <h3>2. Accettazione dei termini</h3>
        <p>L'accesso e l'utilizzo del sito implicano l'accettazione dei presenti Termini e Condizioni. Se non si accettano tali condizioni, si invita a non utilizzare il sito.</p>
        <h3>3. Descrizione del servizio</h3>
        <p>Il sito ha finalità informative ed educative. Gli utenti possono: Consultare i contenuti disponibili e usufruire della piattaforma di gioco. Contattare il gestore tramite modulo di contatto.</p>
        <h3>4. Utilizzo del sito</h3>
        <p>L'utente si impegna a utilizzare il sito in modo lecito e corretto, evitando di: Inviare messaggi offensivi, illeciti o spam; Tentare di compromettere la sicurezza del sito; Utilizzare il sito per scopi fraudolenti.</p>
        <h3>5. Modulo di contatto</h3>
        <p>L'utente è responsabile dei dati e dei contenuti inviati tramite il modulo di contatto. È vietato: Inserire dati falsi o di terzi senza autorizzazione; Inviare contenuti illeciti o non pertinenti.</p>
        <h3>6. Proprietà intellettuale</h3>
        <p>Tutti i contenuti del sito (testi, materiali, ecc.) sono di proprietà del titolare, salvo diversa indicazione. È vietata la copia, distribuzione o utilizzo senza autorizzazione.</p>
        <h3>7. Limitazione di responsabilità</h3>
        <p>Il sito è fornito "così com'è". Il titolare non garantisce l'assenza di errori o interruzioni, la completezza o accuratezza dei contenuti. Il titolare non è responsabile per: Danni derivanti dall'utilizzo del sito; Problemi tecnici o interruzioni del servizio; Contenuti inviati dagli utenti tramite modulo di contatto.</p>
        <h3>8. Link esterni</h3>
        <p>Il sito può contenere link a siti esterni. Il titolare non è responsabile del contenuto o delle politiche di tali siti.</p>
        <h3>9. Modifiche</h3>
        <p>Il titolare si riserva il diritto di modificare i presenti Termini in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina.</p>
        <h3>10. Legge applicabile</h3>
        <p>I presenti Termini sono regolati dalla normativa italiana e dal GDPR.</p>
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
  
  // Find clicked button manually if event isn't reliable
  document.querySelectorAll('.map-tab').forEach(btn => {
      if(btn.textContent.toLowerCase() === tabName) btn.classList.add('active');
  });
  if (window.event && window.event.currentTarget) {
      window.event.currentTarget.classList.add('active');
  }
  
  const mapElement = document.getElementById('map-' + tabName);
  if (mapElement) {
      mapElement.style.display = 'block';
  }
  
  // Change background depending on campaign
  const body = document.body;
  if(tabName === 'inferno') {
      body.style.background = 'url("assets/Immagini/bg_inferno.jpg") center/cover fixed';
      body.style.backgroundColor = '#1a1a2e';
  } else if (tabName === 'purgatorio') {
      body.style.background = 'url("assets/Immagini/bg_purgatorio.jpg") center/cover fixed';
      body.style.backgroundColor = '#2c3e50';
  } else if (tabName === 'paradiso') {
      body.style.background = 'url("assets/Immagini/bg_paradiso.jpg") center/cover fixed';
      body.style.backgroundColor = '#f0f8ff';
  }

  // Tell MapEngine to render the appropriate map
  if (window.MapEngine) {
      window.MapEngine.renderMap(tabName);
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
                if (classObj.teacherId) updateData.teacherId = classObj.teacherId;
                if (classObj.teacher) updateData.teacherEmail = classObj.teacher;
            }
        }
    }

    const userDocRef = doc(db, 'users', state.user.uid);
    await updateDoc(userDocRef, updateData);
    
    // Aggiorna cache locale
    if (window.EroiDB && window.EroiDB.cache && window.EroiDB.cache.userProfile) {
        Object.assign(window.EroiDB.cache.userProfile, updateData);
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
  selectedCorteAvatar: 'assets/avatars/6.png',
  openEditProfileModal: function() {
    window.open('https://prof-memmo.github.io/games/profilo.html', '_blank');
  },

  selectCorteAvatar: function(el, avatarPath) {
      this.selectedCorteAvatar = avatarPath;
      document.querySelectorAll('.corte-avatar-opt').forEach(opt => {
          opt.classList.remove('active');
          opt.style.borderColor = 'transparent';
          opt.style.transform = 'scale(1)';
      });
      if (el) {
          el.classList.add('active');
          el.style.borderColor = 'var(--accent-gold)';
          el.style.transform = 'scale(1.1)';
      }
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
      const chosenAvatar = this.selectedCorteAvatar || (profile && profile.avatar) || 'assets/avatars/6.png';
      const updateData = { 
          displayName: nameInput,
          avatar: chosenAvatar
      };
      if (isTeacher) {
        updateData.school = schoolInput;
      }
      
      // Salva nel database (modular)
      try {
        await setDoc(doc(db, 'users', user.uid), updateData, { merge: true });
        await setDoc(doc(db, 'corte_users', user.email.toLowerCase()), updateData, { merge: true });
      } catch (dbErr) {
        console.warn("Salvataggio DB locale corte:", dbErr);
      }
      
      // Sincronizzazione Globale sull'Hub Centrale e su Auth
      try {
        if (user.uid) {
          await setDoc(doc(db, 'hub_users', user.uid), {
            avatar: chosenAvatar,
            'anagrafica.avatar': chosenAvatar,
            'anagrafica.nome': nameInput
          }, { merge: true });
        }
        if (user.updateProfile) {
          await user.updateProfile({ photoURL: chosenAvatar, displayName: nameInput }).catch(e => console.warn(e));
        }
      } catch (eHub) {
        console.warn("Sincronizzazione Hub Fallback Corte:", eHub);
      }
      
      // Update local cache
      profile.displayName = nameInput;
      profile.avatar = chosenAvatar;
      if (isTeacher) profile.school = schoolInput;
      
      // Refresh UI
      const headerName = document.getElementById('header-user-name');
      if (headerName) headerName.textContent = nameInput;
      const hAvatarImg = document.getElementById('header-user-avatar-img');
      if (hAvatarImg && profile.avatar) hAvatarImg.src = profile.avatar;
      
      alert('Profilo e avatar aggiornati con successo in tutto l\'ecosistema!');
      document.getElementById('edit-profile-modal').classList.add('hidden');
      if (window.renderHeader) window.renderHeader();
    } catch (err) {
      console.error(err);
      alert('Errore durante il salvataggio: ' + err.message);
    }
  },
  switchMapTab,
  showView,
  goDashboard,
  selectRole
};

// Inizializza il motore dei processi e l'app helper
const trialsEngine = new CommediaTrials(window.app);
window.commediaApp = {
    trialsEngine,
    buyHint: () => trialsEngine.buyHint(),
    submitTrial: () => trialsEngine.submitTrial()
};

// Configura anche l'accesso diretto per trialsEngine.app se necessario
window.app.profile = null;
window.app.user = null;
window.app.updateUI = function() {
    window.goToDashboard(); // Aggiorna barra exp e fiorini
};
window.app.refreshArchivio = function() {
    loadStudentCases(false); // Ricarica l'archivio/libreria
};
window.commediaDb = {
    updateUserProfile: async (uid, data) => {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, data);
        if (window.EroiDB && window.EroiDB.cache && window.EroiDB.cache.userProfile) {
            Object.assign(window.EroiDB.cache.userProfile, data);
        }
    }
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
            if (window.commediaApp && window.commediaApp.trialsEngine) {
                window.commediaApp.trialsEngine.startTrial(c.id);
            } else if (window.EroiGame) {
                window.EroiGame.startTrial(c.id);
            }
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
    if (xp >= 100) {
        document.getElementById('nav-item-dossier').style.display = 'block';
        if (userEmail === 'prof.memmo@gmail.com' || profile.role === 'admin') {
            document.getElementById('nav-item-admin').style.display = 'block';
        } else {
            const adminNav = document.getElementById('nav-item-admin');
            if (adminNav) adminNav.style.display = 'none';
        }
    } else {
        document.getElementById('nav-item-dossier').style.display = 'none';
        const adminNav = document.getElementById('nav-item-admin');
        if (adminNav) adminNav.style.display = 'none';
    }
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
            if (window.commediaApp && window.commediaApp.trialsEngine) {
                window.commediaApp.trialsEngine.startTrial(c.id);
            } else if (window.EroiGame) {
                window.EroiGame.startTrial(c.id);
            }
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
    if (typeof openSharedModal === 'function') {
        openSharedModal(type === 'terms' ? 'termini' : type);
    }
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
  classes: [],
  selectedClassId: null,

  init: async function() {
    console.log("Init Teacher Dashboard");
    this.switchTab('panoramica'); // Default tab
    await this.loadClasses();
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

  loadClasses: async function() {
    const classSelect = document.getElementById('select-teacher-class');
    const nodiSelect = document.getElementById('select-nodi-class');

    const email = (state && state.user && state.user.email) ? state.user.email : '';
    const uid = (state && state.user && state.user.uid) ? state.user.uid : null;

    if (classSelect) {
      classSelect.innerHTML = '<option value="">Caricamento classi...</option>';
    }
    if (nodiSelect) {
      nodiSelect.innerHTML = '<option value="">Caricamento classi...</option>';
    }

    try {
      if (window.EroiDB && window.EroiDB.getTeacherClasses) {
        this.classes = await window.EroiDB.getTeacherClasses(email, uid);
      } else {
        this.classes = [];
      }
    } catch (e) {
      console.error("Errore caricamento classi:", e);
      this.classes = [];
    }

    if (!this.classes || this.classes.length === 0) {
      if (classSelect) {
        classSelect.innerHTML = '<option value="">Nessuna classe trovata (creala nell\'Hub)</option>';
      }
      if (nodiSelect) {
        nodiSelect.innerHTML = '<option value="">Nessuna classe trovata</option>';
      }
      const tbody = document.getElementById('teacher-students-tbody');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 25px; color: #888; font-style: italic;">Nessuna classe disponibile. Le classi si creano esclusivamente dall\'Hub docenti.</td></tr>';
      }
      const badge = document.getElementById('selected-class-code-badge');
      if (badge) badge.style.display = 'none';
      return;
    }

    let options = '<option value="">-- Seleziona una Classe --</option>';
    this.classes.forEach(c => {
      const codeStr = c.code ? ` (Codice: ${c.code})` : '';
      options += `<option value="${c.id}">${(c.name || 'Classe').replace(/</g, '&lt;').replace(/>/g, '&gt;')}${codeStr}</option>`;
    });

    if (classSelect) {
      classSelect.innerHTML = options;
      classSelect.value = this.classes[0].id;
      this.onClassChange(this.classes[0].id);
    }
    if (nodiSelect) {
      nodiSelect.innerHTML = options;
      nodiSelect.value = this.classes[0].id;
    }
  },

  onClassChange: async function(classId) {
    this.selectedClassId = classId;
    const badge = document.getElementById('selected-class-code-badge');
    const codeSpan = document.getElementById('display-selected-code');

    const nodiSelect = document.getElementById('select-nodi-class');
    if (nodiSelect && nodiSelect.value !== classId) {
      nodiSelect.value = classId;
    }

    if (!classId) {
      if (badge) badge.style.display = 'none';
      const tbody = document.getElementById('teacher-students-tbody');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 25px; color: #888; font-style: italic;">Seleziona una classe per visualizzare gli studenti.</td></tr>';
      }
      return;
    }

    const cls = this.classes.find(c => c.id === classId) || { id: classId };
    if (badge && codeSpan) {
      if (cls && cls.code) {
        codeSpan.textContent = cls.code;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }

    await this.renderStudentsForClass(cls);
  },

  copyClassCode: function() {
    const codeSpan = document.getElementById('display-selected-code');
    if (codeSpan && codeSpan.textContent && codeSpan.textContent !== '-') {
      navigator.clipboard.writeText(codeSpan.textContent);
      alert('Codice classe copiato negli appunti: ' + codeSpan.textContent);
    }
  },

  renderStudentsForClass: async function(cls) {
    const tbody = document.getElementById('teacher-students-tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #888;"><i class="fa-solid fa-spinner fa-spin"></i> Caricamento studenti...</td></tr>';

    try {
      const students = await window.EroiDB.getStudentsByClass(cls.id, cls.code);
      if (!students || students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 25px; color: #888; font-style: italic;">Nessuno studente iscritto a questa classe. Gli studenti devono registrarsi o essere associati dall\'Hub.</td></tr>';
        return;
      }

      let html = '';
      students.forEach(s => {
        const name = (s.name || s.displayName || 'Studente').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const email = s.email ? `<br><small style="color: #666; font-size: 0.75rem;">${s.email.replace(/</g, '&lt;')}</small>` : '';
        const level = s.level || 'Pellegrino';
        const xp = s.xp !== undefined ? s.xp : 0;

        html += `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;">
            <td style="padding: 12px 10px; font-weight: 600; color: #fff;">
              <i class="fa-solid fa-user-graduate" style="color: var(--accent-gold); margin-right: 8px;"></i>
              ${name}
              ${email}
            </td>
            <td style="padding: 12px 10px; color: #bbb;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.08); font-size: 0.8rem;">${level}</span>
            </td>
            <td style="padding: 12px 10px; color: var(--accent-gold); font-weight: 700;">
              ${xp} XP
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    } catch (e) {
      console.error("Errore caricamento studenti:", e);
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #ff4d4d;">Errore durante il caricamento degli studenti.</td></tr>';
    }
  },

  renderNodi: async function() {
    const container = document.getElementById('nodi-list-container');
    if (!container) return;
    const nodi = [
      { id: 'limbo', name: 'Limbo (Cerchio I)', desc: 'Spiriti magni e non battezzati', defaultUnlocked: true },
      { id: 'lussuriosi', name: 'Cerchio II - Lussuriosi', desc: 'Paolo e Francesca', defaultUnlocked: true },
      { id: 'golosi', name: 'Cerchio III - Golosi', desc: 'Ciacco e la pioggia eterna', defaultUnlocked: false },
      { id: 'avari', name: 'Cerchio IV - Avari e Prodighi', desc: 'Pesi spinti e contese vane', defaultUnlocked: false },
      { id: 'iracondi', name: 'Cerchio V - Iracondi e Accidiosi', desc: 'La palude Stigia e Filippo Argenti', defaultUnlocked: false },
      { id: 'eretici', name: 'Cerchio VI - Eretici', desc: 'La città di Dite e Farinata', defaultUnlocked: false },
      { id: 'violenti', name: 'Cerchio VII - Violenti', desc: 'Flegetonte e la selva dei suicidi', defaultUnlocked: false },
      { id: 'fraudolenti', name: 'Cerchio VIII - Malebolge', desc: 'I fossati delle frodi', defaultUnlocked: false },
      { id: 'traditori', name: 'Cerchio IX - Cocito', desc: 'Il lago ghiacciato e Lucifero', defaultUnlocked: false }
    ];

    let html = '';
    nodi.forEach(nodo => {
      html += `
        <div style="background: rgba(255,255,255,0.8); border: 1px solid #ccc; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #222; font-size: 1rem;">${nodo.name}</strong>
            <p style="margin: 2px 0 0 0; color: #666; font-size: 0.82rem;">${nodo.desc}</p>
          </div>
          <div>
            <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; background: ${nodo.defaultUnlocked ? '#e8f5e9' : '#f5f5f5'}; color: ${nodo.defaultUnlocked ? '#2e7d32' : '#777'}; border: 1px solid ${nodo.defaultUnlocked ? '#a5d6a7' : '#ddd'};">
              ${nodo.defaultUnlocked ? 'Sbloccato' : 'Bloccato'}
            </span>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  },

  renderClasses: async function() {
    // Populate the select dropdown for cases
    if (window.EroiDB && window.EroiDB.cache && window.EroiDB.cache.cases.length === 0) {
        await window.EroiDB.getCasesByCampaign('inferno');
        await window.EroiDB.getCasesByCampaign('purgatorio');
        await window.EroiDB.getCasesByCampaign('paradiso');
    }
    const caseSelect = document.getElementById('teacher-case-select');
    if (caseSelect && window.EroiDB && window.EroiDB.cache) {
        let options = '<option value="">-- Seleziona un Caso --</option>';
        window.EroiDB.cache.cases.forEach(c => {
            options += `<option value="${c.id}">${c.characterName} (${c.campaignId.toUpperCase()})</option>`;
        });
        caseSelect.innerHTML = options;
    }
    this.renderNodi();
  },
  
  loadCaseVerdicts: async function(caseId) {
    const listEl = document.getElementById('teacher-verdicts-list');
    if (!caseId) {
        listEl.innerHTML = '<p style="color: #666; font-style: italic; text-align: center;">Nessun caso selezionato.</p>';
        return;
    }
    
    listEl.innerHTML = '<p style="color: #666; text-align: center;">Caricamento verdetti in corso...</p>';
    
    try {
        let classCode = null;
        if (this.classes && this.selectedClassId) {
          const selCls = this.classes.find(c => c.id === this.selectedClassId);
          if (selCls && selCls.code) classCode = selCls.code;
        }
        
        if (window.EroiDB && window.EroiDB.getRawVerdicts) {
            const verdicts = await window.EroiDB.getRawVerdicts(caseId, classCode);
            if (verdicts.length === 0) {
                listEl.innerHTML = '<p style="color: #666; font-style: italic; text-align: center;">Nessun verdetto registrato per questo caso.</p>';
                return;
            }
            
            let html = '';
            verdicts.forEach(v => {
                const badgeColor = v.verdict === 'conferma' ? 'var(--accent-gold)' : (v.verdict === 'assoluzione' ? '#00cc66' : (v.verdict === 'riduzione' ? '#4da8da' : 'var(--danger-color)'));
                html += `
                <div style="background: #fff; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 5px solid ${badgeColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <strong style="color: #222; font-size: 1.1rem;">${v.displayName}</strong>
                        <span style="background: ${badgeColor}; color: ${v.verdict==='conferma'?'#000':'#fff'}; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">${v.verdict}</span>
                    </div>
                    <p style="color: #444; font-style: italic; margin: 0; font-size: 0.95rem;">"${v.motivation || 'Nessuna motivazione inserita.'}"</p>
                </div>
                `;
            });
            listEl.innerHTML = html;
        } else {
            listEl.innerHTML = '<p style="color: red; text-align: center;">Errore: funzione getRawVerdicts non trovata.</p>';
        }
    } catch (e) {
        console.error(e);
        listEl.innerHTML = '<p style="color: red; text-align: center;">Errore durante il caricamento dei verdetti.</p>';
    }
  },

  bindEvents: function() {
    // Eventi e listener aggiuntivi
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
    
    // Initialize global filter state if not exists
    if (!window.adminUsersFilter) window.adminUsersFilter = 'all';
    
    try {
        const users = await EroiDB.getAllUsers();
        window.adminUsersList = users || [];
        
        if (!users || users.length === 0) {
            list.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center; color: #888;">Nessun utente trovato</td></tr>';
            return;
        }
        
        // Update stats counters
        let countTeacher = 0, countStudent = 0, countExternal = 0;
        let uniqueSchools = new Set();
        
        users.forEach(u => {
            if (u.role === 'teacher') countTeacher++;
            else if (u.role === 'student') countStudent++;
            else if (u.role === 'external') countExternal++;
            if (u.school) uniqueSchools.add(u.school.toLowerCase());
        });
        
        const elAll = document.getElementById('stat-count-all');
        if (elAll) elAll.textContent = users.length;
        const elTeacher = document.getElementById('stat-count-teacher');
        if (elTeacher) elTeacher.textContent = countTeacher;
        const elStudent = document.getElementById('stat-count-student');
        if (elStudent) elStudent.textContent = countStudent;
        const elExternal = document.getElementById('stat-count-external');
        if (elExternal) elExternal.textContent = countExternal;
        const elSchools = document.getElementById('stat-count-schools');
        if (elSchools) elSchools.textContent = uniqueSchools.size;
        
        // Filter users
        let filteredUsers = users;
        if (window.adminUsersFilter !== 'all') {
            filteredUsers = users.filter(u => u.role === window.adminUsersFilter);
        }
        
        let html = '';
        const state = window.adminUsersSort || { col: 'date', asc: false };
        filteredUsers.sort((a, b) => {
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

        filteredUsers.forEach(u => {
            html += `
              <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 10px;">
                    <strong>${u.email || 'Anonimo'}</strong>
                    ${u.classCode ? `<br><span style="font-size:0.7rem; color: var(--accent-gold);">Classe: ${u.classCode}</span>` : ''}
                </td>
                <td style="padding: 10px; text-transform: uppercase; font-size: 0.8rem;">
                    ${u.role === 'admin' ? '<span style="color:var(--accent-crimson)">Admin</span>' : (u.role === 'teacher' ? '<span style="color:var(--accent-gold)">Docente</span>' : (u.role === 'external' ? '<span style="color:#9b59b6">Forestiero</span>' : '<span style="color:#888">Studente</span>'))}
                </td>
                <td style="padding: 10px; font-size: 0.8rem; color: #888;">${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td style="padding: 10px; text-align: right;">
                    <a href="mailto:${u.email}" title="Scrivi a ${u.email}" style="color:var(--accent-gold); margin-right:10px; text-decoration:none;"><i class="fa-solid fa-envelope"></i></a>
                    <select class="input-form" style="padding: 5px; font-size: 0.75rem;" onchange="window.updateUserRole('${u.id}', this.value)">
                        <option value="student" ${u.role === 'student' ? 'selected' : ''}>Studente</option>
                        <option value="teacher" ${u.role === 'teacher' ? 'selected' : ''}>Docente</option>
                        <option value="external" ${u.role === 'external' ? 'selected' : ''}>Forestiero</option>
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
    window.open('https://prof-memmo.github.io/games/contatti.html', '_blank');
};

async function renderArchivio() {
    const container = document.getElementById('archivio-list-container');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align: center; color: #666; font-style: italic; padding: 40px;"><i class="fa-solid fa-spinner fa-spin"></i> Caricamento dei tuoi verdetti...</div>';
    
    if (!window.EroiDB || !window.EroiDB.cache || !window.EroiDB.cache.userProfile) {
        container.innerHTML = '<div style="color: red; text-align: center; padding: 20px;">Devi effettuare il login per vedere il tuo archivio.</div>';
        return;
    }
    

    if (window.EroiDB.cache.cases.length === 0) {
        await window.EroiDB.getCasesByCampaign('inferno');
        await window.EroiDB.getCasesByCampaign('purgatorio');
        await window.EroiDB.getCasesByCampaign('paradiso');
    }
    const uid = window.EroiDB.cache.userProfile.uid || window.firebase.auth().currentUser?.uid;
    if (!uid) {
        container.innerHTML = '<div style="color: red; text-align: center; padding: 20px;">Sessione utente non valida.</div>';
        return;
    }
    
    const verdicts = await window.EroiDB.getUserSentences(uid);
    
    if (verdicts.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #555; padding: 40px; background: rgba(255,255,255,0.8); border-radius: 8px; border: 1px dashed #999;">Ancora nessuna sentenza emessa. Inizia a giocare un caso per riempire il tuo archivio!</div>';
        return;
    }
    
    let html = '';
    verdicts.forEach(v => {
        const badgeColor = v.verdict === 'conferma' ? 'var(--accent-gold)' : (v.verdict === 'assoluzione' ? '#00cc66' : (v.verdict === 'riduzione' ? '#4da8da' : 'var(--danger-color)'));
        html += `
        <div style="background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 10px; border-left: 6px solid ${badgeColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-bottom: 15px; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 15px;">
                <h4 style="margin: 0; font-family: 'Julius Sans One', sans-serif; font-size: 1.3rem; color: #222;">
                    Caso: ${window.EroiDB.cache.cases.find(c => c.id === v.caseId)?.characterName || v.caseId}
                </h4>
                <span style="background: ${badgeColor}; color: ${v.verdict==='conferma'?'#000':'#fff'}; padding: 5px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: bold; text-transform: uppercase;">
                    ${v.verdict}
                </span>
            </div>
            <p style="margin: 0; color: #333; font-style: italic; line-height: 1.5; font-size: 1.05rem;">
                <i class="fa-solid fa-quote-left" style="color: #ccc; margin-right: 8px;"></i>${v.motivation || 'Nessuna motivazione inserita.'}<i class="fa-solid fa-quote-right" style="color: #ccc; margin-left: 8px;"></i>
            </p>
        </div>
        `;
    });
    
    container.innerHTML = html;
}
