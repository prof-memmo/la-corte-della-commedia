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
    
    // Routing in base al ruolo
    const userEmail = user.email ? user.email.toLowerCase() : '';
    if (role === 'pending') {
      showView('view-onboarding');
      // Nascondi menu utente e nav bar durante l'onboarding
      if (userMenu) userMenu.style.display = 'none';
      if (bottomNav) bottomNav.style.display = 'none';
    } else if (userEmail === 'prof.memmo@gmail.com' || role === 'admin') {
      showView('view-admin-dashboard');
      loadStudentCases(true); // Carica casi anche per admin
      MapEngine.init();
    } else if (role === 'teacher') {
      showView('view-teacher-dashboard');
    } else if (role === 'external') {
      showView('view-map');
      MapEngine.init();
    } else {
      showView('view-map'); // Mappa di default per Studente
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
      showView('view-external-dashboard');
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
    const userDocRef = doc(db, 'users', state.user.uid);
    await updateDoc(userDocRef, { role: role });
    
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
      showView('view-map');
      MapEngine.init();
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

        // Usa l'icona pergamena
        scroll.innerHTML = `
            <img src="assets/Immagini/3.png" alt="Scroll" style="width: 60px; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.5)); margin-bottom: 10px;">
            <div style="background: rgba(0,0,0,0.7); padding: 5px 8px; border-radius: 5px; border: 1px solid var(--accent-gold); text-align: center; width: 100%;">
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
    document.getElementById('legal-modal').classList.add('hidden');
});
