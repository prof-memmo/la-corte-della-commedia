/**
 * LIVE EDITOR DIDATTICO (Quick-Edit al Volo) - La Corte della Commedia
 * Consente al Docente / Amministratore (prof.memmo@gmail.com) di correggere al volo
 * testi dei processi, testimonianze, indizi e prove direttamente dal gioco.
 */

(function() {
    function htmlToPlainText(html) {
        if (!html) return '';
        if (typeof html !== 'string') return String(html);
        if (!/<[a-z][\s\S]*>/i.test(html)) return html;

        return html
            .replace(/<br\s*[\/]?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<\/div>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .trim();
    }

    function plainTextToHtml(text, originalHtml) {
        if (!text) return '';
        const trimmed = text.trim();
        if (trimmed.startsWith('<') && trimmed.endsWith('>')) return trimmed;
        if (originalHtml && (originalHtml.includes('<br>') || originalHtml.includes('<p>'))) {
            return trimmed.split('\n').join('<br>');
        }
        return trimmed;
    }

    window.LiveEditor = {
        platformKey: 'la_corte_commedia',
        platformName: 'La Corte della Commedia',
        overrides: {},
        isLoaded: false,
        _originalCache: {},

        init: async function() {
            const db = window.fbDb || window.db;
            if (!db) return;
            try {
                const snapshot = await db.collection('hub_didactic_overrides')
                    .where('platform', '==', this.platformKey)
                    .get();
                
                this.overrides = {};
                snapshot.forEach(doc => {
                    this.overrides[doc.id] = { docId: doc.id, ...doc.data() };
                });
                this.isLoaded = true;
                console.log(`✏️ Live Editor [La Corte]: ${Object.keys(this.overrides).length} override caricati.`);
            } catch (e) {
                console.warn("Live Editor Corte cloud error:", e);
            }
        },

        isAdmin: function() {
            let u = null;
            if (typeof Auth !== 'undefined' && Auth.getUser) u = Auth.getUser();
            if (u) {
                if (u.email && u.email.toLowerCase() === 'prof.memmo@gmail.com') return true;
                if (u.role === 'admin' || u.role === 'docente') return true;
            }
            if (typeof currentUserEmail !== 'undefined' && currentUserEmail && currentUserEmail.toLowerCase() === 'prof.memmo@gmail.com') return true;
            if (window.currentUser && window.currentUser.email && window.currentUser.email.toLowerCase() === 'prof.memmo@gmail.com') return true;
            try {
                const stored = localStorage.getItem('corte_user') || localStorage.getItem('hub_user_session');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed.email && parsed.email.toLowerCase() === 'prof.memmo@gmail.com') return true;
                    if (parsed.role === 'admin' || parsed.role === 'docente') return true;
                }
            } catch(e){}
            return false;
        },

        apply: function(itemKey, originalItem) {
            if (!originalItem) return originalItem;
            const key = String(itemKey);
            this._originalCache[key] = originalItem;
            const override = this.overrides[key];
            if (!override || !override.data) return originalItem;
            return { ...originalItem, ...override.data, _isOverridden: true };
        },

        renderFloatingBadge: function() {
            if (!this.isAdmin()) {
                const existing = document.getElementById('live-editor-floating-badge');
                if (existing) existing.remove();
                return;
            }
            let badge = document.getElementById('live-editor-floating-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.id = 'live-editor-floating-badge';
                badge.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 99999; background: #0f172a; color: #a855f7; padding: 8px 16px; border-radius: 50px; font-size: 0.85rem; font-weight: 700; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1.5px solid #a855f7; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: transform 0.2s;';
                badge.title = "Fai click per visualizzare o correggere al volo casi e testimonianze";
                badge.onmouseenter = () => badge.style.transform = 'scale(1.05)';
                badge.onmouseleave = () => badge.style.transform = 'scale(1)';
                badge.onclick = () => {
                    const key = prompt("✏️ Inserisci la chiave o ID del caso/testimonianza da modificare:", "");
                    if (key) this.openModal(key.trim(), '');
                };
                document.body.appendChild(badge);
            }
            badge.innerHTML = `<span>✏️ Live Editor [${Object.keys(this.overrides).length} attivi]</span>`;
            this.scanAndInjectPencils();
        },

        scanAndInjectPencils: function() {
            if (!this.isAdmin()) return;
            // Inietta matite su schede processo
            document.querySelectorAll('.processo-card, .case-card, .accusa-box').forEach(card => {
                const titleEl = card.querySelector('.case-title, h3, h4');
                if (titleEl && !titleEl.querySelector('.live-edit-quick-btn')) {
                    const caseId = card.getAttribute('data-case-id') || titleEl.textContent.trim();
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'live-edit-quick-btn';
                    btn.innerHTML = '✏️';
                    btn.title = `Modifica caso ${caseId}`;
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        window.LiveEditor.openModal(`case_${caseId.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, '');
                    };
                    titleEl.appendChild(btn);
                }
            });
        },

        renderBtn: function(itemKey, rawItemJson) {
            if (!this.isAdmin()) return '';
            const safeKey = String(itemKey).replace(/'/g, "\\'");
            let encodedData = '';
            try {
                encodedData = btoa(encodeURIComponent(JSON.stringify(rawItemJson)));
            } catch(e) { encodedData = ''; }

            return `
                <button type="button" class="live-edit-quick-btn" onclick="event.stopPropagation(); LiveEditor.openModal('${safeKey}', '${encodedData}')" title="Modifica al volo questo elemento (Solo Admin/Docente)">
                    ✏️
                </button>
            `;
        },

        openModal: function(itemKey, encodedData) {
            let item = null;
            if (encodedData) {
                try {
                    item = JSON.parse(decodeURIComponent(atob(encodedData)));
                } catch(e) {}
            }
            if (!item && this._originalCache[itemKey]) {
                item = this._originalCache[itemKey];
            }

            const existingOverride = this.overrides[itemKey] || {};
            const currentData = existingOverride.data || item || {};

            let rawText = currentData.text || currentData.dialogue || currentData.q || currentData.frase || '';
            const cleanText = htmlToPlainText(rawText);
            const currentTitle = currentData.name || currentData.title || itemKey;

            let modal = document.getElementById('live-editor-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'live-editor-modal';
                modal.className = 'modal-overlay';
                modal.style.cssText = 'display: none; align-items: center; justify-content: center; z-index: 100000; background: rgba(15,23,42,0.85); backdrop-filter: blur(6px); position: fixed; inset: 0; padding: 20px;';
                document.body.appendChild(modal);
            }

            modal.innerHTML = `
                <div class="modal-content" style="background: #1e293b; color: #f8fafc; border-radius: 20px; border: 1.5px solid rgba(168,85,247,0.4); width: 100%; max-width: 620px; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6); font-family: inherit; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
                        <h3 style="margin: 0; color: #c084fc; font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
                            ✏️ Modifica al Volo (${currentTitle})
                        </h3>
                        <button onclick="document.getElementById('live-editor-modal').style.display='none'" style="background: transparent; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; line-height: 1;">&times;</button>
                    </div>

                    <p style="font-size: 0.85rem; color: #cbd5e1; margin-top: 0; margin-bottom: 14px;">
                        Modifica il testo in italiano naturale. Verrà salvato nel database centrale e applicato a tutti gli studenti.
                    </p>

                    <form onsubmit="event.preventDefault(); LiveEditor.save('${itemKey}', '${btoa(encodeURIComponent(rawText))}');">
                        <div style="margin-bottom: 14px;">
                            <label style="display: block; font-weight: 700; font-size: 0.85rem; color: #cbd5e1; margin-bottom: 6px;">Testo o Dialogo:</label>
                            <textarea id="live-edit-text" class="form-control" rows="5" style="width: 100%; background: #0f172a; color: white; border: 1.5px solid rgba(168,85,247,0.3); border-radius: 10px; padding: 10px 12px; font-size: 0.95rem; font-family: inherit; resize: vertical;" required>${cleanText}</textarea>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 14px;">
                            ${existingOverride.docId ? `
                                <button type="button" onclick="LiveEditor.remove('${itemKey}')" style="background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid #ef4444; padding: 8px 14px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer;">
                                    🔄 Ripristina Originale
                                </button>
                            ` : '<div></div>'}

                            <div style="display: flex; gap: 10px;">
                                <button type="button" onclick="document.getElementById('live-editor-modal').style.display='none'" style="background: rgba(255,255,255,0.1); color: #cbd5e1; border: none; padding: 9px 16px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                                    Annulla
                                </button>
                                <button type="submit" style="background: #a855f7; color: white; border: none; padding: 9px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(168,85,247,0.3);">
                                    💾 Salva Modifica
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            `;

            modal.style.display = 'flex';
        },

        save: async function(itemKey, encodedOriginal) {
            const textInput = document.getElementById('live-edit-text');
            const rawText = textInput ? textInput.value.trim() : '';

            if (!rawText) {
                alert("Il testo non può essere vuoto.");
                return;
            }

            let originalHtml = '';
            try { originalHtml = decodeURIComponent(atob(encodedOriginal)); } catch(e){}
            const formattedText = plainTextToHtml(rawText, originalHtml);

            const docId = `${this.platformKey}_${itemKey.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
            const overridePayload = {
                platform: this.platformKey,
                platformName: this.platformName,
                itemKey: itemKey,
                data: {
                    text: formattedText,
                    dialogue: formattedText,
                    frase: formattedText
                },
                updatedAt: new Date().toISOString(),
                author: 'prof.memmo@gmail.com',
                status: 'pending_github_sync'
            };

            const db = window.fbDb || window.db;
            try {
                await db.collection('hub_didactic_overrides').doc(docId).set(overridePayload);
                this.overrides[itemKey] = { docId: docId, ...overridePayload };
                document.getElementById('live-editor-modal').style.display = 'none';
                alert("✅ Modifica salvata con successo!");
                this.renderFloatingBadge();
            } catch (e) {
                console.error("Errore salvataggio override Corte:", e);
                alert("Errore durante il salvataggio: " + e.message);
            }
        },

        remove: async function(itemKey) {
            if (!confirm("Sei sicuro di voler ripristinare il testo originale?")) return;
            const docId = `${this.platformKey}_${itemKey.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
            const db = window.fbDb || window.db;
            try {
                await db.collection('hub_didactic_overrides').doc(docId).delete();
                delete this.overrides[itemKey];
                document.getElementById('live-editor-modal').style.display = 'none';
                alert("✅ Ripristinato il testo originale!");
                this.renderFloatingBadge();
            } catch (e) {
                console.error("Errore ripristino override:", e);
                alert("Errore: " + e.message);
            }
        }
    };

    // Stile CSS per il pulsante matitina
    const style = document.createElement('style');
    style.textContent = `
        .live-edit-quick-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(168, 85, 247, 0.15);
            color: #c084fc;
            border: 1px solid rgba(168, 85, 247, 0.3);
            border-radius: 6px;
            padding: 2px 6px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s ease;
            vertical-align: middle;
            margin-left: 6px;
        }
        .live-edit-quick-btn:hover {
            background: #a855f7;
            color: white;
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(async () => {
            await window.LiveEditor.init();
            window.LiveEditor.renderFloatingBadge();
        }, 500);
    });

    setInterval(() => {
        if (window.LiveEditor && typeof window.LiveEditor.renderFloatingBadge === 'function') {
            window.LiveEditor.renderFloatingBadge();
        }
    }, 2000);
})();
