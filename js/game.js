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
        const isPaolo = this.state.currentCaseId === "paolo_francesca";

        switch (this.state.currentPhase) {
            case 1: // Fase 1: Apertura
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 1: Convocazione della Corte</h3>
                    <p style="text-align:center;"><strong>Imputato: ${data.characterName}</strong> | <span class="text-muted">${data.canto} - ${data.cerchio}</span></p>
                    <hr style="border-color: rgba(212,175,55,0.2); margin: 15px 0;">
                    
                    <div style="display: flex; gap: 20px; align-items: flex-end; margin-top: 20px; flex-wrap: wrap;">
                        <div style="flex: 0 0 180px; display: flex; justify-content: center;">
                            <img src="public/assets/dante_full.png" style="max-height: 350px; width: auto; filter: drop-shadow(0 0 10px rgba(0,0,0,0.8));">
                        </div>
                        <div style="flex: 1; background: url('assets/Immagini/parchment_bg.png') center/cover; padding: 25px; border-radius: 10px; color: #222; font-family: 'Times New Roman', serif; box-shadow: inset 0 0 30px rgba(0,0,0,0.4), 0 5px 15px rgba(0,0,0,0.5); min-width: 250px;">
                            <h4 style="color: #6a040f; margin-top: 0; border-bottom: 1px solid rgba(106, 4, 15, 0.3); padding-bottom: 5px;">Dante Alighieri</h4>
                            <p style="font-size: 1.15rem; line-height: 1.7; font-weight: bold; font-style: italic;">"O animal grazïoso e benigno..."</p>
                            <p style="font-size: 1.1rem; line-height: 1.6;">Benvenuto, Giudice. La Corte Infernale è ora convocata per esaminare il caso di ${data.characterName}. Ti affido l'arduo compito di ascoltare i fatti, valutare le prove e decidere se la pena assegnata dalla Giustizia Divina sia, ai tuoi occhi contemporanei, proporzionata al peccato commesso.</p>
                        </div>
                    </div>
                `;
                break;
            case 2: // Fase 2: I Fatti (Studio)
                const factsText = isPaolo ? 
                    `Siamo nel secondo cerchio dell'Inferno, dove la bufera infernal che mai non resta trascina gli spiriti dei lussuriosi, coloro che <em>sottomisero la ragione al talento</em>.<br><br>Francesca da Polenta, data in sposa per motivi politici a Gianciotto Malatesta (uomo deforme e zoppo), si innamorò perdutamente del fratello di lui, l'affascinante Paolo.<br><br>Un giorno, mentre i due leggevano per diletto le avventure di Lancillotto e Ginevra, arrivarono al punto in cui l'eroe bacia la regina. In quell'istante, come confessa Francesca stessa:<br><br><span style="display:block; text-align:center; font-style:italic; margin: 15px 0; color: #6a040f;">"Galeotto fu 'l libro e chi lo scrisse:<br>quel giorno più non vi leggemmo avante."</span><br>Gianciotto li sorprese in flagrante e, accecato dall'ira e dal disonore, li trafisse entrambi con la sua spada, unendoli nella morte come lo erano stati nell'amore.`
                    : (data.phases?.facts || "Descrizione dei fatti non disponibile.");
                    
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 2: Ricostruzione dei Fatti</h3>
                    <div style="background: rgba(0,0,0,0.3); padding: 25px; border-left: 4px solid var(--accent-gold); margin-top: 20px; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                        <p style="line-height: 1.8; font-size: 1.1rem;">${factsText}</p>
                    </div>
                `;
                break;
            case 3: // Fase 3: Le Prove (Minigioco)
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 3: Ricerca delle Prove</h3>
                    <div id="minigame-container" style="margin-top: 20px;"></div>
                `;
                if (window.MinigamesEngine) {
                    window.MinigamesEngine.loadMinigame(data.id, document.getElementById('minigame-container'));
                }
                break;
            case 4: // Fase 4: L'Accusa
                const accText = isPaolo ? 
                    `Onorevole Giudice, questi due spiriti hanno commesso il più vile dei tradimenti contro il sacro vincolo del matrimonio! Hanno permesso che il desiderio carnale prevalesse sulla ragione, principio divino che ci eleva dalle bestie.<br><br>Non lasciatevi ingannare dalle loro lacrime: non vi è pentimento in loro. Hanno infranto le leggi degli uomini e di Dio per soddisfare un capriccio terreno. La loro lussuria ha scatenato sangue e morte, distruggendo l'onore della famiglia Malatesta!`
                    : (data.phases?.accusation || "Requisitoria dell'accusa non disponibile.");
                    
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 4: Requisitoria dell'Accusa</h3>
                    <div style="background: rgba(200, 50, 50, 0.1); padding: 25px; border-left: 4px solid var(--danger-color); margin-top: 20px; border-radius: 4px; border-right: 1px solid rgba(255,0,0,0.2); box-shadow: inset 0 0 20px rgba(255,0,0,0.05);">
                        <h4 style="color: var(--danger-color); margin-top: 0;">L'Accusatore (Minosse)</h4>
                        <p style="line-height: 1.8; font-size: 1.1rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${accText}</p>
                    </div>
                `;
                break;
            case 5: // Fase 5: La Difesa
                const defText = isPaolo ? 
                    `Vostro Onore, vi prego di guardare non all'atto in sé, ma alla forza sovrumana che l'ha generato. L'Amore è un signore potente e invincibile per i cuori gentili. Come ha detto la mia assistita:<br><br><span style="display:block; font-style:italic; margin: 15px 0; color: #4a2c11; font-weight: bold;">"Amor, ch'a nullo amato amar perdona,<br>mi prese del costui piacer sì forte,<br>che, come vedi, ancor non m'abbandona."</span><br>Non è stata una scelta maliziosa e calcolata, ma l'impeto di un sentimento così puro e travolgente da accecare chiunque. Condannerete davvero per l'eternità due anime la cui unica colpa è stata l'aver amato troppo?`
                    : (data.phases?.defense || "Arringa della difesa non disponibile.");
                    
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 5: L'Arringa della Difesa</h3>
                    <div style="display: flex; gap: 20px; align-items: flex-end; margin-top: 20px; flex-wrap: wrap; flex-direction: row-reverse;">
                        <div style="flex: 0 0 180px; display: flex; justify-content: center;">
                            <img src="public/assets/difesa_full.png" style="max-height: 380px; width: auto; filter: drop-shadow(0 0 10px rgba(0,0,0,0.8));">
                        </div>
                        <div style="flex: 1; background: url('assets/Immagini/parchment_bg.png') center/cover; padding: 25px; border-radius: 10px; color: #222; font-family: 'Times New Roman', serif; box-shadow: inset 0 0 30px rgba(0,0,0,0.4), 0 5px 15px rgba(0,0,0,0.5); min-width: 250px;">
                            <h4 style="color: #4a2c11; margin-top: 0; border-bottom: 1px solid rgba(74, 44, 17, 0.3); padding-bottom: 5px; text-align: right;">L'Avvocato Difensore</h4>
                            <p style="font-size: 1.1rem; line-height: 1.7;">${defText}</p>
                        </div>
                    </div>
                `;
                break;
            case 6: // Fase 6: Dante Oggi (Riflessione contemporanea)
                const reflText = isPaolo ?
                    `Ai miei tempi, la lussuria era una tempesta fisica. Oggi vedo che il vostro mondo è dominato dagli schermi. Quanti tradimenti nascono non da un libro galeotto, ma da un "mi piace", da un messaggio nascosto, da una chat segreta? L'illusione dell'Amore virtuale è forse meno colpevole? Che significato ha oggi la fedeltà?`
                    : "Rifletti su come questo peccato si manifesta oggi. Che forma prende nella società moderna?";
                    
                trialContent.innerHTML = `
                    <h3 class="text-crimson" style="text-align:center;">Fase 6: La Riflessione del Poeta</h3>
                    <div style="display: flex; gap: 20px; align-items: flex-start; margin-top: 20px; flex-wrap: wrap;">
                        <div style="flex: 0 0 150px; display: flex; justify-content: center;">
                            <!-- Immagine di Dante mezzo busto -->
                            <div style="width: 120px; height: 120px; border-radius: 50%; overflow: hidden; border: 3px solid var(--accent-gold); box-shadow: 0 0 15px rgba(212,175,55,0.4);">
                                <img src="public/assets/dante_full.png" style="width: 100%; height: auto; object-fit: cover; object-position: top;">
                            </div>
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                            <p style="font-size: 1.1rem; line-height: 1.6; font-style: italic; color: #ddd; border-left: 2px solid var(--accent-gold); padding-left: 15px;">"${reflText}"</p>
                            <textarea class="form-input" rows="4" placeholder="Scrivi qui i tuoi appunti... (opzionale)" style="margin-top: 15px; font-size: 1rem;"></textarea>
                        </div>
                    </div>
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
