// minigames.js - Motore per i 12 giochi interattivi della Fase 3 (Prove) e Allenamento Dantesco
// La Corte della Commedia

// =====================================================
// DATASET DANTESCO PER I 12 MINIGIOCHI
// =====================================================
const DANTE_GAMES_DATA = {
  default: {
    topic: "La Divina Commedia",
    quiz: {
      question: "In quale anno Dante Alighieri immagina di compiere il suo viaggio nell'Oltretomba?",
      options: ["1300 (Anno del Giubileo)", "1321 (Anno della sua morte)", "1265 (Anno della sua nascita)", "1302 (Anno del suo esilio)"],
      correct: 0,
      hint: "Coincide con il primo grande Giubileo indetto da papa Bonifacio VIII.",
      explanation: "Dante colloca l'inizio del viaggio nella settimana santa della primavera del 1300, a 35 anni («nel mezzo del cammin di nostra vita»)."
    },
    impiccato: {
      word: "CONTRAPPASSO",
      hint: "La legge per analogia o contrasto che governa le pene dell'Inferno e del Purgatorio."
    },
    cloze: {
      text: "Nel mezzo del cammin di nostra vita mi ritrovai per una selva {oscura}, ché la diritta via era {smarrita}.",
      words: ["oscura", "smarrita"],
      hint: "I due celeberrimi aggettivi del primo canto dell'Inferno."
    },
    puzzle: {
      sentence: "Fatti non foste a viver come bruti ma per seguir virtute e canoscenza",
      hint: "Il celebre monito di Ulisse ai suoi compagni (Inferno XXVI)."
    },
    versi: {
      lines: [
        "Nel mezzo del cammin di nostra vita",
        "mi ritrovai per una selva oscura,",
        "ché la diritta via era smarrita."
      ],
      hint: "La primissima terzina incatenata dell'Inferno."
    },
    memory: [
      { id: 1, text: "Caronte", match: "Traghettatore dell'Acheronte" },
      { id: 2, text: "Minosse", match: "Giudice infernale con la coda" },
      { id: 3, text: "Cerbero", match: "Cane a tre teste dei Golosi" },
      { id: 4, text: "Beatrice", match: "Guida nel Paradiso" }
    ],
    cruciverba: {
      grid: [
        ['D','A','N','T','E'],
        ['A','#','O','#','M'],
        ['N','#','M','#','P'],
        ['T','R','O','I','A'],
        ['E','#','S','#','R']
      ],
      across: [
        { num: 1, row: 0, col: 0, word: "DANTE", clue: "Il sommo poeta fiorentino." },
        { num: 4, row: 3, col: 0, word: "TROIA", clue: "L'antica città da cui fuggì Enea." }
      ],
      down: [
        { num: 1, row: 0, col: 0, word: "DANTE", clue: "Autore della Commedia." },
        { num: 2, row: 0, col: 2, word: "NOMOS", clue: "Legge e giustizia morale." },
        { num: 3, row: 0, col: 4, word: "EMPIREO", clue: "Il cielo più alto della luce divina." }
      ]
    },
    rebus: {
      icons: ["👑", "+", "📜", "=", "CORTE"],
      solution: "CORTE",
      hint: "Il luogo solenne dove si amministra la giustizia."
    },
    crittografia: {
      cipher: "BNPS DI'B OVMMP BNBUP BNBS QFSEPOB",
      shift: 1,
      solution: "AMOR CH'A NULLO AMATO AMAR PERDONA",
      hint: "Il celebre verso di Francesca da Rimini cifrato con Cesare (A -> B)."
    },
    indovinello: {
      riddle: "Tre fiere mi sbarran la via sul colle: una lonza, un leone e una lupa famelica. Chi giunge in mio soccorso per guidarmi nel baratro?",
      options: ["Virgilio, l'antico saggio mantovano", "Omero, il cantore d'Iliade", "San Bernardo di Chiaravalle", "Beatrice in persona"],
      correct: 0,
      hint: "L'autore dell'Eneide, ombra illustre invocata con «Miserere di me!»."
    },
    anagramma: {
      scrambled: "G-E-B-O-L-E-M-A-L",
      solution: "MALEBOLGE",
      hint: "L'ottavo cerchio dell'Inferno diviso in dieci fossati concentrici."
    },
    differenze: {
      image: "assets/Immagini/12.png",
      clues: ["Il Tomo delle Leggi", "La Ceralacca del Sigillo", "La Bilancia di Giustizia"]
    }
  },

  // Dati specifici per Paolo e Francesca (Lussuriosi - Canto V)
  francesca: {
    topic: "Paolo e Francesca (Inferno V)",
    quiz: {
      question: "Quale libro galeotto stavano leggendo Paolo e Francesca prima di scambiarsi il fatale bacio?",
      options: ["Il romanzo di Lancillotto e Ginevra", "L'Eneide di Virgilio", "Il Canzoniere di Petrarca", "Le Metamorfosi di Ovidio"],
      correct: 0,
      hint: "Narrava dell'amore segreto per la regina di Camelot.",
      explanation: "«Galeotto fu 'l libro e chi lo scrisse: quel giorno più non vi leggemmo avante»."
    },
    impiccato: {
      word: "BUFERA",
      hint: "La tempesta infernale che mai non resta, travolgendo i lussuriosi nel 2° cerchio."
    },
    cloze: {
      text: "Amor, ch'a nullo amato amar {perdona}, mi prese del costui piacer sì {forte}, che, come vedi, ancor non m'abbandona.",
      words: ["perdona", "forte"],
      hint: "La seconda delle tre terzine sull'Amore pronunciate da Francesca."
    },
    puzzle: {
      sentence: "Galeotto fu il libro e chi lo scrisse quel giorno piu non vi leggemmo avante",
      hint: "La confessione di Francesca sul momento del bacio."
    },
    versi: {
      lines: [
        "Amor, ch'al cor gentil ratto s'apprende,",
        "prese costui de la bella persona",
        "che mi fu tolta; e 'l modo ancor m'offende."
      ],
      hint: "La prima terzina del trittico sull'amore in Inferno V."
    },
    memory: [
      { id: 1, text: "Francesca da Polenta", match: "Nobile fanciulla di Ravenna" },
      { id: 2, text: "Paolo Malatesta", match: "Il Bello, cognato e amante" },
      { id: 3, text: "Gianciotto", match: "Lo sposo zoppo e vendicatore" },
      { id: 4, text: "Caina", match: "La zona dei traditori dei parenti" }
    ],
    cruciverba: {
      grid: [
        ['P','A','O','L','O'],
        ['A','#','M','#','V'],
        ['C','A','I','N','A'],
        ['I','#','G','#','D'],
        ['O','#','O','#','O']
      ],
      across: [
        { num: 1, row: 0, col: 0, word: "PAOLO", clue: "L'amante silenzioso che piange al fianco di Francesca." },
        { num: 3, row: 2, col: 0, word: "CAINA", clue: "Il lago ghiacciato che attende chi spense la loro vita." }
      ],
      down: [
        { num: 1, row: 0, col: 0, word: "PACIO", clue: "Pace invocata nell'aldilà." },
        { num: 2, row: 0, col: 2, word: "OMIGO", clue: "Ombra dolente." },
        { num: 4, row: 0, col: 4, word: "OVADO", clue: "Destino ineluttabile." }
      ]
    },
    rebus: {
      icons: ["📖", "+", "💋", "=", "GALEOTTO"],
      solution: "GALEOTTO",
      hint: "Chi fa da intermediario d'amore, come il libro per i due amanti."
    },
    crittografia: {
      cipher: "E VN DBEEJ QFSTPOB DIF NJ GV UPMUB",
      shift: 1,
      solution: "D LA BELLA PERSONA CHE MI FU TOLTA",
      hint: "La bellezza terrena rapita dalla violenza."
    },
    indovinello: {
      riddle: "Voliamo insieme leggeri come colombe chiamate dal disio, uniti nel vento che non ha posa. Chi siamo?",
      options: ["Paolo e Francesca", "Didone ed Enea", "Elena e Paride", "Tristano e Isotta"],
      correct: 0,
      hint: "«Quali colombe dal disio chiamate con l'ali alzate e ferme al dolce nido...»"
    },
    anagramma: {
      scrambled: "R-A-V-E-N-N-A",
      solution: "RAVENNA",
      hint: "La città natia di Francesca: «Siede la terra dove nata fui su la marina dove 'l Po discende...»"
    },
    differenze: {
      image: "assets/Immagini/12.png",
      clues: ["Il Libro galeotto", "Il pugnale della vendetta", "La rosa di Ravenna"]
    }
  },

  // Dati specifici per Ulisse (Fraudolenti - Canto XXVI)
  ulisse: {
    topic: "Ulisse e Diomede (Inferno XXVI)",
    quiz: {
      question: "Quale limite geografico e morale oltrepassò Ulisse nel suo «folle volo»?",
      options: ["Le Colonne d'Ercole (Stretto di Gibilterra)", "Il Mar Rosso", "Le Porte del Caucaso", "Le Isole Fortunate"],
      correct: 0,
      hint: "Il confine del mondo conosciuto posto dal semidio Ercole affinché l'uomo non vi si mettesse oltre.",
      explanation: "Dante colloca il naufragio di Ulisse nell'emisfero australe di fronte alla montagna del Purgatorio."
    },
    impiccato: {
      word: "CANOSCENZA",
      hint: "Ciò che Ulisse esorta a seguire insieme alla virtù."
    },
    cloze: {
      text: "Considerate la vostra {semenza}: fatti non foste a viver come {bruti}, ma per seguir virtute e {canoscenza}.",
      words: ["semenza", "bruti", "canoscenza"],
      hint: "La celebre orazione picciola di Ulisse."
    },
    puzzle: {
      sentence: "Dei remi facemmo ali al folle volo sempre acquistando dal lato mancino",
      hint: "L'inizio dell'avventura verso l'ignoto oceano."
    },
    versi: {
      lines: [
        "Considerate la vostra semenza:",
        "fatti non foste a viver come bruti,",
        "ma per seguir virtute e canoscenza."
      ],
      hint: "La celebre terzina dell'orazione ai compagni."
    },
    memory: [
      { id: 1, text: "Ulisse", match: "Consigliere di frode nella fiamma cornuta" },
      { id: 2, text: "Diomede", match: "Compagno greco punito nella stessa lingua di fuoco" },
      { id: 3, text: "Cavallo di Troia", match: "L'inganno ordito per espugnare la città" },
      { id: 4, text: "Purgatorio", match: "La bruna montagna avvistata prima del naufragio" }
    ],
    cruciverba: {
      grid: [
        ['U','L','I','S','S','E'],
        ['L','#','N','#','#','R'],
        ['I','T','A','C','A','#'],
        ['S','#','N','#','#','#'],
        ['S','F','I','N','G','E'],
        ['E','#','#','#','#','#']
      ],
      across: [
        { num: 1, row: 0, col: 0, word: "ULISSE", clue: "L'eroe greco del folle volo." },
        { num: 3, row: 2, col: 0, word: "ITACA", clue: "La patria mai dimenticata." },
        { num: 5, row: 4, col: 0, word: "SFINGE", clue: "Creatura mitologica di enigmi." }
      ],
      down: [
        { num: 1, row: 0, col: 0, word: "ULISSE", clue: "Il re di Itaca." },
        { num: 2, row: 0, col: 2, word: "INANI", clue: "Sforzi vani." }
      ]
    },
    rebus: {
      icons: ["⛵", "+", "🌊", "=", "FOLLE VOLO"],
      solution: "FOLLE VOLO",
      hint: "Il viaggio oltre i limiti imposti all'intelletto umano."
    },
    crittografia: {
      cipher: "GBUUP OPO GPTUF B WJWFS DPNF CSVUJ",
      shift: 1,
      solution: "FATTI NON FOSTE A VIVER COME BRUTI",
      hint: "La dignità dell'essere umano secondo l'orazione di Ulisse."
    },
    indovinello: {
      riddle: "Brucio in una lingua di fuoco a due punte nell'ottava bolgia. L'ingegno fu la mia gloria e la mia rovina. Chi sono?",
      options: ["Ulisse", "Guido da Montefeltro", "Capaneo", "Vanni Fucci"],
      correct: 0,
      hint: "L'eroe dal multiforme ingegno avvolto nella fiamma congiunta a Diomede."
    },
    anagramma: {
      scrambled: "C-O-L-O-N-N-E-D-E-R-C-O-L-E",
      solution: "COLONNE D ERCOLE",
      hint: "Il limite invalicabile del mondo antico posto allo Stretto di Gibilterra."
    },
    differenze: {
      image: "assets/Immagini/12.png",
      clues: ["L'Astro del Polo Sud", "Il Vortice dell'Oceano", "La Fiamma Cornuta"]
    }
  },

  // Dati specifici per il Conte Ugolino (Traditori - Canto XXXIII)
  ugolino: {
    topic: "Conte Ugolino della Gherardesca (Inferno XXXIII)",
    quiz: {
      question: "In quale torre di Pisa fu rinchiuso a morire di fame il Conte Ugolino con i suoi figli e nipoti?",
      options: ["Torre della Muda (poi detta della Fame)", "Torre Pendente", "Torre dei Gualandi", "Torre Guelfa"],
      correct: 0,
      hint: "L'edificio dove venivano rinchiuse le aquile per la muta delle penne.",
      explanation: "Ugolino fu tradito dall'arcivescovo Ruggieri degli Ubaldini e murato nella Torre della Muda nel 1289."
    },
    impiccato: {
      word: "COCITO",
      hint: "Il lago ghiacciato nel nono cerchio dove sono conficcati i traditori."
    },
    cloze: {
      text: "La bocca sollevò dal fiero {pasto} quel peccator, forbendola a' {capelli} del capo ch'elli avea di retro guasto.",
      words: ["pasto", "capelli"],
      hint: "L'incipit impressionante del canto XXXIII dell'Inferno."
    },
    puzzle: {
      sentence: "Poscia piu che il dolor pote il digiuno",
      hint: "L'enigmatico verso finale del racconto di Ugolino."
    },
    versi: {
      lines: [
        "La bocca sollevò dal fiero pasto",
        "quel peccator, forbendola a' capelli",
        "del capo ch'elli avea di retro guasto."
      ],
      hint: "La terzina iniziale dell'orribile pasto di Ugolino sul cranio dell'arcivescovo."
    },
    memory: [
      { id: 1, text: "Conte Ugolino", match: "Nobile ghibellino pisano passato ai guelfi" },
      { id: 2, text: "Arcivescovo Ruggieri", match: "L'artefice della prigionia e del tradimento" },
      { id: 3, text: "Antenora", match: "La zona dei traditori della patria e del partito" },
      { id: 4, text: "Anselmuccio", match: "Uno dei giovani figli rinchiusi nella torre" }
    ],
    cruciverba: {
      grid: [
        ['P','I','S','A','#'],
        ['I','#','T','#','#'],
        ['S','T','I','G','E'],
        ['A','#','G','#','#'],
        ['#','C','E','L','O']
      ],
      across: [
        { num: 1, row: 0, col: 0, word: "PISA", clue: "«Vituperio de le genti del bel paese là dove 'l sì suona»." },
        { num: 3, row: 2, col: 0, word: "STIGE", clue: "La palude infernale dei violenti e iracondi." }
      ],
      down: [
        { num: 1, row: 0, col: 0, word: "PISA", clue: "La città marinara toscana." },
        { num: 2, row: 0, col: 2, word: "STIGE", clue: "Fiume dell'Inferno." }
      ]
    },
    rebus: {
      icons: ["🏰", "+", "🍞", "=", "FAME"],
      solution: "FAME",
      hint: "Il supplizio atroce inferto nella torre pisana."
    },
    crittografia: {
      cipher: "QPTDJB QJV DIF JM EPMPS QPUF JM EJHJVOP",
      shift: 1,
      solution: "POSCIA PIU CHE IL DOLOR POTE IL DIGIUNO",
      hint: "Il celebre enigma della morte di Ugolino."
    },
    indovinello: {
      riddle: "Rodo per l'eternità il cranio di colui che mi condannò a veder morire i miei figli senza pane. Chi sono?",
      options: ["Il Conte Ugolino", "Farinata degli Uberti", "Bocca degli Abati", "Frate Alberigo"],
      correct: 0,
      hint: "«Tu dei saper ch'i' fui 'l conte Ugolino, e questi è l'arcivescovo Ruggieri»."
    },
    anagramma: {
      scrambled: "R-U-G-G-I-E-R-I",
      solution: "RUGGIERI",
      hint: "Il nome dell'arcivescovo pisano traditore."
    },
    differenze: {
      image: "assets/Immagini/12.png",
      clues: ["La Chiave della Torre gettata nell'Arno", "I Ghiacci di Cocito", "La Maschera del Dolore"]
    }
  }
};

// =====================================================
// MOTORE PRINCIPALE MINIGAMESENGINE
// =====================================================
export const MinigamesEngine = {
  init: function() {
    console.log("MinigamesEngine (Commedia 12 Games Edition) initialized");
  },

  // Helper per estrarre i dati del caso
  getData: function(caseData) {
    if (!caseData) return DANTE_GAMES_DATA.default;
    const cid = (caseData.id || caseData.characterId || '').toLowerCase();
    if (cid.includes('francesca') || cid.includes('paolo')) return DANTE_GAMES_DATA.francesca;
    if (cid.includes('ulisse') || cid.includes('diomede')) return DANTE_GAMES_DATA.ulisse;
    if (cid.includes('ugolino') || cid.includes('ruggieri')) return DANTE_GAMES_DATA.ugolino;
    return DANTE_GAMES_DATA.default;
  },

  // Economia: uso fiorini per gli indizi
  async useFioriniForHint(cost = 2) {
    if (window.app && window.app.profile) {
      if ((window.app.profile.fiorini || 0) >= cost) {
        window.app.profile.fiorini -= cost;
        if (window.commediaDb && window.app.user && window.app.user.uid) {
          try {
            await window.commediaDb.updateUserProfile(window.app.user.uid, { fiorini: window.app.profile.fiorini });
          } catch(e) { console.warn("Errore salvataggio fiorini:", e); }
        }
        if (window.app.updateUI) window.app.updateUI();
        if (window.showToast) window.showToast(`Indizio rivelato! (-${cost} Fiorini 🪙)`, 'success');
        return true;
      } else {
        if (window.showToast) window.showToast(`Fiorini insufficienti, ma l'indizio viene concesso per sostegno didattico!`, 'info');
        return true;
      }
    }
    return true;
  },

  // Economia Opzione A: Ricompensa prima vittoria (+25 Virtù/XP, +10 Fiorini) vs replay (+5 Virtù, +2 Fiorini)
  async rewardAndNext(gameName, nextBtn, caseData) {
    const caseId = (caseData && caseData.id) ? caseData.id : 'generale';
    const storageKey = `commedia_minigame_won_${caseId}_${gameName}`;
    const alreadyWon = localStorage.getItem(storageKey) === 'true';

    let xpEarned = alreadyWon ? 5 : 25;
    let fioriniEarned = alreadyWon ? 2 : 10;
    localStorage.setItem(storageKey, 'true');

    // Aggiorna profilo utente se disponibile
    if (window.app && window.app.profile) {
      window.app.profile.xp = (window.app.profile.xp || 0) + xpEarned;
      window.app.profile.fiorini = (window.app.profile.fiorini || 0) + fioriniEarned;
      if (window.commediaDb && window.app.user && window.app.user.uid) {
        try {
          await window.commediaDb.updateUserProfile(window.app.user.uid, {
            xp: window.app.profile.xp,
            fiorini: window.app.profile.fiorini
          });
        } catch(e) { console.warn("Errore aggiornamento ricompense:", e); }
      }
      if (window.app.updateUI) window.app.updateUI();
    }

    if (window.AudioEngine && typeof window.AudioEngine.playSuccess === 'function') {
      window.AudioEngine.playSuccess();
    }

    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.classList.add('glow');
    }

    const area = document.getElementById('active-minigame-area');
    if (area) {
      area.innerHTML = `
        <div class="animate-fade-in" style="background: rgba(22,163,74,0.15); border: 1px solid #16a34a; border-radius: 10px; padding: 22px; text-align: center; margin-top: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">⚖️</div>
          <h4 style="color: #4ade80; margin-bottom: 10px; font-family: 'Julius Sans One', sans-serif;">Prova Acquisita agli Atti della Corte!</h4>
          <p style="color: #f5f5f0; font-size: 0.95rem; margin-bottom: 14px;">
            Hai superato l'indagine <strong>${gameName}</strong> con acume logico e precisione filologica.
          </p>
          <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 15px; font-weight: bold; font-size: 0.95rem;">
            <span style="color: #60a5fa; background: rgba(96,165,250,0.15); border: 1px solid rgba(96,165,250,0.3); padding: 4px 12px; border-radius: 6px;"><i class="fa-solid fa-star"></i> +${xpEarned} Virtù (XP)</span>
            <span style="color: var(--accent-gold, #d4af37); background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.3); padding: 4px 12px; border-radius: 6px;"><i class="fa-solid fa-coins"></i> +${fioriniEarned} Fiorini 🪙</span>
          </div>
          <div style="background: rgba(212,175,55,0.08); border-left: 3px solid var(--accent-gold, #d4af37); padding: 10px 14px; border-radius: 4px; text-align: left; font-size: 0.85rem; color: #ddd; margin-top: 10px;">
            <strong>💡 Pillola di Diritto Medievale:</strong> I giuristi dello Studio Fiorentino consideravano la testimonianza dei versi e l'esame documentale il fondamento supremo della Giustizia Poetica.
          </div>
        </div>
      `;
    }

    if (window.showToast) {
      window.showToast(`Indagine '${gameName}' superata! (+${xpEarned} XP, +${fioriniEarned} Fiorini)`, 'success');
    }
  },

  // Skip amichevole
  skipMinigame: function(nextBtn, gameName) {
    if (window.showToast) window.showToast(`Indagine '${gameName}' superata con successo!`, 'info');
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.classList.add('glow');
    }
    const area = document.getElementById('active-minigame-area');
    if (area) {
      area.innerHTML = `
        <div style="background: rgba(22,163,74,0.15); border: 1px solid #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin-top: 15px;">
          <h5 style="color: #16a34a; margin-bottom: 10px;">✅ Prova Acquisita agli Atti</h5>
          <p style="color: #ddd; font-size: 0.95rem; margin-bottom: 12px;">Hai completato l'indagine. Puoi procedere alla fase successiva del processo.</p>
        </div>`;
    }
  },

  // =====================================================
  // FASE 3: CARICAMENTO DEI 12 METODI D'INDAGINE
  // =====================================================
  loadMinigame: function(caseData, containerElement) {
    const data = this.getData(caseData);
    const trialNextBtn = document.getElementById('trial-next-btn');
    if (trialNextBtn) trialNextBtn.disabled = true;

    const games = [
      { id: 'quiz', name: 'Quiz Epico Dantesco', lvl: '🟢 Facile', icon: 'assets/icone-giochi/1.png' },
      { id: 'impiccato', name: 'Impiccato del Contrappasso', lvl: '🟢 Facile', icon: 'assets/icone-giochi/2.png' },
      { id: 'cloze', name: 'Terzine Bucate (Cloze)', lvl: '🟡 Intermedio', icon: 'assets/icone-giochi/3.png' },
      { id: 'puzzle', name: 'Mosaico dei Canti', lvl: '🟡 Intermedio', icon: 'assets/icone-giochi/4.png' },
      { id: 'versi', name: 'Riordina le Terzine', lvl: '🔵 Avanzato', icon: 'assets/icone-giochi/5.png' },
      { id: 'memory', name: 'Memory dei Cerchi', lvl: '🟢 Facile', icon: 'assets/icone-giochi/6.png' },
      { id: 'cruciverba', name: 'Cruciverba della Commedia', lvl: '🔵 Avanzato', icon: 'assets/icone-giochi/7.png' },
      { id: 'rebus', name: 'Rebus Infernale', lvl: '🟡 Intermedio', icon: 'assets/icone-giochi/8.png' },
      { id: 'crittografia', name: 'Cifrario di Caronte', lvl: '🔵 Avanzato', icon: 'assets/icone-giochi/9.png' },
      { id: 'indovinello', name: 'Indovinelli di Virgilio', lvl: '🟡 Intermedio', icon: 'assets/icone-giochi/10.png' },
      { id: 'anagramma', name: 'Anagrammi dei Canti', lvl: '🟡 Intermedio', icon: 'assets/icone-giochi/11.png' },
      { id: 'differenze', name: "L'Occhio dell'Inquisitore", lvl: '🟢 Facile', icon: 'assets/icone-giochi/12.png' }
    ];

    containerElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h4 class="text-gold" style="font-family: 'Julius Sans One', sans-serif; font-size: 1.4rem; margin-bottom: 6px;">
          Scegli il Metodo di Indagine per il Fascicolo
        </h4>
        <p style="color: #bbb; font-size: 0.88rem; max-width: 650px; margin: 0 auto 15px auto;">
          Seleziona una delle 12 tecniche d'indagine dantesca per raccogliere la prova fondamentale ed avanzare al dibattimento dell'Accusa.
        </p>

        <div class="investigation-grid-12">
          ${games.map(g => `
            <div class="investigation-card-12" id="btn-mg-${g.id}" onclick="window.MinigamesEngine.startInvestigation('${g.id}')">
              <img src="${g.icon}?v=2" alt="${g.name}" />
              <strong style="color: var(--accent-gold, #d4af37); font-size: 0.84rem; line-height: 1.2;">${g.name}</strong>
              <span style="font-size: 0.7rem; font-weight: 700; color: ${g.lvl.includes('Facile') ? '#4ade80' : g.lvl.includes('Intermedio') ? '#fde047' : '#60a5fa'};">${g.lvl}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div id="active-minigame-area" style="min-height: 250px; background: rgba(0,0,0,0.3); border: 1px dashed rgba(212,175,55,0.3); border-radius: 10px; padding: 15px;">
        <p style="text-align: center; color: #888; font-style: italic; margin-top: 30px;">
          <i class="fa-solid fa-hand-pointer" style="margin-right: 6px;"></i> Clicca su una delle 12 tecniche di indagine per iniziare la Fase 3.
        </p>
      </div>
    `;

    // Metodo interno per avviare il gioco selezionato
    this.startInvestigation = (type) => {
      const area = document.getElementById('active-minigame-area');
      if (!area) return;
      area.scrollIntoView({ behavior: 'smooth', block: 'start' });

      switch(type) {
        case 'quiz':         this.initQuiz(area, data, trialNextBtn, caseData); break;
        case 'impiccato':    this.initImpiccato(area, data, trialNextBtn, caseData); break;
        case 'cloze':        this.initCloze(area, data, trialNextBtn, caseData); break;
        case 'puzzle':       this.initPuzzle(area, data, trialNextBtn, caseData); break;
        case 'versi':        this.initVersi(area, data, trialNextBtn, caseData); break;
        case 'memory':       this.initMemory(area, data, trialNextBtn, caseData); break;
        case 'cruciverba':   this.initCruciverba(area, data, trialNextBtn, caseData); break;
        case 'rebus':        this.initRebus(area, data, trialNextBtn, caseData); break;
        case 'crittografia': this.initCrittografia(area, data, trialNextBtn, caseData); break;
        case 'indovinello':  this.initIndovinello(area, data, trialNextBtn, caseData); break;
        case 'anagramma':    this.initAnagramma(area, data, trialNextBtn, caseData); break;
        case 'differenze':   this.loadHiddenObject(area, trialNextBtn, caseData); break;
        default:             this.initQuiz(area, data, trialNextBtn, caseData); break;
      }
    };
  },

  // =====================================================
  // MOTORI DEI 12 GIOCHI INTERATTIVI
  // =====================================================

  // 1. QUIZ DANTESCO
  initQuiz: function(container, data, nextBtn, caseData) {
    const q = data.quiz;
    container.innerHTML = `
      <div class="animate-fade-in" style="background: rgba(0,0,0,0.6); border: 1px solid var(--accent-gold); border-radius: 10px; padding: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid rgba(212,175,55,0.2); padding-bottom:8px;">
          <h5 style="color:var(--accent-gold); margin:0; font-family:'Julius Sans One', sans-serif;"><img src="assets/icone-giochi/1.png" style="width:24px; vertical-align:middle; margin-right:8px;">Quiz Epico Dantesco</h5>
          <span style="font-size:0.75rem; color:#4ade80; font-weight:bold;">🟢 Facile</span>
        </div>
        <p style="font-size:1.1rem; color:#fff; line-height:1.5; margin-bottom:20px;">${q.question}</p>
        <div style="display:flex; flex-direction:column; gap:10px;" id="quiz-opts-container">
          ${q.options.map((opt, i) => `
            <button class="btn btn-secondary quiz-ans-btn" data-idx="${i}" style="text-align:left; padding:12px 15px; font-size:0.95rem; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:8px; cursor:pointer; color:#eee; transition:all 0.2s;">
              ${opt}
            </button>
          `).join('')}
        </div>
        <div style="display:flex; justify-content:center; gap:10px; margin-top:20px;">
          <button class="btn btn-secondary" id="q-hint-btn" style="background:rgba(212,175,55,0.15); border:1px solid var(--accent-gold); color:var(--accent-gold); font-size:0.85rem;"><i class="fa-solid fa-lightbulb"></i> Rivela Indizio (-2 🪙)</button>
          <button class="btn btn-secondary" id="q-skip-btn" style="background:rgba(255,255,255,0.05); color:#aaa; font-size:0.85rem;"><i class="fa-solid fa-forward-step"></i> Salta Prova</button>
        </div>
        <div id="quiz-feedback" style="margin-top:15px; display:none; padding:12px; border-radius:6px; font-size:0.95rem;"></div>
      </div>
    `;

    document.getElementById('q-hint-btn').onclick = async () => {
      await this.useFioriniForHint(2);
      const fb = document.getElementById('quiz-feedback');
      fb.style.display = 'block';
      fb.style.background = 'rgba(212,175,55,0.15)';
      fb.style.border = '1px solid var(--accent-gold)';
      fb.style.color = '#fde047';
      fb.innerHTML = `<strong>💡 Indizio:</strong> ${q.hint}`;
    };

    document.getElementById('q-skip-btn').onclick = () => this.skipMinigame(nextBtn, "Quiz Dantesco");

    container.querySelectorAll('.quiz-ans-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx);
        container.querySelectorAll('.quiz-ans-btn').forEach(b => b.disabled = true);
        const fb = document.getElementById('quiz-feedback');
        fb.style.display = 'block';

        if (idx === q.correct) {
          btn.style.background = 'rgba(34,197,94,0.3)';
          btn.style.borderColor = '#22c55e';
          fb.style.background = 'rgba(34,197,94,0.2)';
          fb.style.border = '1px solid #22c55e';
          fb.style.color = '#4ade80';
          fb.innerHTML = `<strong>✅ Esatto!</strong> ${q.explanation}`;
          setTimeout(() => this.rewardAndNext("Quiz Dantesco", nextBtn, caseData), 1200);
        } else {
          btn.style.background = 'rgba(239,68,68,0.3)';
          btn.style.borderColor = '#ef4444';
          fb.style.background = 'rgba(239,68,68,0.2)';
          fb.style.border = '1px solid #ef4444';
          fb.style.color = '#f87171';
          fb.innerHTML = `<strong>❌ Risposta errata.</strong> Riprova ad analizzare la domanda.`;
          setTimeout(() => this.initQuiz(container, data, nextBtn, caseData), 2200);
        }
      };
    });
  },

  // 2. IMPICCATO DEL CONTRAPPASSO
  initImpiccato: function(container, data, nextBtn, caseData) {
    const word = data.impiccato.word.toUpperCase();
    const hint = data.impiccato.hint;
    let guessed = new Set();
    let mistakes = 0;
    const maxMistakes = 6;

    const render = () => {
      const displayWord = word.split('').map(l => (l === ' ' ? ' ' : guessed.has(l) ? l : '_')).join(' ');
      const isWon = word.split('').every(l => l === ' ' || guessed.has(l));
      const isLost = mistakes >= maxMistakes;

      const alphabet = "ABCDEFGHILMNOPQRSTUVZ".split('');

      container.innerHTML = `
        <div class="animate-fade-in" style="background: rgba(0,0,0,0.6); border: 1px solid var(--accent-gold); border-radius: 10px; padding: 20px; text-align:center;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid rgba(212,175,55,0.2); padding-bottom:8px;">
            <h5 style="color:var(--accent-gold); margin:0; font-family:'Julius Sans One', sans-serif;"><img src="assets/icone-giochi/2.png" style="width:24px; vertical-align:middle; margin-right:8px;">L'Impiccato del Contrappasso</h5>
            <span style="font-size:0.75rem; color:#4ade80; font-weight:bold;">🟢 Facile</span>
          </div>
          <p style="color:#bbb; font-size:0.9rem; margin-bottom:15px;">Indovina la parola misteriosa prima che si compia la sentenza! Errori: <strong style="color:${mistakes > 3 ? '#ef4444' : 'var(--accent-gold)'}">${mistakes} / ${maxMistakes}</strong></p>
          <div style="font-size:2.2rem; letter-spacing:8px; font-weight:bold; color:var(--accent-gold); font-family:monospace; margin:25px 0;">${displayWord}</div>
          
          ${!isWon && !isLost ? `
            <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:6px; max-width:480px; margin:0 auto 20px auto;">
              ${alphabet.map(l => `
                <button class="btn btn-secondary letter-btn" data-letter="${l}" ${guessed.has(l) ? 'disabled style="opacity:0.3;"' : 'style="width:34px; height:34px; padding:0; font-weight:bold; font-size:0.9rem;"'}>${l}</button>
              `).join('')}
            </div>
          ` : ''}

          <div style="display:flex; justify-content:center; gap:10px; margin-top:15px; flex-wrap:wrap;">
            <button class="btn btn-secondary" id="imp-hint-btn" style="background:rgba(212,175,55,0.15); border:1px solid var(--accent-gold); color:var(--accent-gold); font-size:0.85rem;"><i class="fa-solid fa-lightbulb"></i> Aiuto (-2 🪙)</button>
            <button class="btn btn-secondary" id="imp-skip-btn" style="background:rgba(255,255,255,0.05); color:#aaa; font-size:0.85rem;"><i class="fa-solid fa-forward-step"></i> Salta Prova</button>
          </div>
          <div id="imp-feedback" style="margin-top:15px; font-size:0.95rem;"></div>
        </div>
      `;

      document.getElementById('imp-hint-btn').onclick = async () => {
        await this.useFioriniForHint(2);
        const fb = document.getElementById('imp-feedback');
        fb.innerHTML = `<span style="color:#fde047;"><strong>💡 Indizio:</strong> ${hint}</span>`;
      };

      document.getElementById('imp-skip-btn').onclick = () => this.skipMinigame(nextBtn, "Impiccato del Contrappasso");

      if (isWon) {
        const fb = document.getElementById('imp-feedback');
        fb.innerHTML = `<span style="color:#4ade80; font-weight:bold; font-size:1.1rem;">🎉 Parola decifrata con successo!</span>`;
        setTimeout(() => this.rewardAndNext("Impiccato del Contrappasso", nextBtn, caseData), 1200);
      } else if (isLost) {
        const fb = document.getElementById('imp-feedback');
        fb.innerHTML = `<span style="color:#ef4444; font-weight:bold;">Sentenza fallita! La parola era: ${word}. Ricarico...</span>`;
        setTimeout(() => this.initImpiccato(container, data, nextBtn, caseData), 2500);
      } else {
        container.querySelectorAll('.letter-btn').forEach(b => {
          b.onclick = () => {
            const letter = b.dataset.letter;
            guessed.add(letter);
            if (!word.includes(letter)) mistakes++;
            render();
          };
        });
      }
    };

    render();
  },

  // 3. TERZINE BUCATE (CLOZE)
  initCloze: function(container, data, nextBtn, caseData) {
    const clozeData = data.cloze;
    let text = clozeData.text;
    const words = clozeData.words;

    let htmlText = text;
    words.forEach(w => {
      htmlText = htmlText.replace(`{${w}}`, `<input type="text" class="cloze-input" data-word="${w.toUpperCase()}" style="width:130px; text-align:center; padding:4px 8px; border-radius:4px; border:1px solid var(--accent-gold); background:rgba(0,0,0,0.7); color:#fff; font-weight:bold; text-transform:uppercase; margin:0 4px;" placeholder="..."/>`);
    });

    container.innerHTML = `
      <div class="animate-fade-in" style="background: rgba(0,0,0,0.6); border: 1px solid var(--accent-gold); border-radius: 10px; padding: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid rgba(212,175,55,0.2); padding-bottom:8px;">
          <h5 style="color:var(--accent-gold); margin:0; font-family:'Julius Sans One', sans-serif;"><img src="assets/icone-giochi/3.png" style="width:24px; vertical-align:middle; margin-right:8px;">Terzine Bucate (Cloze)</h5>
          <span style="font-size:0.75rem; color:#fde047; font-weight:bold;">🟡 Intermedio</span>
        </div>
        <p style="color:#ccc; font-size:0.9rem; margin-bottom:20px;">Ricomponi i versi immortali inserendo le parole mancanti:</p>
        <div style="font-size:1.15rem; line-height:2.2; font-style:italic; font-family:'Times New Roman', serif; background:rgba(255,255,255,0.04); padding:20px; border-left:3px solid var(--accent-gold); border-radius:6px; color:#f5f5f0; text-align:center;">
          ${htmlText}
        </div>
        <div style="display:flex; justify-content:center; gap:10px; margin-top:20px; flex-wrap:wrap;">
          <button class="btn btn-primary" id="cloze-check-btn">Verifica Terzina</button>
          <button class="btn btn-secondary" id="cloze-hint-btn" style="background:rgba(212,175,55,0.15); border:1px solid var(--accent-gold); color:var(--accent-gold); font-size:0.85rem;"><i class="fa-solid fa-lightbulb"></i> Aiuto (-2 🪙)</button>
          <button class="btn btn-secondary" id="cloze-skip-btn" style="background:rgba(255,255,255,0.05); color:#aaa; font-size:0.85rem;"><i class="fa-solid fa-forward-step"></i> Salta Prova</button>
        </div>
        <div id="cloze-feedback" style="margin-top:15px; display:none; padding:10px; border-radius:6px; text-align:center;"></div>
      </div>
    `;

    document.getElementById('cloze-hint-btn').onclick = async () => {
      await this.useFioriniForHint(2);
      const inputs = container.querySelectorAll('.cloze-input');
      inputs.forEach(inp => {
        if (!inp.value) {
          const w = inp.dataset.word;
          inp.value = w.substring(0, 2);
        }
      });
      if (window.showToast) window.showToast(`Iniziali suggerite!`, 'info');
    };

    document.getElementById('cloze-skip-btn').onclick = () => this.skipMinigame(nextBtn, "Terzine Bucate");

    document.getElementById('cloze-check-btn').onclick = () => {
      const inputs = container.querySelectorAll('.cloze-input');
      let allCorrect = true;
      inputs.forEach(inp => {
        const expected = inp.dataset.word;
        const val = inp.value.trim().toUpperCase();
        if (val === expected) {
          inp.style.borderColor = '#22c55e';
          inp.style.background = 'rgba(34,197,94,0.2)';
        } else {
          inp.style.borderColor = '#ef4444';
          inp.style.background = 'rgba(239,68,68,0.2)';
          allCorrect = false;
        }
      });

      const fb = document.getElementById('cloze-feedback');
      fb.style.display = 'block';
      if (allCorrect) {
        fb.style.background = 'rgba(34,197,94,0.2)';
        fb.style.color = '#4ade80';
        fb.innerHTML = `<strong>✅ Splendido!</strong> La terzina dantesca è stata perfettamente ricostruita.`;
        setTimeout(() => this.rewardAndNext("Terzine Bucate", nextBtn, caseData), 1200);
      } else {
        fb.style.background = 'rgba(239,68,68,0.2)';
        fb.style.color = '#f87171';
        fb.innerHTML = `<strong>Alcune parole sono errate.</strong> Rivedi la rima e il lessico del canto.`;
      }
    };
  },

  // 4. MOSAICO / PUZZLE DI FRASI
  initPuzzle: function(container, data, nextBtn, caseData) {
    const fullSentence = data.puzzle.sentence;
    const words = fullSentence.split(' ');
    let scrambled = [...words].sort(() => Math.random() - 0.5);
    let selected = [];

    const render = () => {
      container.innerHTML = `
        <div class="animate-fade-in" style="background: rgba(0,0,0,0.6); border: 1px solid var(--accent-gold); border-radius: 10px; padding: 20px; text-align:center;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid rgba(212,175,55,0.2); padding-bottom:8px;">
            <h5 style="color:var(--accent-gold); margin:0; font-family:'Julius Sans One', sans-serif;"><img src="assets/icone-giochi/4.png" style="width:24px; vertical-align:middle; margin-right:8px;">Mosaico dei Canti (Puzzle)</h5>
            <span style="font-size:0.75rem; color:#fde047; font-weight:bold;">🟡 Intermedio</span>
          </div>
          <p style="color:#bbb; font-size:0.9rem; margin-bottom:15px;">Clicca sui tasselli nell'ordine corretto per ricomporre la celebre sentenza:</p>
          
          <div style="min-height:55px; background:rgba(0,0,0,0.7); border:1px dashed var(--accent-gold); border-radius:8px; padding:10px; display:flex; flex-wrap:wrap; gap:8px; justify-content:center; align-items:center; margin-bottom:20px;">
            ${selected.length === 0 ? '<span style="color:#666; font-style:italic;">I tasselli selezionati compariranno qui...</span>' : ''}
            ${selected.map((w, idx) => `
              <button class="anagram-chip selected-chip" data-idx="${idx}" style="background:rgba(34,197,94,0.2); border-color:#22c55e;">${w} ✕</button>
            `).join('')}
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:20px;">
            ${scrambled.map((w, idx) => `
              <button class="anagram-chip available-chip" data-idx="${idx}">${w}</button>
            `).join('')}
          </div>

          <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-primary" id="puz-check-btn">Verifica Sequenza</button>
            <button class="btn btn-secondary" id="puz-hint-btn" style="background:rgba(212,175,55,0.15); border:1px solid var(--accent-gold); color:var(--accent-gold); font-size:0.85rem;"><i class="fa-solid fa-lightbulb"></i> Aiuto (-2 🪙)</button>
            <button class="btn btn-secondary" id="puz-skip-btn" style="background:rgba(255,255,255,0.05); color:#aaa; font-size:0.85rem;"><i class="fa-solid fa-forward-step"></i> Salta Prova</button>
          </div>
          <div id="puz-feedback" style="margin-top:15px; display:none; padding:10px; border-radius:6px;"></div>
        </div>
      `;

      container.querySelectorAll('.available-chip').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.idx);
          selected.push(scrambled[idx]);
          scrambled.splice(idx, 1);
          render();
        };
      });

      container.querySelectorAll('.selected-chip').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.idx);
          scrambled.push(selected[idx]);
          selected.splice(idx, 1);
          render();
        };
      });

      document.getElementById('puz-hint-btn').onclick = async () => {
        await this.useFioriniForHint(2);
        const nextCorrectWord = words[selected.length];
        if (nextCorrectWord) {
          const sIdx = scrambled.indexOf(nextCorrectWord);
          if (sIdx !== -1) {
            selected.push(scrambled[sIdx]);
            scrambled.splice(sIdx, 1);
            render();
          }
        }
      };

      document.getElementById('puz-skip-btn').onclick = () => this.skipMinigame(nextBtn, "Mosaico dei Canti");

      document.getElementById('puz-check-btn').onclick = () => {
        const currentSentence = selected.join(' ');
        const fb = document.getElementById('puz-feedback');
        fb.style.display = 'block';

        if (currentSentence === fullSentence) {
          fb.style.background = 'rgba(34,197,94,0.2)';
          fb.style.color = '#4ade80';
          fb.innerHTML = `<strong>✅ Mosaico Completo!</strong> "${fullSentence}"`;
          setTimeout(() => this.rewardAndNext("Mosaico dei Canti", nextBtn, caseData), 1200);
        } else {
          fb.style.background = 'rgba(239,68,68,0.2)';
          fb.style.color = '#f87171';
          fb.innerHTML = `<strong>L'ordine non è corretto.</strong> Riprova ad allineare i tasselli del verso.`;
        }
      };
    };

    render();
  },

  // 5. RIORDINA LE TERZINE
  initVersi: function(container, data, nextBtn, caseData) {
    const correctLines = data.versi.lines;
    let currentLines = [...correctLines].sort(() => Math.random() - 0.5);

    const render = () => {
      container.innerHTML = `
        <div class="animate-fade-in" style="background: rgba(0,0,0,0.6); border: 1px solid var(--accent-gold); border-radius: 10px; padding: 20px; text-align:center;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid rgba(212,175,55,0.2); padding-bottom:8px;">
            <h5 style="color:var(--accent-gold); margin:0; font-family:'Julius Sans One', sans-serif;"><img src="assets/icone-giochi/5.png" style="width:24px; vertical-align:middle; margin-right:8px;">Riordina la Terzina Incatenata</h5>
            <span style="font-size:0.75rem; color:#60a5fa; font-weight:bold;">🔵 Avanzato</span>
          </div>
          <p style="color:#bbb; font-size:0.9rem; margin-bottom:15px;">Usa i pulsanti freccia per disporre i 3 versi nel loro ordine poetico originale:</p>
          
          <div style="display:flex; flex-direction:column; gap:10px; max-width:550px; margin:0 auto 20px auto;">
            ${currentLines.map((line, idx) => `
              <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.06); border:1px solid rgba(212,175,55,0.3); border-radius:8px; padding:10px 14px; font-family:'Times New Roman', serif; font-size:1.1rem; font-style:italic; color:#eee;">
                <span>${line}</span>
                <div style="display:flex; gap:4px;">
                  <button class="btn btn-secondary move-up-btn" data-idx="${idx}" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''}><i class="fa-solid fa-arrow-up"></i></button>
                  <button class="btn btn-secondary move-down-btn" data-idx="${idx}" ${idx === currentLines.length - 1 ? 'disabled style="opacity:0.3;"' : ''}><i class="fa-solid fa-arrow-down"></i></button>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
            <button class="btn btn-primary" id="versi-check-btn">Sigilla Versi</button>
            <button class="btn btn-secondary" id="versi-hint-btn" style="background:rgba(212,175,55,0.15); border:1px solid var(--accent-gold); color:var(--accent-gold); font-size:0.85rem;"><i class="fa-solid fa-lightbulb"></i> Aiuto Rima (-2 🪙)</button>
            <button class="btn btn-secondary" id="versi-skip-btn" style="background:rgba(255,255,255,0.05); color:#aaa; font-size:0.85rem;"><i class="fa-solid fa-forward-step"></i> Salta Prova</button>
          </div>
          <div id="versi-feedback" style="margin-top:15px; display:none; padding:10px; border-radius:6px;"></div>
        </div>
      `;

      container.querySelectorAll('.move-up-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.idx);
          if (idx > 0) {
            const temp = currentLines[idx];
            currentLines[idx] = currentLines[idx - 1];
            currentLines[idx - 1] = temp;
            render();
          }
        };
      });

      container.querySelectorAll('.move-down-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.idx);
          if (idx < currentLines.length - 1) {
            const temp = currentLines[idx];
            currentLines[idx] = currentLines[idx + 1];
            currentLines[idx + 1] = temp;
            render();
          }
        };
      });

      document.getElementById('versi-hint-btn').onclick = async () => {
        await this.useFioriniForHint(2);
        currentLines = [...correctLines];
        render();
        if (window.showToast) window.showToast("La terzina è stata riallineata!", "info");
      };

      document.getElementById('versi-skip-btn').onclick = () => this.skipMinigame(nextBtn, "Riordina Versi");

      document.getElementById('versi-check-btn').onclick = () => {
        const isCorrect = currentLines.every((l, i) => l === correctLines[i]);
        const fb = document.getElementById('versi-feedback');
        fb.style.display = 'block';

        if (isCorrect) {
          fb.style.background = 'rgba(34,197,94,0.2)';
          fb.style.color = '#4ade80';
          fb.innerHTML = `<strong>✅ Armonia Perfetta!</strong> La terzina incatenata rispetta la metrica dantesca.`;
          setTimeout(() => this.rewardAndNext("Riordina Versi", nextBtn, caseData), 1200);
        } else {
          fb.style.background = 'rgba(239,68,68,0.2)';
          fb.style.color = '#f87171';
          fb.innerHTML = `<strong>L'ordine non è esatto.</strong> Controlla le rime alterne endecasillabe.`;
        }
      };
    };

    render();
  },

  // 6. MEMORY DEI CERCHI E DEI BEATI
  initMemory: function(container, data, nextBtn, caseData) {
    const rawPairs = data.memory;
    let cards = [];
    rawPairs.forEach(p => {
      cards.push({ id: p.id, text: p.text, type: 'name' });
      cards.push({ id: p.id, text: p.match, type: 'match' });
    });
    cards.sort(() => Math.random() - 0.5);

    let flipped = [];
    let matchedIds = new Set();

    const render = () => {
      container.innerHTML = `
        <div class="animate-fade-in" style="background: rgba(0,0,0,0.6); border: 1px solid var(--accent-gold); border-radius: 10px; padding: 20px; text-align:center;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid rgba(212,175,55,0.2); padding-bottom:8px;">
            <h5 style="color:var(--accent-gold); margin:0; font-family:'Julius Sans One', sans-serif;"><img src="assets/icone-giochi/6.png" style="width:24px; vertical-align:middle; margin-right:8px;">Memory dei Cerchi e dei Beati</h5>
            <span style="font-size:0.75rem; color:#4ade80; font-weight:bold;">🟢 Facile</span>
          </div>
          <p style="color:#bbb; font-size:0.9rem; margin-bottom:15px;">Accoppia ciascun personaggio con il suo ruolo o cerchio nell'Oltretomba:</p>
          
          <div class="memory-grid">
            ${cards.map((c, idx) => {
              const isFlipped = flipped.includes(idx) || matchedIds.has(c.id);
              const isMatched = matchedIds.has(c.id);
              return `
                <div class="memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}" data-idx="${idx}">
                  ${isFlipped ? `<span style="font-size:0.78rem; font-weight:600; color:${isMatched ? '#4ade80' : 'var(--accent-gold)'}; line-height:1.2;">${c.text}</span>` : '<span style="font-size:1.4rem;">📜</span>'}
                </div>
              `;
            }).join('')}
          </div>

          <div style="display:flex; justify-content:center; gap:10px; margin-top:20px; flex-wrap:wrap;">
            <button class="btn btn-secondary" id="mem-hint-btn" style="background:rgba(212,175,55,0.15); border:1px solid var(--accent-gold); color:var(--accent-gold); font-size:0.85rem;"><i class="fa-solid fa-lightbulb"></i> Rivela 1 Coppia (-2 🪙)</button>
            <button class="btn btn-secondary" id="mem-skip-btn" style="background:rgba(255,255,255,0.05); color:#aaa; font-size:0.85rem;"><i class="fa-solid fa-forward-step"></i> Salta Prova</button>
          </div>
        </div>
      `;

      container.querySelectorAll('.memory-card').forEach(card => {
        card.onclick = () => {
          const idx = parseInt(card.dataset.idx);
          if (flipped.length >= 2 || flipped.includes(idx) || matchedIds.has(cards[idx].id)) return;

          flipped.push(idx);
          render();

          if (flipped.length === 2) {
            const c1 = cards[flipped[0]];
            const c2 = cards[flipped[1]];
            if (c1.id === c2.id) {
              matchedIds.add(c1.id);
              flipped = [];
              if (matchedIds.size === rawPairs.length) {
                setTimeout(() => this.rewardAndNext("Memory dei Cerchi", nextBtn, caseData), 1000);
              } else {
                render();
              }
            } else {
              setTimeout(() => {
                flipped = [];
                render();
              }, 1200);
            }
          }
        };
      });

      document.getElementById('mem-hint-btn').onclick = async () => {
        await this.useFioriniForHint(2);
        for (let p of rawPairs) {
          if (!matchedIds.has(p.id)) {
            matchedIds.add(p.id);
            break;
          }
        }
        render();
        if (matchedIds.size === rawPairs.length) {
          setTimeout(() => this.rewardAndNext("Memory dei Cerchi", nextBtn, caseData), 1000);
        }
      };

      document.getElementById('mem-skip-btn').onclick = () => this.skipMinigame(nextBtn, "Memory dei Cerchi");
    };

    render();
  },

  // 7. CRUCIVERBA DELLA COMMEDIA
  initCruciverba: function(container, data, nextBtn, caseData) {
    const cw = data.cruciverba;
    const grid = cw.grid;
    const rows = grid.length;
    const cols = grid[0].length;

    container.innerHTML = `
      <div class="animate-fade-in" style="background: rgba(0,0,0,0.6); border: 1px solid var(--accent-gold); border-radius: 10px; padding: 20px; text-align:center;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid rgba(212,175,55,0.2); padding-bottom:8px;">
          <h5 style="color:var(--accent-gold); margin:0; font-family:'Julius Sans One', sans-serif;"><img src="assets/icone-giochi/7.png" style="width:24px; vertical-align:middle; margin-right:8px;">Parole Crociate della Commedia</h5>
          <span style="font-size:0.75rem; color:#60a5fa; font-weight:bold;">🔵 Avanzato</span>
        </div>
        <p style="color:#bbb; font-size:0.88rem; margin-bottom:15px;">Completa lo schema con le definizioni storiche e letterarie:</p>

        <div style="display:flex; justify-content:center; margin-bottom:20px;">
          <div class="cw-grid" style="grid-template-columns: repeat(${cols}, 34px);">
            ${grid.map((row, r) => row.map((cell, c) => {
              if (cell === '#') return `<div class="cw-cell cw-black"></div>`;
              return `
                <div class="cw-cell">
                  <input type="text" maxlength="1" class="cw-inp" data-r="${r}" data-c="${c}" data-sol="${cell}" />
                </div>
              `;
            }).join('')).join('')}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; text-align:left; font-size:0.8rem; background:rgba(0,0,0,0.4); padding:10px; border-radius:6px; margin-bottom:15px;">
          <div>
            <strong style="color:var(--accent-gold);">ORIZZONTALI:</strong>
            <ul style="padding-left:16px; margin:4px 0 0 0; color:#ddd;">
              ${cw.across.map(a => `<li><strong>${a.num}.</strong> ${a.clue}</li>`).join('')}
            </ul>
          </div>
          <div>
            <strong style="color:var(--accent-gold);">VERTICALI:</strong>
            <ul style="padding-left:16px; margin:4px 0 0 0; color:#ddd;">
              ${cw.down.map(d => `<li><strong>${d.num}.</strong> ${d.clue}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          <button class="btn btn-primary" id="cw-check-btn">Verifica Schema</button>
          <button class="btn btn-secondary" id="cw-hint-btn" style="background:rgba(212,175,55,0.15); border:1px solid var(--accent-gold); color:var(--accent-gold); font-size:0.85rem;"><i class="fa-solid fa-lightbulb"></i> Rivela 1 Parola (-2 🪙)</button>
          <button class="btn btn-secondary" id="cw-skip-btn" style="background:rgba(255,255,255,0.05); color:#aaa; font-size:0.85rem;"><i class="fa-solid fa-forward-step"></i> Salta Prova</button>
        </div>
        <div id="cw-feedback" style="margin-top:12px; display:none; padding:8px; border-radius:6px;"></div>
      </div>
    `;

    document.getElementById('cw-hint-btn').onclick = async () => {
      await this.useFioriniForHint(2);
      const inps = container.querySelectorAll('.cw-inp');
      for (let inp of inps) {
        if (!inp.value || inp.value.toUpperCase() !== inp.dataset.sol) {
          inp.value = inp.dataset.sol;
          inp.style.background = 'rgba(212,175,55,0.3)';
          break;
        }
      }
    };

    document.getElementById('cw-skip-btn').onclick = () => this.skipMinigame(nextBtn, "Cruciverba della Commedia");

    document.getElementById('cw-check-btn').onclick = () => {
      const inps = container.querySelectorAll('.cw-inp');
      let allCorrect = true;
      inps.forEach(inp => {
        if (inp.value.toUpperCase() === inp.dataset.sol) {
          inp.style.borderColor = '#22c55e';
        } else {
          inp.style.borderColor = '#ef4444';
          allCorrect = false;
        }
      });

      const fb = document.getElementById('cw-feedback');
      fb.style.display = 'block';
      if (allCorrect) {
        fb.style.background = 'rgba(34,197,94,0.2)';
        fb.style.color = '#4ade80';
        fb.innerHTML = `<strong>✅ Cruciverba Risolto!</strong> Tutte le definizioni coincidono.`;
        setTimeout(() => this.rewardAndNext("Cruciverba della Commedia", nextBtn, caseData), 1200);
      } else {
        fb.style.background = 'rgba(239,68,68,0.2)';
        fb.style.color = '#f87171';
        fb.innerHTML = `<strong>Alcune lettere sono errate.</strong> Rivedi i crocevia.`;
      }
    };
  },

  // 8. REBUS INFERNALE
  initRebus: function(container, data, nextBtn, caseData) {
    const reb = data.rebus;
    container.innerHTML = `
      <div class="animate-fade-in" style="background: rgba(0,0,0,0.6); border: 1px solid var(--accent-gold); border-radius: 10px; padding: 20px; text-align:center;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid rgba(212,175,55,0.2); padding-bottom:8px;">
          <h5 style="color:var(--accent-gold); margin:0; font-family:'Julius Sans One', sans-serif;"><img src="assets/icone-giochi/8.png" style="width:24px; vertical-align:middle; margin-right:8px;">Rebus Infernale</h5>
          <span style="font-size:0.75rem; color:#fde047; font-weight:bold;">🟡 Intermedio</span>
        </div>
        <p style="color:#bbb; font-size:0.9rem; margin-bottom:20px;">Interpreta i simboli allegorici per scoprire la parola celata:</p>
        
        <div class="rebus-box">
          <div style="font-size:3rem; letter-spacing:15px; margin-bottom:12px;">${reb.icons.join(' ')}</div>
          <p style="color:#aaa; font-size:0.85rem; margin:0;">Lunghezza parola: <strong>${reb.solution.length} lettere</strong></p>
        </div>

        <div style="display:flex; justify-content:center; gap:10px; margin-top:20px; flex-wrap:wrap;">
          <input type="text" id="reb-input" class="form-input" placeholder="Scrivi la soluzione..." style="width:220px; text-transform:uppercase; text-align:center; font-weight:bold; letter-spacing:2px;" />
          <button class="btn btn-primary" id="reb-check-btn">Decifra Rebus</button>
          <button class="btn btn-secondary" id="reb-hint-btn" style="background:rgba(212,175,55,0.15); border:1px solid var(--accent-gold); color:var(--accent-gold); font-size:0.85rem;"><i class="fa-solid fa-lightbulb"></i> Aiuto (-2 🪙)</button>
          <button class="btn btn-secondary" id="reb-skip-btn" style="background:rgba(255,255,255,0.05); color:#aaa; font-size:0.85rem;"><i class="fa-solid fa-forward-step"></i> Salta Prova</button>
        </div>
        <div id="reb-feedback" style="margin-top:15px; display:none; padding:10px; border-radius:6px;"></div>
      </div>
    `;

    document.getElementById('reb-hint-btn').onclick = async () => {
      await this.useFioriniForHint(2);
      const inp = document.getElementById('reb-input');
      inp.value = reb.solution.substring(0, 2);
      if (window.showToast) window.showToast(`Indizio: ${reb.hint}`, 'info');
    };

    document.getElementById('reb-skip-btn').onclick = () => this.skipMinigame(nextBtn, "Rebus Infernale");

    document.getElementById('reb-check-btn').onclick = () => {
      const val = document.getElementById('reb-input').value.trim().toUpperCase();
      const fb = document.getElementById('reb-feedback');
      fb.style.display = 'block';

      if (val === reb.solution.toUpperCase()) {
        fb.style.background = 'rgba(34,197,94,0.2)';
        fb.style.color = '#4ade80';
        fb.innerHTML = `<strong>✅ Decifrazione Esatta!</strong> Parola: <strong>${reb.solution}</strong>`;
        setTimeout(() => this.rewardAndNext("Rebus Infernale", nextBtn, caseData), 1200);
      } else {
        fb.style.background = 'rgba(239,68,68,0.2)';
        fb.style.color = '#f87171';
        fb.innerHTML = `<strong>Soluzione errata.</strong> Esamina attentamente i grafemi e le allegorie.`;
      }
    };
  },

  // 9. CRITTOGRAFIA DI CARONTE
  initCrittografia: function(container, data, nextBtn, caseData) {
    const cry = data.crittografia;
    container.innerHTML = `
      <div class="animate-fade-in" style="background: rgba(0,0,0,0.6); border: 1px solid var(--accent-gold); border-radius: 10px; padding: 20px; text-align:center;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid rgba(212,175,55,0.2); padding-bottom:8px;">
          <h5 style="color:var(--accent-gold); margin:0; font-family:'Julius Sans One', sans-serif;"><img src="assets/icone-giochi/9.png" style="width:24px; vertical-align:middle; margin-right:8px;">Cifrario di Caronte</h5>
          <span style="font-size:0.75rem; color:#60a5fa; font-weight:bold;">🔵 Avanzato</span>
        </div>
        <p style="color:#bbb; font-size:0.9rem; margin-bottom:15px;">Decodifica la sentenza cifrata con spostamento di Cesare (+1 alfabeto):</p>
        
        <div class="crypto-box">
          <div style="font-size:1.3rem; letter-spacing:4px; font-family:monospace; color:var(--accent-gold); font-weight:bold;">
            ${cry.cipher}
          </div>
        </div>

        <div style="display:flex; justify-content:center; gap:10px; margin-top:20px; flex-wrap:wrap;">
          <input type="text" id="cry-input" class="form-input" placeholder="Trascrivi il verso in chiaro..." style="width:340px; text-transform:uppercase; text-align:center; font-weight:bold;" />
          <button class="btn btn-primary" id="cry-check-btn">Decifra Testo</button>
          <button class="btn btn-secondary" id="cry-hint-btn" style="background:rgba(212,175,55,0.15); border:1px solid var(--accent-gold); color:var(--accent-gold); font-size:0.85rem;"><i class="fa-solid fa-lightbulb"></i> Aiuto Cifrario (-2 🪙)</button>
          <button class="btn btn-secondary" id="cry-skip-btn" style="background:rgba(255,255,255,0.05); color:#aaa; font-size:0.85rem;"><i class="fa-solid fa-forward-step"></i> Salta Prova</button>
        </div>
        <div id="cry-feedback" style="margin-top:15px; display:none; padding:10px; border-radius:6px;"></div>
      </div>
    `;

    document.getElementById('cry-hint-btn').onclick = async () => {
      await this.useFioriniForHint(2);
      const inp = document.getElementById('cry-input');
      inp.value = cry.solution.substring(0, 8);
      if (window.showToast) window.showToast(`Inizio suggerito: ${cry.solution.substring(0, 8)}...`, 'info');
    };

    document.getElementById('cry-skip-btn').onclick = () => this.skipMinigame(nextBtn, "Cifrario di Caronte");

    document.getElementById('cry-check-btn').onclick = () => {
      const val = document.getElementById('cry-input').value.trim().toUpperCase().replace(/[^A-Z]/g, '');
      const expected = cry.solution.toUpperCase().replace(/[^A-Z]/g, '');
      const fb = document.getElementById('cry-feedback');
      fb.style.display = 'block';

      if (val === expected) {
        fb.style.background = 'rgba(34,197,94,0.2)';
        fb.style.color = '#4ade80';
        fb.innerHTML = `<strong>✅ Cifratura Svelata!</strong> "${cry.solution}"`;
        setTimeout(() => this.rewardAndNext("Cifrario di Caronte", nextBtn, caseData), 1200);
      } else {
        fb.style.background = 'rgba(239,68,68,0.2)';
        fb.style.color = '#f87171';
        fb.innerHTML = `<strong>Decodifica errata.</strong> Scala ogni lettera di una posizione indietro nell'alfabeto (B->A, N->M...).`;
      }
    };
  },

  // 10. INDOVINELLI DI VIRGILIO
  initIndovinello: function(container, data, nextBtn, caseData) {
    const ind = data.indovinello;
    container.innerHTML = `
      <div class="animate-fade-in" style="background: rgba(0,0,0,0.6); border: 1px solid var(--accent-gold); border-radius: 10px; padding: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid rgba(212,175,55,0.2); padding-bottom:8px;">
          <h5 style="color:var(--accent-gold); margin:0; font-family:'Julius Sans One', sans-serif;"><img src="assets/icone-giochi/10.png" style="width:24px; vertical-align:middle; margin-right:8px;">Indovinelli di Virgilio</h5>
          <span style="font-size:0.75rem; color:#fde047; font-weight:bold;">🟡 Intermedio</span>
        </div>
        <div style="background:rgba(212,175,55,0.08); border-left:3px solid var(--accent-gold); padding:16px; border-radius:6px; margin-bottom:20px;">
          <p style="color:#f5f5f0; font-size:1.1rem; line-height:1.6; font-style:italic; margin:0;">"${ind.riddle}"</p>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${ind.options.map((opt, i) => `
            <button class="btn btn-secondary ind-ans-btn" data-idx="${i}" style="text-align:left; padding:12px 15px; font-size:0.95rem; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); border-radius:8px; cursor:pointer; color:#eee;">
              ${opt}
            </button>
          `).join('')}
        </div>
        <div style="display:flex; justify-content:center; gap:10px; margin-top:20px;">
          <button class="btn btn-secondary" id="ind-hint-btn" style="background:rgba(212,175,55,0.15); border:1px solid var(--accent-gold); color:var(--accent-gold); font-size:0.85rem;"><i class="fa-solid fa-lightbulb"></i> Aiuto del Maestro (-2 🪙)</button>
          <button class="btn btn-secondary" id="ind-skip-btn" style="background:rgba(255,255,255,0.05); color:#aaa; font-size:0.85rem;"><i class="fa-solid fa-forward-step"></i> Salta Prova</button>
        </div>
        <div id="ind-feedback" style="margin-top:15px; display:none; padding:10px; border-radius:6px;"></div>
      </div>
    `;

    document.getElementById('ind-hint-btn').onclick = async () => {
      await this.useFioriniForHint(2);
      const fb = document.getElementById('ind-feedback');
      fb.style.display = 'block';
      fb.style.background = 'rgba(212,175,55,0.15)';
      fb.style.color = '#fde047';
      fb.innerHTML = `<strong>💡 Suggerimento di Virgilio:</strong> ${ind.hint}`;
    };

    document.getElementById('ind-skip-btn').onclick = () => this.skipMinigame(nextBtn, "Indovinelli di Virgilio");

    container.querySelectorAll('.ind-ans-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx);
        container.querySelectorAll('.ind-ans-btn').forEach(b => b.disabled = true);
        const fb = document.getElementById('ind-feedback');
        fb.style.display = 'block';

        if (idx === ind.correct) {
          btn.style.background = 'rgba(34,197,94,0.3)';
          btn.style.borderColor = '#22c55e';
          fb.style.background = 'rgba(34,197,94,0.2)';
          fb.style.color = '#4ade80';
          fb.innerHTML = `<strong>✅ Enigma Sciolto!</strong> Hai colto la retta allegoria morale.`;
          setTimeout(() => this.rewardAndNext("Indovinelli di Virgilio", nextBtn, caseData), 1200);
        } else {
          btn.style.background = 'rgba(239,68,68,0.3)';
          btn.style.borderColor = '#ef4444';
          fb.style.background = 'rgba(239,68,68,0.2)';
          fb.style.color = '#f87171';
          fb.innerHTML = `<strong>Interpretazione fallita.</strong> Riprova ad ascoltare la voce di Virgilio.`;
          setTimeout(() => this.initIndovinello(container, data, nextBtn, caseData), 2200);
        }
      };
    });
  },

  // 11. ANAGRAMMI DEI CANTI
  initAnagramma: function(container, data, nextBtn, caseData) {
    const ana = data.anagramma;
    container.innerHTML = `
      <div class="animate-fade-in" style="background: rgba(0,0,0,0.6); border: 1px solid var(--accent-gold); border-radius: 10px; padding: 20px; text-align:center;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid rgba(212,175,55,0.2); padding-bottom:8px;">
          <h5 style="color:var(--accent-gold); margin:0; font-family:'Julius Sans One', sans-serif;"><img src="assets/icone-giochi/11.png" style="width:24px; vertical-align:middle; margin-right:8px;">Anagrammi dei Canti</h5>
          <span style="font-size:0.75rem; color:#fde047; font-weight:bold;">🟡 Intermedio</span>
        </div>
        <p style="color:#bbb; font-size:0.9rem; margin-bottom:15px;">Riorganizza le lettere per ricomporre il nome dantesco:</p>
        
        <div style="display:flex; justify-content:center; gap:8px; margin:20px 0; flex-wrap:wrap;">
          ${ana.scrambled.split('-').map(l => `
            <span class="anagram-chip">${l}</span>
          `).join('')}
        </div>

        <div style="display:flex; justify-content:center; gap:10px; margin-top:20px; flex-wrap:wrap;">
          <input type="text" id="ana-input" class="form-input" placeholder="Scrivi la parola..." style="width:220px; text-transform:uppercase; text-align:center; font-weight:bold; letter-spacing:2px;" />
          <button class="btn btn-primary" id="ana-check-btn">Risolvi Anagramma</button>
          <button class="btn btn-secondary" id="ana-hint-btn" style="background:rgba(212,175,55,0.15); border:1px solid var(--accent-gold); color:var(--accent-gold); font-size:0.85rem;"><i class="fa-solid fa-lightbulb"></i> Aiuto (-2 🪙)</button>
          <button class="btn btn-secondary" id="ana-skip-btn" style="background:rgba(255,255,255,0.05); color:#aaa; font-size:0.85rem;"><i class="fa-solid fa-forward-step"></i> Salta Prova</button>
        </div>
        <div id="ana-feedback" style="margin-top:15px; display:none; padding:10px; border-radius:6px;"></div>
      </div>
    `;

    document.getElementById('ana-hint-btn').onclick = async () => {
      await this.useFioriniForHint(2);
      const inp = document.getElementById('ana-input');
      inp.value = ana.solution.substring(0, 3);
      if (window.showToast) window.showToast(`Indizio: ${ana.hint}`, 'info');
    };

    document.getElementById('ana-skip-btn').onclick = () => this.skipMinigame(nextBtn, "Anagrammi dei Canti");

    document.getElementById('ana-check-btn').onclick = () => {
      const val = document.getElementById('ana-input').value.trim().toUpperCase().replace(/[^A-Z]/g, '');
      const expected = ana.solution.toUpperCase().replace(/[^A-Z]/g, '');
      const fb = document.getElementById('ana-feedback');
      fb.style.display = 'block';

      if (val === expected) {
        fb.style.background = 'rgba(34,197,94,0.2)';
        fb.style.color = '#4ade80';
        fb.innerHTML = `<strong>✅ Anagramma Risolto!</strong> Parola: <strong>${ana.solution}</strong>`;
        setTimeout(() => this.rewardAndNext("Anagrammi dei Canti", nextBtn, caseData), 1200);
      } else {
        fb.style.background = 'rgba(239,68,68,0.2)';
        fb.style.color = '#f87171';
        fb.innerHTML = `<strong>Parola errata.</strong> Ricombina tutte le lettere senza ometterne alcuna.`;
      }
    };
  },

  // 12. OCCHIO DELL'INQUISITORE (DIFFERENZE / INDAGINE PROVE)
  loadHiddenObject: function(container, nextBtn, caseData) {
    if (nextBtn) nextBtn.disabled = true;
    const imgSrc = caseData && caseData.image ? caseData.image : 'assets/Immagini/12.png';
    const clues = (this.getData(caseData).differenze.clues) || ["La Prova Sigillata", "Il Tomo delle Leggi", "La Bilancia di Giustizia"];
    
    container.innerHTML = `
      <div class="minigame-wrapper animate-fade-in" style="background: rgba(0,0,0,0.6); border-radius: 8px; border: 1px solid var(--accent-gold); overflow: hidden; position: relative;">
        <div style="padding: 10px; background: rgba(0,0,0,0.8); text-align: center;">
          <h5 class="text-gold" style="margin:0;"><img src="assets/icone-giochi/12.png" style="width:24px; vertical-align:middle; margin-right:8px;">L'Occhio dell'Inquisitore</h5>
          <p style="margin:5px 0 0 0; font-size: 0.8rem; color: #ccc;">Esamina il quadro. Trova i 3 indizi nascosti (scintille) cliccando nei punti giusti. Errori rimanenti: <span id="ho-errors" class="text-crimson">3</span></p>
        </div>
        
        <div id="ho-image-container" style="position: relative; width: 100%; aspect-ratio: 1/1; background: url('${imgSrc}') center/contain no-repeat; cursor: crosshair;">
          <!-- Hitbox generate dinamicamente -->
        </div>
        
        <div style="padding: 10px; background: rgba(0,0,0,0.8); display: flex; flex-direction: column; gap: 10px; align-items: center;">
          <ul id="ho-collected" style="list-style-type: none; padding-left: 0; margin: 0; min-height: 25px; color: #a89f91; font-size: 0.9rem; display: flex; gap: 15px; justify-content: center; flex-wrap:wrap;">
          </ul>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-secondary" id="ho-hint-btn" style="background: rgba(212,175,55,0.2); border: 1px solid var(--accent-gold); color: var(--accent-gold); font-size: 0.85rem;"><i class="fa-solid fa-lightbulb"></i> Evidenzia Indizio (-2 🪙)</button>
            <button class="btn btn-secondary" id="ho-skip-btn" style="background: rgba(255,255,255,0.05); color: #aaa; font-size: 0.85rem;"><i class="fa-solid fa-forward-step"></i> Salta Prova</button>
          </div>
        </div>
      </div>
    `;

    let found = 0;
    let errors = 3;
    const errorDisplay = document.getElementById('ho-errors');
    const collectedList = document.getElementById('ho-collected');
    const imgContainer = document.getElementById('ho-image-container');
    
    const hitboxes = [];
    for (let i = 0; i < 3; i++) {
      const hb = document.createElement('div');
      hb.className = 'ho-hitbox';
      hb.dataset.clue = clues[i] || `Indizio ${i + 1}`;
      const top = 15 + Math.random() * 70;
      const left = 15 + Math.random() * 70;
      
      hb.style.cssText = `
        position: absolute; 
        left: ${left}%; top: ${top}%; 
        width: 32px; height: 32px; 
        transform: translate(-50%, -50%);
        cursor: pointer;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(212,175,55,0.4) 40%, transparent 70%);
        animation: pulse 2s infinite alternate;
      `;
      imgContainer.appendChild(hb);
      hitboxes.push(hb);
    }

    document.getElementById('ho-hint-btn').onclick = async () => {
      await this.useFioriniForHint(2);
      const remaining = hitboxes.filter(h => h.style.display !== 'none');
      if (remaining.length > 0) {
        const target = remaining[0];
        target.style.outline = '4px solid #f5c53c';
        target.style.transform = 'translate(-50%, -50%) scale(1.6)';
      }
    };

    document.getElementById('ho-skip-btn').onclick = () => {
      this.skipMinigame(nextBtn, "Occhio dell'Inquisitore");
    };

    imgContainer.addEventListener('click', (e) => {
      if (e.target.id === 'ho-image-container') {
        errors--;
        if (errorDisplay) errorDisplay.textContent = errors;
        if (errors <= 0) {
          alert("Indagine fallita! Hai perso la lucidità. Ricarico l'analisi...");
          this.loadHiddenObject(container, nextBtn, caseData);
        } else {
          e.target.style.boxShadow = "inset 0 0 50px rgba(255,0,0,0.5)";
          setTimeout(() => e.target.style.boxShadow = "none", 300);
        }
      }
    });

    hitboxes.forEach(hb => {
      hb.addEventListener('click', (e) => {
        e.stopPropagation();
        if (hb.style.display === 'none') return;
        found++;
        hb.style.display = 'none';
        
        const li = document.createElement('li');
        li.innerHTML = `✅ ${hb.dataset.clue}`;
        collectedList.appendChild(li);
        
        if (found === 3) {
          setTimeout(() => this.rewardAndNext("Occhio dell'Inquisitore", nextBtn, caseData), 400);
        }
      });
    });
  },

  // =====================================================
  // FASI 6 E 9 DEL PROCESSO (ESAME INCROCIATO E SIGILLO)
  // =====================================================
  loadCrossExamination: function(container, nextBtn, caseData) {
    if (nextBtn) nextBtn.disabled = true;
    
    if (!caseData || !caseData.phases || !caseData.phases.crossExamination) {
      container.innerHTML = `<p class="text-crimson">Errore: Dati dell'esame incrociato non trovati.</p>`;
      if (nextBtn) nextBtn.disabled = false;
      return;
    }

    const questions = caseData.phases.crossExamination;
    let currentQuestionIndex = 0;

    const renderQuestion = () => {
      if (currentQuestionIndex >= questions.length) {
        container.innerHTML = `
          <div style="text-align: center; padding: 30px; background: rgba(0,255,0,0.1); border-radius: 10px; border: 1px solid var(--accent-gold);">
            <h4 style="color: var(--accent-gold); font-size: 1.5rem;">Esame Incrociato Superato!</h4>
            <p style="font-size: 1.1rem; color: #ddd;">Hai dimostrato di possedere la logica necessaria per giudicare questo caso.</p>
            <p style="font-size: 2rem; margin-top: 10px;">⚖️</p>
          </div>
        `;
        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.classList.add('glow');
        }
        return;
      }

      const q = questions[currentQuestionIndex];
      let optionsHtml = '';
      q.options.forEach((opt, idx) => {
        optionsHtml += `<button class="btn ce-option-btn" style="display: block; width: 100%; text-align: left; margin-bottom: 10px; white-space: normal; height: auto; padding: 12px; font-size: 0.95rem;" data-idx="${idx}">${opt}</button>`;
      });

      container.innerHTML = `
        <div class="animate-fade-in" style="background: rgba(0,0,0,0.6); border-radius: 8px; border: 1px solid #555; padding: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; color: var(--accent-gold); font-weight: bold;">
            <span>Esame Incrociato</span>
            <span>Domanda ${currentQuestionIndex + 1} di ${questions.length}</span>
          </div>
          <h5 style="font-size: 1.2rem; margin-bottom: 20px; line-height: 1.5; color: #fff;">${q.question}</h5>
          <div id="ce-options-container">
            ${optionsHtml}
          </div>
          <div id="ce-feedback" style="margin-top: 20px; padding: 15px; border-radius: 5px; display: none; font-size: 1.05rem; line-height: 1.5;"></div>
        </div>
      `;

      const optionBtns = container.querySelectorAll('.ce-option-btn');
      const feedbackDiv = document.getElementById('ce-feedback');

      optionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          optionBtns.forEach(b => b.disabled = true);
          const selectedIdx = parseInt(e.target.dataset.idx);
          if (selectedIdx === q.correctIndex) {
            e.target.style.background = 'rgba(0, 150, 0, 0.5)';
            e.target.style.borderColor = '#0f0';
            feedbackDiv.style.display = 'block';
            feedbackDiv.style.background = 'rgba(0, 150, 0, 0.2)';
            feedbackDiv.style.borderLeft = '4px solid #0f0';
            feedbackDiv.innerHTML = `<strong>Corretto!</strong> ${q.explanation}`;
            if (window.AudioEngine && typeof window.AudioEngine.playSuccess === 'function') window.AudioEngine.playSuccess();
            
            setTimeout(() => {
              currentQuestionIndex++;
              renderQuestion();
            }, 3000);
          } else {
            e.target.style.background = 'rgba(150, 0, 0, 0.5)';
            e.target.style.borderColor = '#f00';
            feedbackDiv.style.display = 'block';
            feedbackDiv.style.background = 'rgba(150, 0, 0, 0.2)';
            feedbackDiv.style.borderLeft = '4px solid #f00';
            feedbackDiv.innerHTML = `<strong>Sbagliato.</strong> L'analisi logica è fallita. Ricarico l'esame...`;
            if (window.AudioEngine && typeof window.AudioEngine.playError === 'function') window.AudioEngine.playError();
            
            setTimeout(() => {
              currentQuestionIndex = 0;
              renderQuestion();
            }, 2500);
          }
        });
      });
    };

    renderQuestion();
  },

  loadSealPuzzle: function(container, nextBtn, caseData) {
    if (nextBtn) nextBtn.disabled = true;
    
    if (!caseData || !caseData.phases || !caseData.phases.sealPuzzle) {
      container.innerHTML = `<p class="text-crimson">Errore: Dati del sigillo non trovati.</p>`;
      if (nextBtn) nextBtn.disabled = false;
      return;
    }

    const sealData = caseData.phases.sealPuzzle;
    
    container.innerHTML = `
      <div class="animate-fade-in" style="background: url('assets/Immagini/parchment_bg.png') center/cover; border-radius: 10px; padding: 30px; box-shadow: inset 0 0 40px rgba(0,0,0,0.8); color: #222; font-family: 'Times New Roman', serif;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="assets/Immagini/3.png" style="width: 80px; opacity: 0.8;">
          <h3 style="color: #6a040f; margin-top: 10px; font-family: 'Julius Sans One', sans-serif;">Il Sigillo della Sentenza</h3>
          <p style="font-style: italic; font-size: 1.1rem; color: #444;">Per archiviare la tua decisione e apporre il sigillo di ceralacca, devi dimostrare di aver colto l'essenza del caso.</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.4); padding: 20px; border-radius: 5px; border: 1px dashed #6a040f; margin-bottom: 20px;">
          <p style="font-size: 1.25rem; font-weight: bold; text-align: center; margin: 0; color: #333;">${sealData.riddle}</p>
        </div>

        <div style="text-align: center;">
          <input type="text" id="seal-input" class="form-input" placeholder="Digita la parola chiave..." style="font-size: 1.5rem; text-align: center; text-transform: uppercase; width: 80%; max-width: 300px; margin-bottom: 15px; border: 2px solid #6a040f; background: rgba(255,255,255,0.8); color: #000;">
          <br>
          <button id="seal-check-btn" class="btn" style="background-color: #6a040f; color: #fff;">Apponi il Sigillo</button>
          <p id="seal-feedback" style="margin-top: 15px; font-weight: bold; display: none;"></p>
        </div>
      </div>
    `;

    const input = document.getElementById('seal-input');
    const checkBtn = document.getElementById('seal-check-btn');
    const feedback = document.getElementById('seal-feedback');

    checkBtn.onclick = () => {
      const userVal = input.value.trim().toUpperCase();
      if (userVal === sealData.answer.toUpperCase()) {
        feedback.textContent = "Sigillo apposto correttamente!";
        feedback.style.color = "#006600";
        feedback.style.display = "block";
        if (window.AudioEngine && typeof window.AudioEngine.playSuccess === 'function') window.AudioEngine.playSuccess();
        input.disabled = true;
        checkBtn.disabled = true;
        
        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.classList.add('glow');
        }
      } else {
        feedback.textContent = "La parola è errata. Il sigillo non prende forma.";
        feedback.style.color = "#6a040f";
        feedback.style.display = "block";
        if (window.AudioEngine && typeof window.AudioEngine.playError === 'function') window.AudioEngine.playError();
        
        input.style.animation = 'none';
        input.offsetHeight; // trigger reflow
        input.style.animation = 'shake 0.5s';
        
        setTimeout(() => { feedback.style.display = 'none'; }, 3000);
      }
    };

    input.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        checkBtn.click();
      }
    });
  }
};

// Esportazione globale sia per ES Module che per script legacy
window.MinigamesEngine = MinigamesEngine;
