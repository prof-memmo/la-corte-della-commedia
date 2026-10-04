/**
 * ===================================================================
 * RULES-SERVICE.JS - Modulo Centralizzato e Dinamico del Regolamento
 * Progetto: La Corte della Commedia (Ecosistema Prof. Memmo)
 * ===================================================================
 * 
 * - Preserva fedelmente le 4 pergamene dantesche native (.parchment-panel, Julius Sans One, oro e cremisi)
 * - Sincronizzazione Realtime Firestore su collezione "commedia_settings" / doc "official_rules"
 * - Fallback istantaneo offline con zero-flicker
 * - Live Editor per Super-Admin (prof.memmo@gmail.com)
 */

(function(window) {
    'use strict';

    const SUPER_ADMIN_EMAIL = 'prof.memmo@gmail.com';

    const DEFAULT_COMMEDIA_RULES_TEXT = `[PROCEDIMENTO]
1. Apertura del fascicolo
Analisi iniziale del ritratto, del peccato e degli obiettivi del caso dantesco.

2. Ricostruzione dei fatti
Comprensione narrativa della vicenda tramite timeline e testi storici originali.

3. Raccolta delle prove
Superamento di minigiochi (puzzle, indagini visive) per sbloccare indizi e accumulare XP.

4. L'Accusa
Presentazione degli argomenti di Dante basati sui versi della Commedia e sul principio del contrappasso.

5. La Difesa
Ricerca di interpretazioni alternative, attenuanti e motivazioni per sviluppare il pensiero critico.

6. Esame Incrociato [Minigioco Avanzato]
Analisi logica e deduttiva delle argomentazioni ascoltate (un errore richiede un nuovo ragionamento).

7. Dante Oggi
Collegamento pratico del peccato e della colpa con situazioni ed eventi della vita contemporanea.

8. Il Verdetto
Scelta finale della corte (Conferma, Riduzione, Aggravante, Assoluzione) e stesura della motivazione scritta.

9. Il Sigillo [Minigioco Avanzato]
Risoluzione autonoma di un enigma storico-logico per validare definitivamente la sentenza.

10. La Sentenza
Generazione della pergamena finale con il risultato, XP e badge, custodita per sempre nell'Archivio.

[STUDENTE]
1. I Tre Livelli di Indagine
Il tuo Docente imposterà per la tua Classe uno dei tre livelli di difficoltà, a seconda del grado scolastico: Esploratore (per un approccio guidato), Giurista (per una maggiore autonomia e interpretazione), o Magistrato (per le sfide più ardue, ricche di collegamenti storici e filosofici).

2. La Valutazione dei Docenti
Le tue sentenze e le tue motivazioni verranno lette e valutate dal tuo Docente (il Sommo Giudice). Se l'argomentazione è ritenuta valida, sarai ricompensato con XP e Fiorini d'oro, che ti permetteranno di ottenere nuovi e prestigiosi titoli nobiliari.

3. Diritto al Riposo e Pausa Cognitiva
A tutela del benessere visivo ed emotivo, dopo 45 minuti di dibattito in tribunale la sessione si sospende per una pausa di decompressione e confronto tra pari.

[PELLEGRINO]
1. Giocatore Unico o Corti Private (Multiplayer)
Come pellegrino (Giurato) hai due scelte: affrontare il viaggio in solitaria, oppure creare una Corte Privata. In quest'ultimo caso potrai generare un link e invitare amici, compagni di lettura o familiari per vivere un'esperienza multiplayer, confrontando le vostre sentenze e visualizzando le statistiche della vostra Corte.

2. Il Ruolo del Presidente di Corte
Se decidi di creare tu la Corte Privata, ne diventi il "Presidente". Come Presidente potrai scegliere il livello di difficoltà per il tuo gruppo (Esploratore, Giurista o Magistrato), decidere quali casi sbloccare e amministrare l'ingresso dei nuovi giurati.

[DOCENTE]
1. Il Pannello del Docente (Dossier e Classi)
In veste di Sommo Docente, hai il pieno controllo sulle tue aule e sui tuoi studenti. Dal tuo pannello puoi creare nuove "Classi", ottenere un Codice univoco da condividere con i tuoi alunni per l'iscrizione, e monitorare l'andamento didattico e la Classifica della classe in tempo reale.

2. Assegnazione Livelli e Nodi
Per ogni classe devi stabilire il target di profondità (Esploratore per la sec. di I grado; Giurista per il biennio; Magistrato per il triennio). Puoi anche decidere il ritmo del gioco, impostando uno sblocco "Automatico" per i casi successivi o "Manuale" per allinearli alle lezioni in classe.

3. La Valutazione dei Verdetti
Sei tu il giudice ultimo dell'argomentazione espressa dai ragazzi. Nel Dossier troverai le sentenze: approvandole garantirai XP e badge, mentre respingendole potrai fornire un feedback formativo obbligando lo studente a rielaborare la motivazione.`;

    const RulesService = {
        _gameKey: 'commedia',
        _collectionName: 'commedia_settings',
        _docId: 'official_rules',
        _storageKey: 'commedia_rules_official_text',
        _rawText: '',
        _lastUpdated: null,
        _updatedBy: '',
        _isInitialized: false,
        _listeners: [],
        _unsubscribeFirestore: null,

        getDefaultText() {
            return DEFAULT_COMMEDIA_RULES_TEXT.trim();
        },

        isSuperAdmin(email) {
            const fbUser = (window.hubApp && window.hubApp.auth && window.hubApp.auth().currentUser) ||
                           (window.firebase && window.firebase.auth && window.firebase.auth().currentUser);
            const userEmail = (email || (fbUser && fbUser.email) || (window.currentUser && window.currentUser.email) || window.currentUserEmail || '').toLowerCase();
            return userEmail === SUPER_ADMIN_EMAIL.toLowerCase();
        },

        getRawText() {
            return (this._rawText && this._rawText.trim().length > 0) ? this._rawText : this.getDefaultText();
        },

        subscribe(callback) {
            if (typeof callback === 'function' && !this._listeners.includes(callback)) {
                this._listeners.push(callback);
            }
            return () => {
                this._listeners = this._listeners.filter(cb => cb !== callback);
            };
        },

        _notify() {
            const text = this.getRawText();
            this._listeners.forEach(cb => {
                try {
                    cb(text);
                } catch (e) {
                    console.error("Errore listener RulesService (Commedia):", e);
                }
            });
        },

        async init() {
            // 1. Carica istantaneamente da cache locale o default (Zero-flicker)
            try {
                const cached = localStorage.getItem(this._storageKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed && parsed.text) {
                        this._rawText = parsed.text;
                        this._lastUpdated = parsed.lastUpdated || null;
                        this._updatedBy = parsed.updatedBy || '';
                    }
                }
            } catch (e) {
                console.warn("Errore lettura cache regolamento Commedia:", e);
            }

            if (!this._rawText) {
                this._rawText = this.getDefaultText();
            }

            this._notify();

            // 2. Setup listener Firestore
            if (this._isInitialized) return;
            this._isInitialized = true;

            const db = window.hubDb || window.db || (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
            if (!db) {
                console.info("Firestore non ancora disponibile per Commedia. Uso cache locale.");
                return;
            }

            try {
                // Collezione commedia_settings o settings (con prefisso corte_)
                const docRef = (typeof db.doc === 'function') 
                    ? db.doc(this._collectionName + '/' + this._docId)
                    : (typeof db.collection === 'function' ? db.collection(this._collectionName).doc(this._docId) : null);

                if (docRef && typeof docRef.onSnapshot === 'function') {
                    this._unsubscribeFirestore = docRef.onSnapshot(docSnap => {
                        if (docSnap.exists) {
                            const data = docSnap.data();
                            if (data && data.text) {
                                this._rawText = data.text;
                                this._lastUpdated = data.lastUpdated || null;
                                this._updatedBy = data.updatedBy || '';

                                try {
                                    localStorage.setItem(this._storageKey, JSON.stringify({
                                        text: this._rawText,
                                        lastUpdated: this._lastUpdated,
                                        updatedBy: this._updatedBy
                                    }));
                                } catch (e) {}

                                this._notify();
                            }
                        }
                    }, err => {
                        console.warn("Firestore snapshot regolamento Commedia (normale se offline):", err.message);
                    });
                }
            } catch (err) {
                console.warn("Inizializzazione Firestore listener regolamento Commedia fallita:", err);
            }
        },

        async saveToCloud(newText) {
            const db = window.hubDb || window.db || (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
            if (!db) {
                throw new Error("Firestore non disponibile. Verifica la connessione a Internet.");
            }

            const fbUser = (window.hubApp && window.hubApp.auth && window.hubApp.auth().currentUser) ||
                           (window.firebase && window.firebase.auth && window.firebase.auth().currentUser);
            const userEmail = (fbUser && fbUser.email ? fbUser.email : (window.currentUserEmail || '')).toLowerCase();

            if (!this.isSuperAdmin(userEmail)) {
                throw new Error("Accesso negato: solo il Super-Admin (" + SUPER_ADMIN_EMAIL + ") può salvare il regolamento.");
            }

            const cleanText = (newText || '').trim();
            if (!cleanText) {
                throw new Error("Il testo del regolamento non può essere vuoto.");
            }

            const nowIso = new Date().toISOString();
            const payload = {
                text: cleanText,
                lastUpdated: nowIso,
                updatedBy: userEmail,
                gameKey: this._gameKey
            };

            if (typeof db.collection === 'function') {
                await db.collection(this._collectionName).doc(this._docId).set(payload, { merge: true });
            } else if (typeof db.doc === 'function') {
                await db.doc(this._collectionName + '/' + this._docId).set(payload, { merge: true });
            }

            this._rawText = cleanText;
            this._lastUpdated = nowIso;
            this._updatedBy = userEmail;

            try {
                localStorage.setItem(this._storageKey, JSON.stringify({
                    text: this._rawText,
                    lastUpdated: this._lastUpdated,
                    updatedBy: this._updatedBy
                }));
            } catch (e) {}

            this._notify();
            return { success: true, lastUpdated: nowIso };
        },

        parseSections(text) {
            const src = (text || this.getRawText()).trim();
            const result = {
                procedimento: [],
                studente: [],
                pellegrino: [],
                docente: []
            };

            if (!src) return result;

            const extractSection = (tag, nextTags) => {
                const nextPattern = nextTags.length > 0 ? `(?=${nextTags.map(t => '\\[' + t + '\\]').join('|')}|$)` : '$';
                const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)${nextPattern}`, 'i');
                const match = src.match(regex);
                return match ? match[1].trim() : '';
            };

            const parseBlock = (rawBlock) => {
                if (!rawBlock) return [];
                const blocks = rawBlock.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
                const items = [];

                blocks.forEach((block, index) => {
                    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
                    if (lines.length === 0) return;

                    let firstLine = lines[0].replace(/^[\u2022\*\-]\s*/, '').trim();
                    let title = '';
                    let content = '';

                    const matchNumbered = firstLine.match(/^(\d+[\.\)]\s*)(.*)$/);
                    if (matchNumbered) {
                        firstLine = matchNumbered[2].trim();
                    }

                    if (lines.length > 1) {
                        title = firstLine;
                        content = lines.slice(1).join(' ').trim();
                    } else {
                        const colonMatch = firstLine.match(/^([^:]{3,60}):\s*(.+)$/);
                        if (colonMatch) {
                            title = colonMatch[1].trim();
                            content = colonMatch[2].trim();
                        } else {
                            content = firstLine;
                        }
                    }

                    if (title) {
                        title = title.replace(/:\s*$/, '').trim();
                    }

                    items.push({
                        index: index + 1,
                        title: title || `Punto ${index + 1}`,
                        text: content || title
                    });
                });

                return items;
            };

            result.procedimento = parseBlock(extractSection('PROCEDIMENTO', ['STUDENTE', 'PELLEGRINO', 'DOCENTE']));
            result.studente = parseBlock(extractSection('STUDENTE', ['PELLEGRINO', 'DOCENTE']));
            result.pellegrino = parseBlock(extractSection('PELLEGRINO', ['DOCENTE']));
            result.docente = parseBlock(extractSection('DOCENTE', []));

            // Fallback se il testo non ha tag
            if (result.procedimento.length === 0 && result.studente.length === 0) {
                result.procedimento = parseBlock(src);
            }

            return result;
        },

        // ===================================================================
        // VISTA PUBBLICA / GIOCO (#view-regolamento in index.html)
        // Stile nativo de La Corte della Commedia: .parchment-panel, Julius Sans One, oro/cremisi
        // ===================================================================
        renderPublicView() {
            const sections = this.parseSections();

            // 1. Procedimento Comune
            const elComune = document.getElementById('reg-comune');
            if (elComune && sections.procedimento.length > 0) {
                elComune.innerHTML = `
                    <h2 style="color: var(--accent-gold); font-family: 'Julius Sans One', sans-serif; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 20px; text-align: center;">Il Procedimento Giudiziario</h2>
                    <p class="text-on-parchment-muted" style="margin-bottom: 1.5rem; line-height: 1.6;">
                        Ogni caso affrontato nella Corte rappresenta un procedimento giudiziario (Campagna &rarr; Fascicolo &rarr; Missioni &rarr; Prove &rarr; Verdetto &rarr; Archivio) ed è strutturato in <strong>fasi fondamentali</strong>:
                    </p>
                    <ul style="list-style-type: none; padding-left: 0; margin-bottom: 1.5rem;" class="text-on-parchment-muted">
                        ${sections.procedimento.map(i => `
                            <li style="margin-bottom: 1rem;">
                                <strong style="color: var(--accent-crimson);">${i.index}. ${i.title}:</strong> ${i.text}
                            </li>
                        `).join('')}
                    </ul>
                    <h3 style="color: var(--accent-crimson); font-family: 'Julius Sans One', sans-serif; margin-top: 2rem;">La Giuria e la Progressione</h3>
                    <p class="text-on-parchment-muted" style="margin-bottom: 1.5rem; line-height: 1.6;">
                        Al termine di ogni procedimento verranno mostrati i risultati aggregati della tua <strong>Giuria</strong>: la tua Classe (nella modalità Scuola) o la tua Corte Privata (nella modalità Comunità). Tutte le tue azioni ti faranno guadagnare <strong>XP, livelli, badge e collezioni</strong>.
                    </p>
                `;
            }

            // 2. Studente
            const elStud = document.getElementById('reg-studente');
            if (elStud && sections.studente.length > 0) {
                elStud.innerHTML = `
                    <h2 style="color: var(--accent-gold); font-family: 'Julius Sans One', sans-serif; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 20px; text-align: center;">Regolamento dello Studente (Modalità Scuola)</h2>
                    ${sections.studente.map(i => `
                        <h3 style="color: var(--accent-crimson); font-family: 'Julius Sans One', sans-serif;">${i.index}. ${i.title}</h3>
                        <p class="text-on-parchment-muted" style="margin-bottom: 1.5rem; line-height: 1.6;">${i.text}</p>
                    `).join('')}
                `;
            }

            // 3. Pellegrino
            const elPell = document.getElementById('reg-pellegrino');
            if (elPell && sections.pellegrino.length > 0) {
                elPell.innerHTML = `
                    <h2 style="color: var(--accent-gold); font-family: 'Julius Sans One', sans-serif; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 20px; text-align: center;">Regolamento del Pellegrino (Modalità Comunità)</h2>
                    ${sections.pellegrino.map(i => `
                        <h3 style="color: var(--accent-crimson); font-family: 'Julius Sans One', sans-serif;">${i.index}. ${i.title}</h3>
                        <p class="text-on-parchment-muted" style="margin-bottom: 1.5rem; line-height: 1.6;">${i.text}</p>
                    `).join('')}
                `;
            }

            // 4. Docente
            const elDoc = document.getElementById('reg-docente');
            if (elDoc && sections.docente.length > 0) {
                elDoc.innerHTML = `
                    <h2 style="color: var(--accent-gold); font-family: 'Julius Sans One', sans-serif; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 20px; text-align: center;">Regolamento del Docente (Modalità Scuola)</h2>
                    ${sections.docente.map(i => `
                        <h3 style="color: var(--accent-crimson); font-family: 'Julius Sans One', sans-serif;">${i.index}. ${i.title}</h3>
                        <p class="text-on-parchment-muted" style="margin-bottom: 1.5rem; line-height: 1.6;">${i.text}</p>
                    `).join('')}
                `;
            }
        },

        // ===================================================================
        // VISTA SUPER-ADMIN (Dashboard Admin in index.html)
        // ===================================================================
        renderAdminEditor(containerId = 'admin-rules-editor-container') {
            const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
            if (!container) return;

            const text = this.getRawText();
            const fbUser = (window.hubApp && window.hubApp.auth && window.hubApp.auth().currentUser) || 
                           (window.firebase && window.firebase.auth && window.firebase.auth().currentUser);
            const userEmail = fbUser ? (fbUser.email || '') : (window.currentUserEmail || '');
            const isAuthAdmin = userEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

            container.innerHTML = `
                <div style="background: #ffffff; padding: 25px; border-radius: 16px; border: 1.5px solid rgba(212,175,55,0.4); box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 25px;">
                    <div style="margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0 0 6px 0; font-size: 1.25rem; font-family: 'Julius Sans One', sans-serif; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.4rem;">📜</span> Regolamento della Corte • Editor Cloud
                            </h3>
                            <p style="margin: 0; font-size: 0.85rem; color: #64748b; line-height: 1.4;">
                                Modifica le pergamene del regolamento ([PROCEDIMENTO], [STUDENTE], [PELLEGRINO], [DOCENTE]).
                            </p>
                        </div>
                        <div>
                            ${isAuthAdmin ? `
                                <span style="font-size: 0.75rem; background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; padding: 6px 12px; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px; font-weight: 600;">
                                    <i class="fa-solid fa-circle-check" style="color: #22c55e;"></i> Super-Admin Autenticato (${userEmail})
                                </span>
                            ` : `
                                <span style="font-size: 0.75rem; background: #fef9c3; color: #854d0e; border: 1px solid #fde047; padding: 6px 12px; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px; font-weight: 600;">
                                    <i class="fa-solid fa-cloud-arrow-up" style="color: #ca8a04;"></i> Cloud Sync (${SUPER_ADMIN_EMAIL})
                                </span>
                            `}
                        </div>
                    </div>

                    <div style="margin-bottom: 18px;">
                        <textarea id="commedia-rules-textarea" rows="22" style="width: 100%; box-sizing: border-box; background: #0f172a; border: 1.5px solid #cbd5e1; border-radius: 10px; color: #f8fafc; padding: 16px; font-size: 0.92rem; line-height: 1.65; font-family: 'Fira Code', monospace, sans-serif; resize: vertical; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">${text}</textarea>
                    </div>

                    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                        <button type="button" id="btn-save-commedia-rules" onclick="window.CommediaRulesService.handleSaveButton()" style="background: var(--accent-gold); color: #000; border: none; padding: 10px 24px; border-radius: 20px; font-weight: 800; font-size: 0.85rem; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(212,175,55,0.3); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                            <i class="fa-solid fa-floppy-disk"></i> SALVA REGOLAMENTO
                        </button>
                        
                        <button type="button" onclick="window.CommediaRulesService.handleResetButton()" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 20px; font-size: 0.82rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: background 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">
                            <i class="fa-solid fa-rotate-left"></i> Ripristina Predefinito
                        </button>
                    </div>
                </div>
            `;
        },

        async handleSaveButton() {
            const textarea = document.getElementById('commedia-rules-textarea');
            if (!textarea) return;

            const btn = document.getElementById('btn-save-commedia-rules');
            const originalHtml = btn ? btn.innerHTML : '';
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> SALVATAGGIO...`;
            }

            try {
                await this.saveToCloud(textarea.value);
                if (btn) {
                    btn.innerHTML = `<i class="fa-solid fa-check"></i> SALVATO CON SUCCESSO!`;
                    btn.style.background = '#22c55e';
                    btn.style.color = '#fff';
                }
                setTimeout(() => {
                    if (btn) {
                        btn.disabled = false;
                        btn.innerHTML = originalHtml;
                        btn.style.background = 'var(--accent-gold)';
                        btn.style.color = '#000';
                    }
                }, 2000);
            } catch (err) {
                alert("Errore salvataggio: " + (err.message || err));
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = originalHtml;
                }
            }
        },

        handleResetButton() {
            if (!confirm("Vuoi ripristinare il testo del regolamento a quello predefinito ufficiale de La Corte della Commedia?")) return;
            const textarea = document.getElementById('commedia-rules-textarea');
            if (textarea) {
                textarea.value = this.getDefaultText();
            }
        }
    };

    window.RulesService = RulesService;
    window.CommediaRulesService = RulesService;

    // Auto-inizializzazione
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => RulesService.init());
    } else {
        RulesService.init();
    }

})(window);
