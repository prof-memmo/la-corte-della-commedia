// minigames.js - Motore per i giochi interattivi della Fase 3 (Prove)

export const MinigamesEngine = {
    init: function() {
        console.log("MinigamesEngine initialized");
    },
    
    loadMinigame: function(caseId, containerElement) {
        // Esempio base: "Ricerca degli Indizi" testuale
        
        containerElement.innerHTML = `
            <div class="minigame-wrapper" style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 20px; border: 1px solid var(--border-color);">
                <h4 class="text-gold" style="text-align: center; margin-bottom: 15px;">🔍 Ispezione del Luogo (Cerchio dei Lussuriosi)</h4>
                <p style="text-align: center; font-size: 0.9rem; margin-bottom: 20px;">
                    Clicca sugli indizi nascosti nel testo per raccoglierli. Devi trovare almeno 2 prove per procedere.
                </p>
                
                <div class="evidence-scene" style="line-height: 1.8; font-size: 1.1rem; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    La bufera infernal, che mai non resta, mena li spirti con la sua rapina. 
                    Tra le anime trascinate dal vento, noti un <span class="clue" data-clue="Libro galeotto" style="color: #666; cursor: pointer; border-bottom: 1px dashed #666; transition: all 0.3s;">libro consumato</span> che cade a terra. 
                    Più in là, le due anime volano leggere, unite per l'eternità da un <span class="clue" data-clue="Amore tragico e adultero" style="color: #666; cursor: pointer; border-bottom: 1px dashed #666; transition: all 0.3s;">legame indissolubile</span>.
                    Nessun pentimento appare sui loro volti, solo il ricordo del <span class="clue" data-clue="Bacio proibito" style="color: #666; cursor: pointer; border-bottom: 1px dashed #666; transition: all 0.3s;">primo bacio</span> fatale.
                </div>
                
                <div style="margin-top: 25px; border-top: 1px solid rgba(212,175,55,0.2); padding-top: 15px;">
                    <h5 class="text-gold">Prove Raccolte: <span id="clue-counter">0</span>/3</h5>
                    <ul id="collected-clues" style="list-style-type: none; padding-left: 0; min-height: 50px; color: #a89f91;">
                        <li style="font-style: italic; color: #555;">Nessuna prova trovata...</li>
                    </ul>
                </div>
            </div>
        `;
        
        let collectedCount = 0;
        const maxClues = 3;
        const clueCounter = document.getElementById('clue-counter');
        const collectedList = document.getElementById('collected-clues');
        const clues = containerElement.querySelectorAll('.clue');
        
        // Blocchiamo il bottone "Procedi" finché non trova le prove
        const trialNextBtn = document.getElementById('trial-next-btn');
        if (trialNextBtn) trialNextBtn.disabled = true;
        
        clues.forEach(clueEl => {
            clueEl.addEventListener('click', function() {
                if (this.classList.contains('found')) return;
                
                this.classList.add('found');
                this.style.color = 'var(--accent-gold)';
                this.style.fontWeight = 'bold';
                this.style.borderBottom = 'none';
                this.style.textShadow = '0 0 8px rgba(212,175,55,0.5)';
                
                if (collectedCount === 0) {
                    collectedList.innerHTML = ''; // Rimuovi il testo segnaposto
                }
                
                collectedCount++;
                clueCounter.textContent = collectedCount;
                
                const li = document.createElement('li');
                li.innerHTML = `📜 <strong>${this.dataset.clue}</strong> (Prova acquisita al fascicolo)`;
                li.style.animation = 'fadeIn 0.5s ease forwards';
                li.style.marginBottom = '5px';
                collectedList.appendChild(li);
                
                // Sblocca il pulsante procedi se ha almeno 2 prove
                if (collectedCount >= 2 && trialNextBtn) {
                    trialNextBtn.disabled = false;
                    trialNextBtn.classList.add('glow'); // Effetto opzionale
                }
            });
        });
    }
};

window.MinigamesEngine = MinigamesEngine;
