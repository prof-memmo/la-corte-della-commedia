// game.js - Logica del processo (Trial Flow) a 8 Fasi

export const EroiGame = {
    state: {
        currentCaseId: null,
        currentPhase: 1,
        caseData: null
    },

    startTrial: async function(caseId) {
        this.state.currentCaseId = caseId;
        this.state.currentPhase = 1;
        
        // Carica i dati del caso
        const cases = await window.EroiDB.getCasesByCampaign('inferno'); // In futuro, passa l'ID della campagna dinamicamente
        this.state.caseData = cases.find(c => c.id === caseId);
        
        if (!this.state.caseData) {
            alert("Errore: Impossibile caricare il fascicolo dal database.");
            return;
        }

        window.showView('view-trial');
        this.renderPhase();
    },
    
    nextPhase: async function() {
        if (this.state.currentPhase === 8) {
            const verdictSelect = document.getElementById('verdict-select');
            const verdictMotivation = document.getElementById('verdict-motivation');
            
            if (verdictSelect && verdictSelect.value === "") {
                alert("Per favore, pronuncia un verdetto prima di procedere al Sigillo.");
                return;
            }
            
            // Salva nel cloud
            if (window.EroiDB && window.EroiDB.cache && window.EroiDB.cache.userProfile) {
                const user = window.EroiDB.cache.userProfile;
                const sentenceData = {
                    uid: user.uid,
                    displayName: user.displayName || "Studente Anonimo",
                    classCode: user.classCode || "Nessuna",
                    caseId: this.state.currentCaseId,
                    verdict: verdictSelect.value,
                    motivation: verdictMotivation.value,
                    timestamp: new Date()
                };
                try {
                    await window.EroiDB.saveSentence(sentenceData);
                } catch (e) {
                    console.error("Errore salvataggio verdetto", e);
                }
            }
        }
        
        if (this.state.currentPhase < 10) {
            if (window.AudioEngine) window.AudioEngine.playClick();
            this.state.currentPhase++;
            this.renderPhase();
        }
    },

    prevPhase: function() {
        if (this.state.currentPhase > 1) {
            if (window.AudioEngine) window.AudioEngine.playClick();
            this.state.currentPhase--;
            this.renderPhase();
        }
    },

    renderPhase: function() {
        const trialContent = document.getElementById('trial-content');
        const trialNextBtn = document.getElementById('trial-next-btn');
        const trialBackBtn = document.getElementById('trial-back-btn');
        
        document.getElementById('trial-phase-text').textContent = `Fase ${this.state.currentPhase} di 10`;
        document.getElementById('trial-progress').style.width = `${(this.state.currentPhase / 10) * 100}%`;
        
        trialBackBtn.style.display = 'inline-block';
        trialNextBtn.style.display = 'inline-block';
        trialNextBtn.disabled = false;
        trialNextBtn.textContent = 'Procedi';
        
        if (this.state.currentPhase === 1) {
            trialBackBtn.style.display = 'none'; // Prima fase, non si torna indietro nel processo, usa la freccia della header o annulla.
        }

        let data = this.state.caseData;
        if (window.LiveEditor && typeof window.LiveEditor.apply === 'function') {
            data = window.LiveEditor.apply(`case_${data.id}`, data);
        }

        const getEditBtn = (subKey, currentTxt) => {
            if (!window.LiveEditor || typeof window.LiveEditor.renderBtn !== 'function') return '';
            return window.LiveEditor.renderBtn(`case_${data.id}_${subKey}`, { characterName: data.characterName, text: currentTxt });
        };

        switch (this.state.currentPhase) {
            case 1: // Fase 1: Apertura del Fascicolo
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 1: Apertura del Fascicolo</h3>
                    <p style="text-align:center;"><strong>Fascicolo: ${data.characterName}</strong> | <span class="text-muted">${data.canto} - ${data.cerchio}</span></p>
                    <hr style="border-color: rgba(212,175,55,0.2); margin: 15px 0;">
                    
                    <div style="background: rgba(0,0,0,0.3); padding: 25px; border-left: 4px solid var(--accent-gold); margin-top: 20px; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                        <h4 style="color: var(--accent-gold); margin-top: 0; margin-bottom: 15px;">Introduzione ${getEditBtn('intro', data.phases?.intro)}</h4>
                        <p style="line-height: 1.8; font-size: 1.15rem;">${data.phases?.intro || "Nessuna introduzione."}</p>
                        
                        <h4 style="color: var(--accent-gold); margin-top: 25px; margin-bottom: 15px;">L'Obiettivo</h4>
                        <p style="line-height: 1.8; font-size: 1.15rem; font-style: italic;">${data.phases?.obiettivo || "Nessun obiettivo."}</p>
                    </div>
                `;
                break;

            case 2: // Fase 2: Ricostruzione dei Fatti
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 2: Ricostruzione dei Fatti</h3>
                    
                    <div style="background: url('assets/Immagini/parchment_bg.png') center/cover; padding: 30px; border-radius: 10px; color: #222; font-family: 'Times New Roman', serif; box-shadow: inset 0 0 40px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.5); margin-top: 20px;">
                        <h4 style="color: #4a2c11; margin-top: 0; border-bottom: 1px solid rgba(74, 44, 17, 0.3); padding-bottom: 5px;">I Fatti Storici ${getEditBtn('facts', data.phases?.facts)}</h4>
                        <p style="line-height: 1.8; font-size: 1.15rem;">${data.phases?.facts || "Nessun fatto storico."}</p>
                        
                        <h4 style="color: #4a2c11; margin-top: 25px; border-bottom: 1px solid rgba(74, 44, 17, 0.3); padding-bottom: 5px;">La Tragedia ${getEditBtn('tragedia', data.phases?.tragedia)}</h4>
                        <p style="line-height: 1.8; font-size: 1.15rem;">${data.phases?.tragedia || "Nessuna tragedia."}</p>
                    </div>
                `;
                break;

            case 3: // Fase 3: Raccolta Prove (Minigame base)
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 3: Raccolta Prove</h3>
                    <p style="text-align:center; font-style: italic; color: #aaa;">Supera questa prova per dimostrare la tua comprensione del caso.</p>
                    <div id="minigame-container" style="margin-top: 20px;"></div>
                `;
                if (window.MinigamesEngine) {
                    window.MinigamesEngine.loadMinigame(data, document.getElementById('minigame-container'));
                }
                break;

            case 4: // Fase 4: L'Accusa / Limiti Terreni
                const isParadiso = data.campaignId === 'paradiso';
                const f4Title = isParadiso ? "Fase 4: I Limiti Terreni" : "Fase 4: L'Accusa";
                const danteTitle = isParadiso ? "Dante Alighieri (L'Indagine)" : "Dante Alighieri (L'Accusa)";
                const contrapTitle = isParadiso ? "La Beatitudine" : "Il Contrappasso";
                
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">${f4Title}</h3>
                    <div style="display: flex; gap: 20px; align-items: flex-end; margin-top: 20px; flex-wrap: wrap;">
                        <div style="flex: 0 0 180px; display: flex; justify-content: center;">
                            <img src="public/assets/dante_full.png" style="max-height: 450px; width: auto; filter: drop-shadow(0 0 10px rgba(0,0,0,0.8));">
                        </div>
                        <div style="flex: 1; background: url('assets/Immagini/parchment_bg.png') center/cover; padding: 25px; border-radius: 10px; color: #222; font-family: 'Times New Roman', serif; box-shadow: inset 0 0 30px rgba(0,0,0,0.4), 0 5px 15px rgba(0,0,0,0.5); min-width: 250px;">
                            <h4 style="color: #6a040f; margin-top: 0; border-bottom: 1px solid rgba(106, 4, 15, 0.3); padding-bottom: 5px;">${danteTitle} ${getEditBtn('accusation', data.phases?.accusation)}</h4>
                            <p style="line-height: 1.8; font-size: 1.15rem;">${data.phases?.accusation || "L'indagine è silente."}</p>
                            
                            <h5 style="color: #6a040f; margin-top: 20px;">Citazione ${getEditBtn('citazione', data.phases?.citazione)}</h5>
                            <p style="font-size: 1.1rem; font-style: italic; background: rgba(0,0,0,0.05); padding: 10px; border-left: 3px solid #6a040f;">${data.phases?.citazione || "Nessuna citazione."}</p>

                            <h5 style="color: #6a040f; margin-top: 20px;">${contrapTitle}</h5>
                            <p style="line-height: 1.6; font-size: 1.05rem;">${data.phases?.contrappasso || "Nessun dato noto."}</p>
                        </div>
                    </div>
                `;
                break;

            case 5: // Fase 5: La Difesa / Elogio della Grazia
                const isParadiso5 = data.campaignId === 'paradiso';
                const f5Title = isParadiso5 ? "Fase 5: L'Elogio della Grazia" : "Fase 5: La Difesa";
                const defTitle = isParadiso5 ? "La Voce dei Beati" : "Avvocato Difensore";
                
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">${f5Title}</h3>
                    <div style="display: flex; gap: 20px; align-items: flex-end; margin-top: 20px; flex-wrap: wrap; flex-direction: row-reverse;">
                        <div style="flex: 0 0 180px; display: flex; justify-content: center;">
                            <img src="public/assets/difesa_full.png" style="max-height: 450px; width: auto; filter: drop-shadow(0 0 10px rgba(0,0,0,0.8));">
                        </div>
                        <div style="flex: 1; background: url('assets/Immagini/parchment_bg.png') center/cover; padding: 25px; border-radius: 10px; color: #222; font-family: 'Times New Roman', serif; box-shadow: inset 0 0 30px rgba(0,0,0,0.4), 0 5px 15px rgba(0,0,0,0.5); min-width: 250px;">
                            <h4 style="color: #4a2c11; margin-top: 0; border-bottom: 1px solid rgba(74, 44, 17, 0.3); padding-bottom: 5px; text-align: right;">${defTitle} ${getEditBtn('defense', data.phases?.defense)}</h4>
                            <p style="font-size: 1.15rem; line-height: 1.8;">${data.phases?.defense || "La difesa tace."}</p>
                        </div>
                    </div>
                `;
                break;

            case 6: // Fase 6: Esame Incrociato (Minigioco Avanzato 1)
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 6: Esame Incrociato</h3>
                    <p style="text-align:center; font-style: italic; color: #aaa;">Metti alla prova la tua comprensione logica delle due parti.</p>
                    <div id="cross-exam-container" style="margin-top: 20px;"></div>
                `;
                if (window.MinigamesEngine) {
                    window.MinigamesEngine.loadCrossExamination(document.getElementById('cross-exam-container'), trialNextBtn, data);
                }
                break;

            case 7: // Fase 7: Dante Oggi
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 7: Dante Oggi</h3>
                    <div style="display: flex; gap: 20px; align-items: flex-start; margin-top: 20px; flex-wrap: wrap; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px;">
                        <div style="flex: 0 0 100px; display: flex; justify-content: center;">
                            <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 2px solid var(--accent-gold); box-shadow: 0 0 15px rgba(212,175,55,0.4);">
                                <img src="public/assets/dante_full.png" style="width: 100%; height: auto; object-fit: cover; object-position: top;">
                            </div>
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                            <h4 style="color: var(--accent-gold); margin-top: 0;">Il Dilemma Contemporaneo</h4>
                            <p style="font-size: 1.2rem; line-height: 1.6; font-style: italic; border-left: 2px solid var(--accent-gold); padding-left: 15px; color: #fff;">"${data.phases?.reflection || "Riflessione non disponibile."}"</p>
                            <p style="margin-top: 15px; color: #aaa; font-size: 0.9rem;">Prendi nota delle tue riflessioni (opzionale):</p>
                            <textarea class="form-input" rows="3" placeholder="I tuoi appunti per preparare il verdetto..." style="margin-top: 5px; font-size: 1rem; width: 100%; border-radius: 8px; border: 1px solid #444; background: rgba(0,0,0,0.5); color: #fff; padding: 10px;"></textarea>
                        </div>
                    </div>
                `;
                break;

            case 8: // Fase 8: Il Verdetto
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center; margin-bottom: 20px; font-size: 2rem;">Fase 8: Il Verdetto</h3>
                    
                    <div style="background: url('assets/Immagini/2.png') center/cover; border-radius: 15px; padding: 30px; box-shadow: inset 0 0 80px rgba(0,0,0,0.9); position: relative; overflow: hidden;">
                        <div style="background: rgba(0,0,0,0.7); position: absolute; top:0; left:0; right:0; bottom:0;"></div>
                        
                        <div style="position: relative; z-index: 1;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <img src="assets/Immagini/1.png" style="width: 80px; filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));">
                                <h4 style="color: var(--accent-gold); font-size: 1.5rem; margin-top: 10px;">La Corte attende la tua decisione</h4>
                            </div>

                            <label for="verdict-select" style="font-weight: bold; margin-bottom: 10px; display: block; color: #fff; font-size: 1.2rem;">Qual è la tua sentenza per ${data.characterName}?</label>
                            <select id="verdict-select" style="font-size: 1.1rem; padding: 15px; width: 100%; border-radius: 8px; border: 2px solid var(--accent-gold); background: rgba(20,20,30,0.9); color: #fff; margin-bottom: 25px;">
                                <option value="">-- Pronuncia il Verdetto --</option>
                                <option value="conferma">✔ Confermo Dante (Colpevolezza invariata)</option>
                                <option value="riduzione">✔ Riduco la pena (Circostanze attenuanti)</option>
                                <option value="aggravo">✔ Aggraverei la pena (Maggiore severità)</option>
                                <option value="assoluzione">✔ Assolverei (Innocente ai giorni nostri)</option>
                            </select>

                            <label for="verdict-motivation" style="font-weight: bold; margin-bottom: 10px; display: block; color: #fff; font-size: 1.2rem;">Perché?</label>
                            <textarea id="verdict-motivation" rows="5" placeholder="Sostieni il tuo verdetto con l'argomentazione..." style="font-size: 1.1rem; padding: 15px; width: 100%; border-radius: 8px; border: 2px solid #555; background: rgba(0,0,0,0.6); color: #fff; box-sizing: border-box;"></textarea>
                        </div>
                    </div>
                `;
                trialNextBtn.textContent = 'Apponi il Sigillo';
                break;

            case 9: // Fase 9: Il Sigillo del Giudice (Minigioco Avanzato 2)
                trialContent.innerHTML = `
                    <div id="seal-puzzle-container" style="margin-top: 20px;"></div>
                `;
                trialNextBtn.textContent = 'Archivia';
                if (window.MinigamesEngine) {
                    window.MinigamesEngine.loadSealPuzzle(document.getElementById('seal-puzzle-container'), trialNextBtn, data);
                }
                break;

            case 10: // Fase 10: Riepilogo e Video
                trialContent.innerHTML = `<div style="text-align:center; padding: 50px;"><h2 style="color:var(--accent-gold);">Raccolta delle sentenze in corso...</h2></div>`;
                trialNextBtn.style.display = 'none';
                trialBackBtn.style.display = 'none';

                const role = (window.EroiDB && window.EroiDB.cache.userProfile) ? window.EroiDB.cache.userProfile.role : 'external';
                const classCode = (window.EroiDB && window.EroiDB.cache.userProfile) ? window.EroiDB.cache.userProfile.classCode : null;
                const showVideoBtn = (role === 'teacher' || role === 'admin' || role === 'external');
                
                let statsPromise = Promise.resolve({ conferma: 1, riduzione: 0, aggravo: 0, assoluzione: 0, total: 1, motivations: [] });
                if (window.EroiDB && window.EroiDB.getCaseStats) {
                    statsPromise = window.EroiDB.getCaseStats(this.state.currentCaseId, classCode);
                }

                statsPromise.then(stats => {
                    if (stats.total === 0) {
                        stats.total = 1; // prevent div by 0
                    }
                    
                    let pctConferma = Math.round((stats.conferma / stats.total) * 100);
                    let pctAssoluzione = Math.round((stats.assoluzione / stats.total) * 100);
                    let pctRiduzione = Math.round((stats.riduzione / stats.total) * 100);
                    let pctAggravo = Math.round((stats.aggravo / stats.total) * 100);
                    
                    // Shuffle motivations and pick up to 3
                    const shuffledMots = stats.motivations.sort(() => 0.5 - Math.random());
                    const selectedMots = shuffledMots.slice(0, 3);
                    
                    let motivationsHtml = '';
                    if (selectedMots.length > 0) {
                        motivationsHtml = `<div style="margin-top: 25px; border-top: 1px solid #555; padding-top: 15px;">
                            <h5 style="color: var(--accent-gold); margin-bottom: 10px;">Alcune motivazioni anonime:</h5>
                            <ul style="text-align: left; font-size: 0.95rem; color: #ccc; font-style: italic; padding-left: 20px;">
                                ${selectedMots.map(m => `<li>"${m}"</li>`).join('')}
                            </ul>
                        </div>`;
                    }
                    
                    let actionBtnHtml = '';
                    if (showVideoBtn) {
                        actionBtnHtml = `<button id="play-video-btn" class="btn glow" style="background: var(--accent-gold); color: #1a1a2e; margin-top: 30px; font-size: 1.3rem; padding: 15px 30px;">Torna alla Libreria</button>`;
                    } else {
                        actionBtnHtml = `
                            <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; border: 1px solid var(--accent-gold); margin-top: 20px;">
                                <p style="color: var(--accent-gold); font-weight: bold; margin: 0;">Il tuo verdetto è stato sigillato.</p>
                            </div>
                            <button id="return-map-btn" class="btn" style="background: var(--accent-gold); color: #1a1a2e; margin-top: 15px; font-size: 1.2rem; padding: 10px 20px;">Torna alla Mappa</button>
                        `;
                    }

                    trialContent.innerHTML = `
                        <div style="text-align:center;">
                            <h2 class="text-gold" style="font-size: 2.2rem; margin-bottom: 15px; font-family: 'Julius Sans One', sans-serif;">Il Verdetto Popolare</h2>
                            
                            <div style="background: rgba(0,0,0,0.6); padding: 25px; border-radius: 10px; border: 1px solid #444; max-width: 600px; margin: 0 auto; text-align: left;">
                                <h4 style="margin-top:0; color: #fff; text-align: center; border-bottom: 1px solid #555; padding-bottom: 10px;">Statistiche delle Decisioni (${stats.total} Voti)</h4>
                                
                                <div style="margin-top: 15px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>Conferma Dante</span> <span>${pctConferma}%</span></div>
                                    <div style="width: 100%; background: #222; border-radius: 5px; height: 12px;"><div style="width: ${pctConferma}%; background: var(--accent-gold); height: 100%; border-radius: 5px;"></div></div>
                                </div>
                                
                                <div style="margin-top: 15px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>Riduzione Pena</span> <span>${pctRiduzione}%</span></div>
                                    <div style="width: 100%; background: #222; border-radius: 5px; height: 12px;"><div style="width: ${pctRiduzione}%; background: #4da8da; height: 100%; border-radius: 5px;"></div></div>
                                </div>
                                
                                <div style="margin-top: 15px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>Aggravante</span> <span>${pctAggravo}%</span></div>
                                    <div style="width: 100%; background: #222; border-radius: 5px; height: 12px;"><div style="width: ${pctAggravo}%; background: var(--danger-color); height: 100%; border-radius: 5px;"></div></div>
                                </div>
                                
                                <div style="margin-top: 15px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>Assoluzione</span> <span>${pctAssoluzione}%</span></div>
                                    <div style="width: 100%; background: #222; border-radius: 5px; height: 12px;"><div style="width: ${pctAssoluzione}%; background: #00cc66; height: 100%; border-radius: 5px;"></div></div>
                                </div>
                                
                                ${motivationsHtml}
                            </div>

                            ${actionBtnHtml}
                            <p class="text-crimson" style="font-weight: bold; font-size: 1.5rem; margin-top: 20px;">+150 XP Ottenuti</p>
                        </div>
                    `;
                    
                    if (showVideoBtn) {
                        const playBtn = document.getElementById('play-video-btn');
                        playBtn.onclick = () => {
                            if (window.AudioEngine) window.AudioEngine.playGavel();
                            const overlay = document.getElementById('fullscreen-video-overlay');
                            const video = document.getElementById('finale-video');
                            
                            let videoFile = 'ingresso_inferno.mp4';
                            if (data.campaignId === 'purgatorio') videoFile = 'ingresso_purgatorio.mp4';
                            if (data.campaignId === 'paradiso') videoFile = 'ingresso_paradiso.mp4';
                            
                            video.src = `assets/video/${videoFile}`;
                            overlay.style.display = 'flex';
                            video.play();
                            
                            const closeVideo = () => {
                                video.pause();
                                overlay.style.display = 'none';
                                if (window.MapEngine) window.MapEngine.markCaseCompleted(this.state.currentCaseId);
                                window.showView('view-map');
                            };
                            
                            video.onended = closeVideo;
                            document.getElementById('close-video-btn').onclick = closeVideo;
                        };
                    } else {
                        const returnBtn = document.getElementById('return-map-btn');
                        returnBtn.onclick = () => {
                            if (window.MapEngine) window.MapEngine.markCaseCompleted(this.state.currentCaseId);
                            window.showView('view-map');
                        };
                    }
                });
                break;
        }
    }
};

window.EroiGame = EroiGame;
