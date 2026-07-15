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
    
    nextPhase: function() {
        if (this.state.currentPhase < 7) {
            this.state.currentPhase++;
            this.renderPhase();
        }
    },

    prevPhase: function() {
        if (this.state.currentPhase > 1) {
            this.state.currentPhase--;
            this.renderPhase();
        }
    },

    renderPhase: function() {
        const trialContent = document.getElementById('trial-content');
        const trialNextBtn = document.getElementById('trial-next-btn');
        const trialBackBtn = document.getElementById('trial-back-btn');
        
        document.getElementById('trial-phase-text').textContent = `Fase ${this.state.currentPhase} di 7`;
        document.getElementById('trial-progress').style.width = `${(this.state.currentPhase / 7) * 100}%`;
        
        trialBackBtn.style.display = 'inline-block';
        trialNextBtn.style.display = 'inline-block';
        trialNextBtn.textContent = 'Procedi';
        
        if (this.state.currentPhase === 1) {
            trialBackBtn.style.display = 'none'; // Prima fase, non si torna indietro nel processo, usa la freccia della header o annulla.
        }

        const data = this.state.caseData;
        const isPaolo = this.state.currentCaseId === "paolo_francesca";

        switch (this.state.currentPhase) {
            case 1: // Fase 1: Indagine
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 1: L'Indagine</h3>
                    <p style="text-align:center;"><strong>Fascicolo: ${data.characterName}</strong> | <span class="text-muted">${data.canto} - ${data.cerchio}</span></p>
                    <hr style="border-color: rgba(212,175,55,0.2); margin: 15px 0;">
                    
                    <div style="background: rgba(0,0,0,0.3); padding: 25px; border-left: 4px solid var(--accent-gold); margin-top: 20px; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                        <h4 style="color: var(--accent-gold); margin-top: 0; margin-bottom: 15px;">I Fatti</h4>
                        <p style="line-height: 1.8; font-size: 1.15rem;">${data.phases?.facts || "Descrizione dei fatti non disponibile. Controlla gli archivi."}</p>
                    </div>
                `;
                break;

            case 2: // Fase 2: Raccolta Prove
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 2: Raccolta Prove</h3>
                    <p style="text-align:center; font-style: italic; color: #aaa;">Supera questa prova per dimostrare la tua comprensione del caso.</p>
                    <div id="minigame-container" style="margin-top: 20px;"></div>
                `;
                if (window.MinigamesEngine) {
                    window.MinigamesEngine.loadMinigame(data.id, document.getElementById('minigame-container'));
                }
                break;

            case 3: // Fase 3: L'Accusa (Dante)
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 3: L'Accusa</h3>
                    <div style="display: flex; gap: 20px; align-items: flex-end; margin-top: 20px; flex-wrap: wrap;">
                        <div style="flex: 0 0 180px; display: flex; justify-content: center;">
                            <img src="public/assets/dante_full.png" style="max-height: 350px; width: auto; filter: drop-shadow(0 0 10px rgba(0,0,0,0.8));">
                        </div>
                        <div style="flex: 1; background: url('assets/Immagini/parchment_bg.png') center/cover; padding: 25px; border-radius: 10px; color: #222; font-family: 'Times New Roman', serif; box-shadow: inset 0 0 30px rgba(0,0,0,0.4), 0 5px 15px rgba(0,0,0,0.5); min-width: 250px;">
                            <h4 style="color: #6a040f; margin-top: 0; border-bottom: 1px solid rgba(106, 4, 15, 0.3); padding-bottom: 5px;">Dante Alighieri (Accusa)</h4>
                            <p style="line-height: 1.8; font-size: 1.15rem; text-shadow: 0 1px 2px rgba(255,255,255,0.5);">${data.phases?.accusation || "L'accusa è silente."}</p>
                        </div>
                    </div>
                `;
                break;

            case 4: // Fase 4: La Difesa (Avvocato)
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 4: La Difesa</h3>
                    <div style="display: flex; gap: 20px; align-items: flex-end; margin-top: 20px; flex-wrap: wrap; flex-direction: row-reverse;">
                        <div style="flex: 0 0 180px; display: flex; justify-content: center;">
                            <img src="public/assets/difesa_full.png" style="max-height: 380px; width: auto; filter: drop-shadow(0 0 10px rgba(0,0,0,0.8));">
                        </div>
                        <div style="flex: 1; background: url('assets/Immagini/parchment_bg.png') center/cover; padding: 25px; border-radius: 10px; color: #222; font-family: 'Times New Roman', serif; box-shadow: inset 0 0 30px rgba(0,0,0,0.4), 0 5px 15px rgba(0,0,0,0.5); min-width: 250px;">
                            <h4 style="color: #4a2c11; margin-top: 0; border-bottom: 1px solid rgba(74, 44, 17, 0.3); padding-bottom: 5px; text-align: right;">Avvocato Difensore</h4>
                            <p style="font-size: 1.15rem; line-height: 1.8; text-shadow: 0 1px 2px rgba(255,255,255,0.5);">${data.phases?.defense || "La difesa tace."}</p>
                        </div>
                    </div>
                `;
                break;

            case 5: // Fase 5: Dante Oggi
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 5: Dante Oggi</h3>
                    <div style="display: flex; gap: 20px; align-items: flex-start; margin-top: 20px; flex-wrap: wrap; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px;">
                        <div style="flex: 0 0 100px; display: flex; justify-content: center;">
                            <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 2px solid var(--accent-gold); box-shadow: 0 0 15px rgba(212,175,55,0.4);">
                                <img src="public/assets/dante_full.png" style="width: 100%; height: auto; object-fit: cover; object-position: top;">
                            </div>
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                            <p style="font-size: 1.2rem; line-height: 1.6; font-style: italic; border-left: 2px solid var(--accent-gold); padding-left: 15px; color: #fff;">"${data.phases?.reflection || "Riflessione non disponibile."}"</p>
                            <p style="margin-top: 15px; color: #aaa; font-size: 0.9rem;">Prendi nota delle tue riflessioni (opzionale):</p>
                            <textarea class="form-input" rows="3" placeholder="I tuoi appunti per il verdetto..." style="margin-top: 5px; font-size: 1rem; width: 100%; border-radius: 8px; border: 1px solid #444; background: rgba(0,0,0,0.5); color: #fff; padding: 10px;"></textarea>
                        </div>
                    </div>
                `;
                break;

            case 6: // Fase 6: Il Verdetto
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center; margin-bottom: 20px; font-size: 2rem;">Fase 6: Il Verdetto</h3>
                    
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
                trialNextBtn.textContent = 'Batti il Martello';
                break;

            case 7: // Fase 7: Chiusura
                trialContent.innerHTML = `
                    <div style="text-align:center;">
                        <h2 class="text-gold" style="font-size: 2.5rem; margin-bottom: 20px;">Sentenza Archiviata</h2>
                        <img src="assets/Immagini/3.png" style="width: 150px; margin: 20px 0; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.8));">
                        <p style="font-size: 1.2rem;">Il tuo verdetto e le tue argomentazioni sono state sigillate negli annali della Corte.</p>
                        <p class="text-crimson" style="font-weight: bold; font-size: 1.8rem; margin-top: 20px; animation: pulse 1s infinite alternate;">+100 XP</p>
                    </div>
                `;
                trialNextBtn.style.display = 'none';
                trialBackBtn.style.display = 'none';
                
                const returnBtn = document.createElement('button');
                returnBtn.className = 'btn';
                returnBtn.style.background = 'var(--accent-gold)';
                returnBtn.style.color = '#1a1a2e';
                returnBtn.style.marginTop = '30px';
                returnBtn.style.fontSize = '1.2rem';
                returnBtn.style.padding = '15px 30px';
                returnBtn.textContent = 'Torna alla Libreria';
                returnBtn.onclick = () => {
                    if (window.MapEngine) window.MapEngine.markCaseCompleted(this.state.currentCaseId);
                    window.showView('view-dashboard');
                };
                trialContent.appendChild(returnBtn);
                break;
        }
    }
};

window.EroiGame = EroiGame;
