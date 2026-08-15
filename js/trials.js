// js/trials.js
// Motore per l'esecuzione dei Processi (Quiz) in "La Corte della Commedia"
import { db, doc, collection, setDoc } from "./firebase-config.js";

export class CommediaTrials {
    constructor(appRef) {
        this.app = appRef; // Riferimento all'istanza principale dell'app
        this.currentTrial = null;
        this.selectedAnswers = {}; // Mappa domanda -> indice risposta selezionata
    }

    startTrial(trialId) {
        const trialData = window.CommediaMockData && window.CommediaMockData.trials[trialId];
        if (!trialData) {
            console.error("Trial data not found:", trialId);
            alert("Il fascicolo del caso non è ancora stato recapitato alla Corte. Riprova più tardi.");
            return;
        }

        this.currentTrial = trialData;
        this.selectedAnswers = {};

        // Popola la UI
        document.getElementById('trial-title').innerText = trialData.title;
        const listContainer = document.getElementById('trial-questions-list');
        listContainer.innerHTML = '';

        // Descrizione iniziale
        const descEl = document.createElement('div');
        descEl.style.marginBottom = '20px';
        descEl.style.padding = '15px';
        descEl.style.background = 'rgba(255,255,255,0.05)';
        descEl.style.borderRadius = '8px';
        descEl.style.borderLeft = '4px solid var(--accent-gold)';
        descEl.innerHTML = `<p style="color: #ccc; font-style: italic; line-height: 1.5; margin: 0;">${trialData.description}</p>`;
        listContainer.appendChild(descEl);

        // Domande
        trialData.questions.forEach((q, index) => {
            const qEl = document.createElement('div');
            qEl.className = 'parchment-panel';
            qEl.style.marginBottom = '20px';
            qEl.style.padding = '15px';
            qEl.style.color = '#333';
            
            let qData = q;
            const qKey = `trial_${trialId}_q_${q.id || index}`;
            if (window.LiveEditor && typeof window.LiveEditor.apply === 'function') {
                qData = window.LiveEditor.apply(qKey, q);
            }
            const editBtn = (window.LiveEditor && typeof window.LiveEditor.renderBtn === 'function')
                ? window.LiveEditor.renderBtn(qKey, { text: qData.text, hint: qData.hint })
                : '';

            let html = `<h4 style="color: var(--accent-crimson); margin-bottom: 15px; font-family: 'Cinzel', serif; display: flex; justify-content: space-between; align-items: center;"><span>Fase ${index + 1}: ${qData.text}</span> ${editBtn}</h4>`;
            html += `<div style="display: flex; flex-direction: column; gap: 10px;">`;
            
            qData.options.forEach((opt, optIndex) => {
                html += `
                <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; padding: 10px; border: 1px solid rgba(0,0,0,0.2); border-radius: 6px; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">
                    <input type="radio" name="q_${q.id}" value="${optIndex}" style="margin-top: 4px;" onchange="window.commediaApp.trialsEngine.selectAnswer('${q.id}', parseInt(this.value))">
                    <span style="font-size: 0.95rem; font-weight: 500;">${opt}</span>
                </label>`;
            });
            html += `</div>`;
            
            // Container per l'indizio
            html += `<div id="hint-container-${q.id}" style="display: none; margin-top: 15px; padding: 12px; background: rgba(212,175,55,0.1); border-left: 3px solid var(--accent-gold); border-radius: 4px;">
                <p style="margin:0; font-size: 0.85rem; font-style: italic; color: #555;"><strong><i class="fa-solid fa-lightbulb"></i> Indizio:</strong> ${qData.hint}</p>
            </div>`;

            qEl.innerHTML = html;
            listContainer.appendChild(qEl);
        });

        // Aggiorna bottone indizio
        document.getElementById('btn-buy-hint').innerHTML = `<i class="fa-solid fa-lightbulb"></i> Rivela Indizio (${trialData.fioriniCostPerHint} <i class="fa-solid fa-coins"></i>)`;

        // Cambia view
        window.showView('view-active-trial');
    }

    selectAnswer(qId, index) {
        this.selectedAnswers[qId] = index;
    }

    async buyHint() {
        if (!this.currentTrial) return;
        
        // Trova la prima domanda senza indizio rivelato
        const qList = this.currentTrial.questions;
        let targetQ = null;
        for (let q of qList) {
            const hintEl = document.getElementById(`hint-container-${q.id}`);
            if (hintEl && hintEl.style.display === 'none') {
                targetQ = q;
                break;
            }
        }

        if (!targetQ) {
            alert("Hai già rivelato tutti gli indizi per questo processo.");
            return;
        }

        const cost = this.currentTrial.fioriniCostPerHint;
        
        if (!this.app.profile || this.app.profile.fiorini < cost) {
            alert(`Non hai abbastanza Fiorini per corrompere i testimoni o consultare l'archivio. Costo: ${cost} Fiorini.`);
            return;
        }

        const confirmMsg = `Vuoi spendere ${cost} Fiorini per rivelare un indizio sulla Fase "${targetQ.text}"?`;
        if (confirm(confirmMsg)) {
            try {
                const newFiorini = this.app.profile.fiorini - cost;
                await window.commediaDb.updateUserProfile(this.app.user.uid, { fiorini: newFiorini });
                this.app.profile.fiorini = newFiorini;
                this.app.updateUI(); // Aggiorna barra XP/Fiorini
                
                // Mostra l'indizio
                document.getElementById(`hint-container-${targetQ.id}`).style.display = 'block';
                
                // Anima il bottone per feedback visivo
                const btn = document.getElementById('btn-buy-hint');
                btn.style.transform = 'scale(1.1)';
                setTimeout(() => btn.style.transform = 'scale(1)', 200);

            } catch (e) {
                console.error("Errore acquisto indizio:", e);
                alert("Errore durante l'acquisto dell'indizio.");
            }
        }
    }

    async submitTrial() {
        if (!this.currentTrial) return;
        
        const qList = this.currentTrial.questions;
        if (Object.keys(this.selectedAnswers).length < qList.length) {
            alert("Devi ascoltare tutte le testimonianze e rispondere a tutte le fasi prima di emettere la sentenza.");
            return;
        }

        // Calcola risposte corrette
        let correctCount = 0;
        qList.forEach(q => {
            if (this.selectedAnswers[q.id] === q.correctIndex) {
                correctCount++;
            }
        });

        const isSuccess = correctCount === qList.length;

        if (isSuccess) {
            alert(`Sentenza Perfetta! Hai analizzato correttamente i fatti e condannato giustamente. Hai guadagnato ${this.currentTrial.xpReward} XP.`);
            
            try {
                // Aggiorna XP
                const newXp = (this.app.profile.xp || 0) + this.currentTrial.xpReward;
                
                // Salva missione come completata
                let completed = this.app.profile.completedTrials || [];
                if (!completed.includes(this.currentTrial.id)) {
                    completed.push(this.currentTrial.id);
                }

                await window.commediaDb.updateUserProfile(this.app.user.uid, { 
                    xp: newXp,
                    completedTrials: completed
                });
                
                this.app.profile.xp = newXp;
                this.app.profile.completedTrials = completed;
                this.app.updateUI();
                
                // Salva su Firestore collection missioni
                try {
                   const newMissionRef = doc(collection(db, 'missions_completed'));
                   await setDoc(newMissionRef, {
                       userId: this.app.user.uid,
                       userEmail: this.app.user.email,
                       trialId: this.currentTrial.id,
                       timestamp: new Date().toISOString()
                   });
                } catch(e) {
                   console.warn("Mission log non registrato:", e);
                }

                // Torna alla mappa o archivio
                window.showView('view-archivio');
                this.app.refreshArchivio();
                
            } catch (e) {
                console.error("Errore salvataggio sentenza:", e);
                alert("Errore di rete, la sentenza non è stata registrata.");
            }
        } else {
            alert(`La tua sentenza è stata rigettata dal Tribunale Supremo! Hai commesso degli errori logici. Controlla gli indizi e riprova.`);
        }
    }

    populateTeacherDossier() {
        const listContainer = document.getElementById('teacher-dossier-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';
        if (!window.CommediaMockData || !window.CommediaMockData.trials) return;

        const trials = window.CommediaMockData.trials;
        Object.keys(trials).forEach(trialId => {
            const trial = trials[trialId];
            
            const card = document.createElement('div');
            card.className = 'parchment-panel';
            card.style.padding = '20px';
            card.style.marginBottom = '15px';
            card.style.border = '1px solid var(--accent-gold)';
            
            card.innerHTML = `
                <h3 style="color: var(--accent-crimson); font-family: 'Cinzel', serif; margin-bottom: 10px;">${trial.title}</h3>
                <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; color: #111; font-size: 0.95rem;">
                    ${trial.dossierHtml || '<p>Nessun materiale aggiuntivo per questo caso.</p>'}
                </div>
            `;
            
            listContainer.appendChild(card);
        });
    }
}
