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
        if (this.state.currentPhase < 8) {
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
        
        document.getElementById('trial-phase-text').textContent = `Fase ${this.state.currentPhase} di 8`;
        document.getElementById('trial-progress').style.width = `${(this.state.currentPhase / 8) * 100}%`;
        
        trialBackBtn.style.display = 'inline-block';
        trialNextBtn.style.display = 'inline-block';
        trialNextBtn.textContent = 'Procedi';
        
        if (this.state.currentPhase === 1) {
            trialBackBtn.style.display = 'none'; // Prima fase, non si torna indietro nel processo, usa la freccia della header o annulla.
        }

        const data = this.state.caseData;

        switch (this.state.currentPhase) {
            case 1: // Fase 1: Apertura
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 1: Apertura del Fascicolo</h3>
                    <p style="text-align:center;"><strong>Imputato: ${data.characterName}</strong></p>
                    <p style="text-align:center;" class="text-muted">${data.canto} - ${data.cerchio}</p>
                    <hr style="border-color: rgba(212,175,55,0.2); margin: 15px 0;">
                    <p>Giudice, la Corte è convocata. Sei chiamato ad esaminare questo caso e ad emettere un verdetto secondo giustizia.</p>
                `;
                break;
            case 2: // Fase 2: I Fatti (Studio)
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 2: I Fatti</h3>
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-left: 3px solid var(--accent-gold); margin-top: 15px;">
                        <p style="line-height: 1.6;">${data.phases?.facts || "Descrizione dei fatti non disponibile."}</p>
                    </div>
                `;
                break;
            case 3: // Fase 3: Le Prove (Minigioco)
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 3: Raccolta delle Prove</h3>
                    <div id="minigame-container" style="margin-top: 20px;"></div>
                `;
                if (window.MinigamesEngine) {
                    window.MinigamesEngine.loadMinigame(data.id, document.getElementById('minigame-container'));
                }
                break;
            case 4: // Fase 4: L'Accusa
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 4: L'Accusa</h3>
                    <div style="background: rgba(200, 50, 50, 0.1); padding: 15px; border-left: 3px solid var(--danger-color); margin-top: 15px;">
                        <p style="line-height: 1.6;">${data.phases?.accusation || "Requisitoria dell'accusa non disponibile."}</p>
                    </div>
                `;
                break;
            case 5: // Fase 5: La Difesa
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 5: La Difesa</h3>
                    <div style="background: rgba(50, 150, 200, 0.1); padding: 15px; border-left: 3px solid #3296c8; margin-top: 15px;">
                        <p style="line-height: 1.6;"><em>"${data.phases?.defense || "Arringa della difesa non disponibile."}"</em></p>
                    </div>
                `;
                break;
            case 6: // Fase 6: Dante Oggi (Riflessione contemporanea)
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 6: Il Peccato nel Mondo Contemporaneo</h3>
                    <p style="text-align:justify;">Rifletti su come questo peccato si manifesta oggi. Che forma prende nella società moderna?</p>
                    <textarea class="form-input" rows="4" placeholder="Scrivi qui i tuoi appunti... (opzionale)"></textarea>
                `;
                break;
            case 7: // Fase 7: Emetti Verdetto
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 7: Il Verdetto</h3>
                    <p>Qual è la tua decisione sulla sorte dell'anima?</p>
                    <select id="verdict-select" class="form-input" style="margin-bottom: 15px;">
                        <option value="">-- Seleziona --</option>
                        <option value="colpevole">Colpevole (Inferno)</option>
                        <option value="attenuanti">Colpevole con attenuanti (Purgatorio)</option>
                        <option value="innocente">Innocente / Giustificato (Paradiso)</option>
                    </select>
                    <textarea id="verdict-motivation" class="form-input" rows="4" placeholder="Motiva in modo dettagliato la tua sentenza... (Obbligatorio)"></textarea>
                `;
                trialNextBtn.textContent = 'Sigilla Sentenza';
                break;
            case 8: // Fase 8: Sentenza Eseguita
                trialContent.innerHTML = `
                    <div style="text-align:center;">
                        <h2 class="text-gold">Sentenza Emessa!</h2>
                        <img src="public/assets/pergamena_crest.png" style="width: 100px; opacity: 0.8; margin: 20px 0;">
                        <p>Il tuo verdetto è stato archiviato negli annali della Corte.</p>
                        <p class="text-crimson" style="font-weight: bold; font-size: 1.2rem;">+500 XP</p>
                    </div>
                `;
                trialNextBtn.style.display = 'none';
                trialBackBtn.style.display = 'none';
                
                // Aggiungiamo un bottone per tornare alla dashboard
                const returnBtn = document.createElement('button');
                returnBtn.className = 'btn';
                returnBtn.style.background = 'var(--accent-gold)';
                returnBtn.style.color = '#1a1a2e';
                returnBtn.style.marginTop = '20px';
                returnBtn.textContent = 'Torna alla Dashboard';
                returnBtn.onclick = () => window.showView('view-dashboard');
                trialContent.appendChild(returnBtn);
                break;
        }
    }
};

window.EroiGame = EroiGame;
