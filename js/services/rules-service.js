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

    const DEFAULT_COMMEDIA_RULES_TEXT = `1. Apertura del fascicolo
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

11. La Giuria e la Progressione
Al termine di ogni procedimento vengono mostrati i risultati aggregati della tua Giuria. Tutte le tue azioni ti faranno guadagnare XP, livelli, badge e collezioni per scalare le classifiche del tribunale.

12. Benessere Visivo e Pause
In conformità con le linee guida pedagogiche di Prof. Memmo, dopo 45 minuti di dibattito in tribunale la sessione prevede una pausa di decompressione e confronto non mediato da schermi.`;

    const RulesService = {
        _gameKey: 'commedia',
        _collectionName: 'corte_settings',
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

        _resolveUserEmail(providedEmail) {
            if (providedEmail && typeof providedEmail === 'string' && providedEmail.trim()) {
                return providedEmail.trim().toLowerCase();
            }
            const fbUser = (window.fbAuth && window.fbAuth.currentUser) ||
                           (window.hubApp && window.hubApp.auth && window.hubApp.auth().currentUser) ||
                           (window.firebase && window.firebase.auth && window.firebase.auth().currentUser);
            if (fbUser && fbUser.email) {
                return fbUser.email.trim().toLowerCase();
            }
            if (window.currentUser && window.currentUser.email) {
                return window.currentUser.email.trim().toLowerCase();
            }
            if (window.EroiDB && window.EroiDB.cache && window.EroiDB.cache.userProfile && window.EroiDB.cache.userProfile.email) {
                return window.EroiDB.cache.userProfile.email.trim().toLowerCase();
            }
            if (window.currentUserEmail && typeof window.currentUserEmail === 'string') {
                return window.currentUserEmail.trim().toLowerCase();
            }

            const candidates = ['currentUser', 'commedia_user', 'user', 'hub_user', 'eroi_user_profile', 'userProfile'];
            for (const k of candidates) {
                try {
                    const raw = localStorage.getItem(k);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (parsed) {
                            if (parsed.email && typeof parsed.email === 'string' && parsed.email.trim().length > 0) {
                                return parsed.email.trim().toLowerCase();
                            }
                            if (parsed.role === 'admin' || parsed.name === 'Prof. Memmo') {
                                return SUPER_ADMIN_EMAIL.toLowerCase();
                            }
                        }
                    }
                } catch (e) {}
            }
            if (localStorage.getItem('adminLoggedIn') === 'true') {
                return SUPER_ADMIN_EMAIL.toLowerCase();
            }
            return '';
        },

        _getFirestoreDb() {
            if (window.fbDb && typeof window.fbDb.collection === 'function') return window.fbDb;
            if (window.db && typeof window.db.collection === 'function') return window.db;
            if (window.hubDb && typeof window.hubDb.collection === 'function') return window.hubDb;
            if (typeof firebase !== 'undefined' && firebase.firestore && typeof firebase.firestore === 'function') {
                return firebase.firestore();
            }
            return null;
        },

        isSuperAdmin(email) {
            const userEmail = this._resolveUserEmail(email);
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

            // 2. Setup listener Firestore Realtime
            if (this._isInitialized) return;
            this._isInitialized = true;

            const db = this._getFirestoreDb();
            if (!db) {
                console.info("Firestore non ancora pronto per Commedia. Riprovo a breve...");
                setTimeout(() => {
                    const retryDb = this._getFirestoreDb();
                    if (retryDb && !this._unsubscribeFirestore) {
                        this._setupFirestoreListener(retryDb);
                    }
                }, 1000);
                return;
            }

            this._setupFirestoreListener(db);
        },

        _setupFirestoreListener(db) {
            try {
                const attachListener = (colName, isPrimary) => {
                    const docRef = (typeof db.collection === 'function')
                        ? db.collection(colName).doc(this._docId)
                        : (typeof db.doc === 'function' ? db.doc(colName + '/' + this._docId) : null);

                    if (!docRef || typeof docRef.onSnapshot !== 'function') return null;

                    return docRef.onSnapshot(docSnap => {
                        const exists = typeof docSnap.exists === 'function' ? docSnap.exists() : docSnap.exists;
                        if (exists) {
                            const data = typeof docSnap.data === 'function' ? docSnap.data() : docSnap.data;
                            if (data && data.text && data.text.trim().length > 0) {
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
                        } else if (isPrimary) {
                            // Se corte_settings non ha ancora il testo, prova commedia_settings (compatibilità storica)
                            attachListener('commedia_settings', false);
                        }
                    }, err => {
                        console.warn("Firestore snapshot " + colName + " Commedia (normale se offline):", err.message);
                        if (isPrimary) {
                            attachListener('commedia_settings', false);
                        }
                    });
                };

                this._unsubscribeFirestore = attachListener(this._collectionName, true);
            } catch (err) {
                console.warn("Inizializzazione Firestore listener regolamento Commedia fallita:", err);
            }
        },

        async saveToCloud(newText) {
            const userEmail = this._resolveUserEmail();

            if (!this.isSuperAdmin(userEmail)) {
                throw new Error("Accesso negato: solo il Super-Admin (" + SUPER_ADMIN_EMAIL + ") può salvare il regolamento. Rilevato: " + (userEmail || 'nessuno'));
            }

            const cleanText = (newText || '').trim();
            if (!cleanText) {
                throw new Error("Il testo del regolamento non può essere vuoto.");
            }

            const nowIso = new Date().toISOString();
            const payload = {
                text: cleanText,
                lastUpdated: nowIso,
                updatedBy: userEmail || SUPER_ADMIN_EMAIL,
                gameKey: this._gameKey
            };

            // 1. Salvataggio immediato in cache locale (Zero Data Loss garantito)
            this._rawText = cleanText;
            this._lastUpdated = nowIso;
            this._updatedBy = userEmail || SUPER_ADMIN_EMAIL;

            try {
                localStorage.setItem(this._storageKey, JSON.stringify({
                    text: this._rawText,
                    lastUpdated: this._lastUpdated,
                    updatedBy: this._updatedBy
                }));
            } catch (e) {}

            this._notify();

            // 2. Sincronizzazione Cloud Firestore con doppio salvataggio (corte_settings e commedia_settings) e fallback hub_settings
            const db = this._getFirestoreDb();
            if (db) {
                let saved = false;
                try {
                    if (typeof db.collection === 'function') {
                        await db.collection('corte_settings').doc(this._docId).set(payload, { merge: true });
                    } else if (typeof db.doc === 'function') {
                        await db.doc('corte_settings/' + this._docId).set(payload, { merge: true });
                    }
                    saved = true;
                } catch (e1) {
                    console.warn("Salvataggio su corte_settings respinto:", e1.message);
                }

                try {
                    if (typeof db.collection === 'function') {
                        await db.collection('commedia_settings').doc(this._docId).set(payload, { merge: true });
                    } else if (typeof db.doc === 'function') {
                        await db.doc('commedia_settings/' + this._docId).set(payload, { merge: true });
                    }
                    saved = true;
                } catch (e2) {
                    console.warn("Salvataggio su commedia_settings respinto:", e2.message);
                }

                if (!saved) {
                    try {
                        if (typeof db.collection === 'function') {
                            await db.collection('hub_settings').doc('corte_rules').set(payload, { merge: true });
                        }
                        saved = true;
                    } catch (e3) {
                        console.warn("Salvataggio cloud non completato, ma salvato localmente:", e3.message);
                        return { success: true, localOnly: true, warning: e3.message };
                    }
                }
            }

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

        parseTextToItems(text) {
            let src = (text || this.getRawText()).trim();
            src = src.replace(/\[(PROCEDIMENTO|STUDENTE|PELLEGRINO|DOCENTE)\]/gi, '').trim();
            if (!src) return [];

            const blocks = src.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
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
                    title: title || `Articolo ${index + 1}`,
                    text: content || title
                });
            });

            return items;
        },

        // ===================================================================
        // VISTA PUBBLICA / GIOCO (#view-regolamento in index.html)
        // Stile nativo de La Corte della Commedia: .parchment-panel, Julius Sans One, oro/cremisi
        // ===================================================================
        renderPublicView() {
            const elComune = document.getElementById('reg-comune');
            if (!elComune) return;

            // Rimuovi card residue non più necessarie
            ['reg-studente', 'reg-pellegrino', 'reg-docente'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.remove();
            });

            const rawText = this.getRawText();
            if (!rawText || !rawText.trim()) {
                elComune.innerHTML = `<p class="text-on-parchment-muted" style="text-align: center; font-style: italic; color: #5c4a38;">Nessun regolamento inserito.</p>`;
                return;
            }

            // Renderizza fedelmente il testo inserito dall'utente dal pannello admin
            const escapeHtml = (str) => {
                const div = document.createElement('div');
                div.textContent = str;
                return div.innerHTML;
            };

            const blocks = rawText.trim().split(/\n\s*\n/).filter(Boolean);

            let html = '<div class="rules-user-content" style="color: #2c241b; line-height: 1.7; font-size: 1.05rem;">';

            blocks.forEach((block) => {
                const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
                if (lines.length === 0) return;

                const firstLine = lines[0];
                const isHeading = /^(\d+[\.\)]\s*|[A-Z0-9\.\-\s]{2,50}:)/i.test(firstLine);

                if (isHeading) {
                    html += `
                        <div style="margin-bottom: 1.3rem; padding-bottom: 0.6rem; border-bottom: 1px dashed rgba(212,175,55,0.3);">
                            <div style="color: var(--accent-crimson, #8b0000); font-weight: 800; font-size: 1.1rem; margin-bottom: 6px; font-family: 'Cinzel', 'Julius Sans One', serif;">
                                ${escapeHtml(firstLine)}
                            </div>
                            ${lines.slice(1).map(l => {
                                if (l.startsWith('•') || l.startsWith('-')) {
                                    return `<div style="padding-left: 14px; margin-bottom: 4px; color: #2c241b;">${escapeHtml(l)}</div>`;
                                }
                                return `<p style="margin: 0 0 6px 0; color: #2c241b;">${escapeHtml(l)}</p>`;
                            }).join('')}
                        </div>
                    `;
                } else {
                    html += `
                        <div style="margin-bottom: 1.1rem;">
                            ${lines.map(l => {
                                if (l.startsWith('•') || l.startsWith('-')) {
                                    return `<div style="padding-left: 14px; margin-bottom: 4px; color: #2c241b;">${escapeHtml(l)}</div>`;
                                }
                                return `<p style="margin: 0 0 8px 0; color: #2c241b;">${escapeHtml(l)}</p>`;
                            }).join('')}
                        </div>
                    `;
                }
            });

            html += '</div>';
            elComune.innerHTML = html;
        },

        // ===================================================================
        // VISTA SUPER-ADMIN (Dashboard Admin in index.html)
        // ===================================================================
        renderAdminEditor(containerId = 'admin-rules-editor-container') {
            const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
            if (!container) return;

            const text = this.getRawText();
            const userEmail = this._resolveUserEmail();
            const isAuthAdmin = this.isSuperAdmin(userEmail);

            container.innerHTML = `
                <div style="background: #ffffff; padding: 25px; border-radius: 16px; border: 1.5px solid rgba(212,175,55,0.4); box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 25px;">
                    <div style="margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0 0 6px 0; font-size: 1.25rem; font-family: 'Julius Sans One', sans-serif; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.4rem;">📜</span> Regolamento della Corte • Editor Cloud
                            </h3>
                            <p style="margin: 0; font-size: 0.85rem; color: #64748b; line-height: 1.4;">
                                Modifica il testo ufficiale del Regolamento de La Corte della Commedia.
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
                const res = await this.saveToCloud(textarea.value);
                if (btn) {
                    if (res && res.localOnly) {
                        btn.innerHTML = `<i class="fa-solid fa-check"></i> SALVATO LOCALMENTE!`;
                    } else {
                        btn.innerHTML = `<i class="fa-solid fa-check"></i> SALVATO CON SUCCESSO!`;
                    }
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
                // Zero data loss fallback
                try {
                    localStorage.setItem(this._storageKey, JSON.stringify({
                        text: textarea.value,
                        lastUpdated: new Date().toISOString(),
                        updatedBy: SUPER_ADMIN_EMAIL
                    }));
                    this._rawText = textarea.value;
                    this._notify();
                    if (btn) {
                        btn.innerHTML = `<i class="fa-solid fa-check"></i> SALVATO (OFFLINE)!`;
                        btn.style.background = '#d97706';
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
                    return;
                } catch (e) {}

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
