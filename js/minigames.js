// minigames.js - Motore per i giochi interattivi della Fase 3 (Prove)

export const MinigamesEngine = {
    init: function() {
        console.log("MinigamesEngine initialized");
    },
    
    loadMinigame: function(caseData, containerElement) {
        // Mostriamo un menu per scegliere il minigioco da testare
        containerElement.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h4 class="text-gold">Scegli il Metodo di Indagine</h4>
                <div style="display: flex; justify-content: center; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                    <button class="btn btn-secondary" id="btn-mg-hidden">👁️ Occhio dell'Inquisitore</button>
                    <button class="btn btn-secondary" id="btn-mg-jigsaw">🧩 Mosaico della Verità</button>
                    <button class="btn btn-secondary" id="btn-mg-sequence">🗝️ Enigma della Serratura</button>
                    <button class="btn btn-secondary" id="btn-mg-crypto">📜 Analisi Criptata</button>
                </div>
            </div>
            <div id="active-minigame-area" style="min-height: 250px;">
                <p style="text-align: center; color: #666; font-style: italic;">Seleziona un'indagine per iniziare la Fase 3.</p>
            </div>
        `;

        // Blocchiamo il bottone "Procedi"
        const trialNextBtn = document.getElementById('trial-next-btn');
        if (trialNextBtn) trialNextBtn.disabled = true;

        document.getElementById('btn-mg-hidden').onclick = () => this.loadHiddenObject(document.getElementById('active-minigame-area'), trialNextBtn, caseData);
        document.getElementById('btn-mg-jigsaw').onclick = () => this.loadJigsawPuzzle(document.getElementById('active-minigame-area'), trialNextBtn, caseData);
        document.getElementById('btn-mg-sequence').onclick = () => this.loadSequencePuzzle(document.getElementById('active-minigame-area'), trialNextBtn);
        document.getElementById('btn-mg-crypto').onclick = () => this.loadCryptoText(document.getElementById('active-minigame-area'), trialNextBtn);
    },

    loadHiddenObject: function(container, nextBtn, caseData) {
        if (nextBtn) nextBtn.disabled = true;
        
        const imgSrc = caseData && caseData.image ? caseData.image : 'assets/Immagini/12.png';
        
        container.innerHTML = `
            <div class="minigame-wrapper animate-fade-in" style="background: rgba(0,0,0,0.6); border-radius: 8px; border: 1px solid var(--accent-gold); overflow: hidden; position: relative;">
                <div style="padding: 10px; background: rgba(0,0,0,0.8); text-align: center;">
                    <h5 class="text-gold" style="margin:0;">L'Occhio dell'Inquisitore</h5>
                    <p style="margin:5px 0 0 0; font-size: 0.8rem; color: #ccc;">Esamina il quadro. Trova i 3 indizi nascosti (scintille) cliccando nei punti giusti. Errori rimanenti: <span id="ho-errors" class="text-crimson">3</span></p>
                </div>
                
                <div id="ho-image-container" style="position: relative; width: 100%; aspect-ratio: 1/1; background: url('${imgSrc}') center/contain no-repeat; cursor: crosshair;">
                    <!-- Hitbox generate dinamicamente -->
                </div>
                
                <div style="padding: 10px; background: rgba(0,0,0,0.8);">
                    <ul id="ho-collected" style="list-style-type: none; padding-left: 0; margin: 0; min-height: 25px; color: #a89f91; font-size: 0.9rem; display: flex; gap: 15px; justify-content: center;">
                    </ul>
                </div>
            </div>
        `;

        let found = 0;
        let errors = 3;
        const errorDisplay = document.getElementById('ho-errors');
        const collectedList = document.getElementById('ho-collected');
        const imgContainer = document.getElementById('ho-image-container');
        
        // Genera 3 hitbox casuali
        for (let i = 1; i <= 3; i++) {
            const hb = document.createElement('div');
            hb.className = 'ho-hitbox';
            hb.dataset.clue = `Indizio ${i}`;
            // Posizioni casuali ma non troppo vicine ai bordi
            const top = 10 + Math.random() * 80;
            const left = 10 + Math.random() * 80;
            
            // Effetto scintilla/glitch leggero per renderli visibili se si presta attenzione
            hb.style.cssText = `
                position: absolute; 
                left: ${left}%; top: ${top}%; 
                width: 30px; height: 30px; 
                transform: translate(-50%, -50%);
                cursor: pointer;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(212,175,55,0.4) 40%, transparent 70%);
                animation: pulse 2s infinite alternate;
            `;
            imgContainer.appendChild(hb);
        }

        // Gestione Click Sbagliati (sull'immagine intera)
        imgContainer.addEventListener('click', (e) => {
            if (e.target.id === 'ho-image-container') {
                errors--;
                errorDisplay.textContent = errors;
                if (errors <= 0) {
                    alert("Indagine fallita! Hai perso la lucidità. Riprova.");
                    this.loadHiddenObject(container, nextBtn, caseData);
                } else {
                    // Feedback visivo di errore (flash rosso)
                    e.target.style.boxShadow = "inset 0 0 50px rgba(255,0,0,0.5)";
                    setTimeout(() => e.target.style.boxShadow = "none", 300);
                }
            }
        });

        // Gestione Click Corretti (sulle hitbox)
        const hitboxes = container.querySelectorAll('.ho-hitbox');
        hitboxes.forEach(hb => {
            hb.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita di contare come errore
                if (hb.dataset.found === "true") return;
                
                hb.dataset.found = "true";
                found++;
                
                // Evidenzia visivamente l'area e ferma l'animazione
                hb.style.animation = 'none';
                hb.style.border = "2px solid var(--accent-gold)";
                hb.style.backgroundColor = "rgba(212,175,55,0.8)";
                
                const li = document.createElement('li');
                li.innerHTML = `✅ ${hb.dataset.clue}`;
                li.style.animation = 'fadeIn 0.3s ease forwards';
                collectedList.appendChild(li);
                
                if (found === hitboxes.length) {
                    if (nextBtn) {
                        nextBtn.disabled = false;
                        nextBtn.classList.add('glow');
                    }
                    setTimeout(() => alert("Ottimo lavoro, Inquisitore. Tutte le prove raccolte!"), 300);
                }
            });
        });
    },

    loadJigsawPuzzle: function(container, nextBtn, caseData) {
        if (nextBtn) nextBtn.disabled = true;
        
        const imgSrc = caseData && caseData.image ? caseData.image : 'assets/Immagini/12.png';
        
        container.innerHTML = `
            <div class="minigame-wrapper animate-fade-in" style="background: rgba(0,0,0,0.6); border-radius: 8px; border: 1px solid var(--accent-gold); overflow: hidden; padding: 15px;">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h5 class="text-gold" style="margin:0;">Mosaico della Verità</h5>
                    <p style="margin:5px 0 0 0; font-size: 0.8rem; color: #ccc;">Ricostruisci il dipinto. Clicca su due tessere per scambiarle di posizione.</p>
                </div>
                
                <div id="jigsaw-board" style="
                    display: grid; 
                    grid-template-columns: repeat(3, 1fr); 
                    grid-template-rows: repeat(3, 1fr); 
                    gap: 2px; 
                    width: 300px; 
                    height: 300px; 
                    margin: 0 auto; 
                    border: 2px solid #444; 
                    background: #222;
                "></div>
            </div>
        `;

        const board = document.getElementById('jigsaw-board');
        const size = 3; // 3x3 grid
        let pieces = [];
        let selectedPiece = null;

        // Inizializza i pezzi (0 a 8)
        for (let i = 0; i < size * size; i++) {
            pieces.push(i);
        }
        
        // Mescola l'array garantendo che non sia già risolto
        do {
            pieces.sort(() => Math.random() - 0.5);
        } while(isSolved());

        function isSolved() {
            for (let i = 0; i < pieces.length; i++) {
                if (pieces[i] !== i) return false;
            }
            return true;
        }

        function renderBoard() {
            board.innerHTML = '';
            pieces.forEach((pieceIndex, gridIndex) => {
                const cell = document.createElement('div');
                const row = Math.floor(pieceIndex / size);
                const col = pieceIndex % size;
                
                cell.style.cssText = `
                    width: 100%; height: 100%; 
                    background-image: url('${imgSrc}');
                    background-size: 300px 300px;
                    background-position: -${col * 100}px -${row * 100}px;
                    cursor: pointer;
                    transition: transform 0.2s, border 0.2s;
                    box-sizing: border-box;
                `;
                
                if (selectedPiece === gridIndex) {
                    cell.style.border = "3px solid var(--accent-gold)";
                    cell.style.transform = "scale(0.95)";
                } else {
                    cell.style.border = "1px solid rgba(0,0,0,0.5)";
                }

                cell.onclick = () => {
                    if (selectedPiece === null) {
                        selectedPiece = gridIndex;
                        renderBoard();
                    } else {
                        // Swap
                        const temp = pieces[selectedPiece];
                        pieces[selectedPiece] = pieces[gridIndex];
                        pieces[gridIndex] = temp;
                        selectedPiece = null;
                        renderBoard();
                        
                        if (isSolved()) {
                            // Rimuovi i bordi
                            board.childNodes.forEach(c => c.style.border = 'none');
                            if (nextBtn) {
                                nextBtn.disabled = false;
                                nextBtn.classList.add('glow');
                            }
                            setTimeout(() => alert("Il mosaico è completo. La verità è svelata!"), 300);
                        }
                    }
                };
                
                board.appendChild(cell);
            });
        }

        // Aspettiamo che l'immagine sia caricata prima di renderizzare se necessario, 
        // ma in questo caso possiamo renderizzare subito
        renderBoard();
    },

    loadSequencePuzzle: function(container, nextBtn) {
        if (nextBtn) nextBtn.disabled = true;
        
        container.innerHTML = `
            <div class="minigame-wrapper animate-fade-in" style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 20px; border: 1px solid var(--accent-gold);">
                <h5 class="text-gold" style="text-align: center; margin-bottom: 10px;">L'Enigma della Serratura</h5>
                <p style="text-align: center; font-size: 0.9rem; margin-bottom: 20px;">
                    Per sbloccare il diario dell'imputato, ordina gli elementi chiave della sua storia. (La soluzione corretta per Paolo e Francesca è: Amore, Libro, Tragedia).
                </p>
                
                <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px;">
                    <!-- Slot della soluzione -->
                    <div class="seq-slot" data-index="0" style="width: 80px; height: 80px; border: 2px dashed #666; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem; cursor: pointer; transition: 0.2s;"></div>
                    <div class="seq-slot" data-index="1" style="width: 80px; height: 80px; border: 2px dashed #666; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem; cursor: pointer; transition: 0.2s;"></div>
                    <div class="seq-slot" data-index="2" style="width: 80px; height: 80px; border: 2px dashed #666; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem; cursor: pointer; transition: 0.2s;"></div>
                </div>
                
                <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <p style="margin-bottom: 10px; font-size: 0.8rem; color: #aaa;">Simboli disponibili (Clicca per inserirli):</p>
                    <div id="seq-options" style="display: flex; justify-content: center; gap: 10px;">
                        <button class="btn btn-secondary seq-option" data-val="1">💖 (Amore)</button>
                        <button class="btn btn-secondary seq-option" data-val="2">📖 (Libro)</button>
                        <button class="btn btn-secondary seq-option" data-val="3">⚔️ (Tragedia)</button>
                        <button class="btn btn-secondary seq-option" data-val="4">⛰️ (Montagna)</button>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 15px;">
                    <button class="btn btn-primary" id="seq-check-btn">Sblocca Serratura</button>
                    <p id="seq-feedback" style="margin-top: 10px; font-size: 0.9rem; display: none;"></p>
                </div>
            </div>
        `;

        let currentSequence = [null, null, null];
        let currentSlot = 0;
        
        const slots = container.querySelectorAll('.seq-slot');
        const options = container.querySelectorAll('.seq-option');
        const checkBtn = document.getElementById('seq-check-btn');
        const feedback = document.getElementById('seq-feedback');
        
        options.forEach(opt => {
            opt.onclick = () => {
                if (currentSlot < 3) {
                    currentSequence[currentSlot] = opt.dataset.val;
                    slots[currentSlot].textContent = opt.textContent.split(' ')[0]; // Prende solo l'emoji
                    slots[currentSlot].style.borderColor = 'var(--accent-gold)';
                    currentSlot++;
                }
            };
        });
        
        slots.forEach(slot => {
            slot.onclick = () => {
                // Reset manuale
                currentSequence = [null, null, null];
                currentSlot = 0;
                slots.forEach(s => { s.textContent = ''; s.style.borderColor = '#666'; });
                feedback.style.display = 'none';
            };
        });
        
        checkBtn.onclick = () => {
            if (currentSlot < 3) {
                feedback.textContent = "Riempi tutti gli spazi prima di sbloccare.";
                feedback.style.color = "var(--text-secondary)";
                feedback.style.display = "block";
                return;
            }
            
            // Soluzione corretta: 1 (Amore), 2 (Libro), 3 (Tragedia)
            if (currentSequence[0] === "1" && currentSequence[1] === "2" && currentSequence[2] === "3") {
                feedback.textContent = "Serratura Sbloccata! Prove acquisite.";
                feedback.style.color = "#4CAF50";
                feedback.style.display = "block";
                checkBtn.disabled = true;
                if (nextBtn) {
                    nextBtn.disabled = false;
                    nextBtn.classList.add('glow');
                }
            } else {
                feedback.textContent = "Sequenza errata. La serratura è bloccata. (Clicca sui quadrati per resettare)";
                feedback.style.color = "var(--danger-color)";
                feedback.style.display = "block";
            }
        };
    },

    loadCryptoText: function(container, nextBtn) {
        if (nextBtn) nextBtn.disabled = true;
        
        container.innerHTML = `
            <div class="minigame-wrapper animate-fade-in" style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 20px; border: 1px solid var(--accent-gold);">
                <h5 class="text-gold" style="text-align: center; margin-bottom: 10px;">Analisi Criptata</h5>
                <p style="text-align: center; font-size: 0.9rem; margin-bottom: 20px;">
                    La testimonianza è parzialmente censurata. Usa il decodificatore per ricostruire la parola mancante.<br>
                    <strong>Indizio:</strong> "Cosa condannò i due amanti?" (Anagramma: OBRLI)
                </p>
                
                <div style="background: url('assets/Immagini/parchment_bg.png') center; padding: 25px; border-radius: 5px; color: #333; font-family: 'Times New Roman', serif; font-size: 1.2rem; text-align: center; line-height: 1.6; margin-bottom: 20px; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
                    "E non ci fu alcun dubbio, la colpa fu tutta di quel maledetto <br>
                    <span id="crypto-word" style="display: inline-block; padding: 5px 15px; margin-top: 10px; background: rgba(0,0,0,0.8); color: var(--accent-gold); letter-spacing: 5px; font-weight: bold; border-radius: 4px;">_ _ _ _ _</span>"
                </div>
                
                <div style="display: flex; justify-content: center; gap: 10px;">
                    <input type="text" id="crypto-input" class="form-input" placeholder="Scrivi la parola..." style="width: 200px; text-transform: uppercase; text-align: center; font-weight: bold; letter-spacing: 2px;">
                    <button class="btn btn-primary" id="crypto-check-btn">Decodifica</button>
                </div>
                <p id="crypto-feedback" style="text-align: center; margin-top: 10px; display: none;"></p>
            </div>
        `;

        const input = document.getElementById('crypto-input');
        const checkBtn = document.getElementById('crypto-check-btn');
        const feedback = document.getElementById('crypto-feedback');
        const wordDisplay = document.getElementById('crypto-word');
        
        checkBtn.onclick = () => {
            const guess = input.value.trim().toUpperCase();
            if (guess === "LIBRO") {
                wordDisplay.textContent = "L I B R O";
                wordDisplay.style.background = "none";
                wordDisplay.style.color = "#8b0000"; // Rosso sangue
                
                feedback.textContent = "Testimonianza decodificata con successo!";
                feedback.style.color = "#4CAF50";
                feedback.style.display = "block";
                
                input.disabled = true;
                checkBtn.disabled = true;
                
                if (nextBtn) {
                    nextBtn.disabled = false;
                    nextBtn.classList.add('glow');
                }
            } else {
                feedback.textContent = "Decodifica errata, riprova.";
                feedback.style.color = "var(--danger-color)";
                feedback.style.display = "block";
                input.value = "";
            }
        };
        
        // Permetti Invio da tastiera
        input.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                checkBtn.click();
            }
        });
    }
};

window.MinigamesEngine = MinigamesEngine;
