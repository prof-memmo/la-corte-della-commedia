// minigames.js - Motore per i giochi interattivi della Fase 3 (Prove)

export const MinigamesEngine = {
    init: function() {
        console.log("MinigamesEngine initialized");
    },

    async useFioriniForHint(cost = 2) {
        if (window.commediaApp && window.commediaApp.profile) {
            if (window.commediaApp.profile.fiorini >= cost) {
                const newFiorini = window.commediaApp.profile.fiorini - cost;
                window.commediaApp.profile.fiorini = newFiorini;
                if (window.commediaDb && window.commediaApp.user && window.commediaApp.user.uid) {
                    try {
                        await window.commediaDb.updateUserProfile(window.commediaApp.user.uid, { fiorini: newFiorini });
                    } catch(e) { console.warn("Errore aggiornamento fiorini:", e); }
                }
                if (window.commediaApp.updateUI) window.commediaApp.updateUI();
                if (window.showToast) window.showToast(`Indizio rivelato! (-${cost} Fiorini)`, 'success');
                return true;
            } else {
                if (window.showToast) window.showToast(`Fiorini insufficienti, ma l'indizio viene concesso per supporto didattico!`, 'info');
                return true;
            }
        }
        return true;
    },

    skipMinigame: function(nextBtn, gameName) {
        if (window.showToast) window.showToast(`Indagine '${gameName}' superata con successo!`, 'info');
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.classList.add('glow');
        }
        const area = document.getElementById('active-minigame-area');
        if (area) {
            area.innerHTML = `
                <div style="background: rgba(22,163,74,0.15); border: 1px solid #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin-top: 15px;">
                    <h5 style="color: #16a34a; margin-bottom: 10px;">✅ Prova Acquisita agli Atti</h5>
                    <p style="color: #ddd; font-size: 0.95rem; margin-bottom: 12px;">Hai completato l'indagine. Puoi procedere alla fase successiva del processo.</p>
                    <div style="background: rgba(212,175,55,0.1); border-left: 3px solid var(--accent-gold); padding: 10px 14px; border-radius: 4px; text-align: left; font-size: 0.85rem; color: #f5f5f0; margin-top: 10px;">
                        <strong>💡 Pillola Giuridica Medievale:</strong> Nella Firenze trecentesca, le prove documentali e le testimonianze giurate avevano valore decisivo davanti al Podestà.
                    </div>
                </div>`;
        }
    },
    
    loadMinigame: function(caseData, containerElement) {
        // Mostriamo un menu per scegliere il minigioco da testare
        containerElement.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h4 class="text-gold">Scegli il Metodo di Indagine</h4>
                <div style="display: flex; justify-content: center; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                    <button class="btn btn-secondary" id="btn-mg-hidden">👁️ Occhio dell'Inquisitore <span style="font-size:0.72rem; color:#4ade80; font-weight:700; margin-left:4px;">🟢 Facile</span></button>
                    <button class="btn btn-secondary" id="btn-mg-jigsaw">🧩 Mosaico della Verità <span style="font-size:0.72rem; color:#fde047; font-weight:700; margin-left:4px;">🟡 Intermedio</span></button>
                    <button class="btn btn-secondary" id="btn-mg-sequence">🗝️ Enigma della Serratura <span style="font-size:0.72rem; color:#fde047; font-weight:700; margin-left:4px;">🟡 Intermedio</span></button>
                    <button class="btn btn-secondary" id="btn-mg-crypto">📜 Analisi Criptata <span style="font-size:0.72rem; color:#60a5fa; font-weight:700; margin-left:4px;">🔵 Avanzato</span></button>
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
                
                <div style="padding: 10px; background: rgba(0,0,0,0.8); display: flex; flex-direction: column; gap: 10px; align-items: center;">
                    <ul id="ho-collected" style="list-style-type: none; padding-left: 0; margin: 0; min-height: 25px; color: #a89f91; font-size: 0.9rem; display: flex; gap: 15px; justify-content: center;">
                    </ul>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn btn-secondary" id="ho-hint-btn" style="background: rgba(212,175,55,0.2); border: 1px solid var(--accent-gold); color: var(--accent-gold); font-size: 0.85rem;"><i class="fa-solid fa-lightbulb"></i> Evidenzia Indizio (-2 💰)</button>
                        <button class="btn btn-secondary" id="ho-skip-btn" style="background: rgba(255,255,255,0.05); color: #aaa; font-size: 0.85rem;"><i class="fa-solid fa-forward-step"></i> Passa Indagine (BES)</button>
                    </div>
                </div>
            </div>
        `;

        let found = 0;
        let errors = 3;
        const errorDisplay = document.getElementById('ho-errors');
        const collectedList = document.getElementById('ho-collected');
        const imgContainer = document.getElementById('ho-image-container');
        
        const hitboxes = [];
        for (let i = 1; i <= 3; i++) {
            const hb = document.createElement('div');
            hb.className = 'ho-hitbox';
            hb.dataset.clue = `Indizio ${i}`;
            const top = 10 + Math.random() * 80;
            const left = 10 + Math.random() * 80;
            
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
            hitboxes.push(hb);
        }

        document.getElementById('ho-hint-btn').onclick = async () => {
            await this.useFioriniForHint(2);
            const remaining = hitboxes.filter(h => h.style.display !== 'none');
            if (remaining.length > 0) {
                const target = remaining[0];
                target.style.outline = '4px solid #f5c53c';
                target.style.transform = 'translate(-50%, -50%) scale(1.6)';
            }
        };

        document.getElementById('ho-skip-btn').onclick = () => {
            this.skipMinigame(nextBtn, "Occhio dell'Inquisitore");
        };

        imgContainer.addEventListener('click', (e) => {
            if (e.target.id === 'ho-image-container') {
                errors--;
                errorDisplay.textContent = errors;
                if (errors <= 0) {
                    alert("Indagine fallita! Hai perso la lucidità. Riprova.");
                    this.loadHiddenObject(container, nextBtn, caseData);
                } else {
                    e.target.style.boxShadow = "inset 0 0 50px rgba(255,0,0,0.5)";
                    setTimeout(() => e.target.style.boxShadow = "none", 300);
                }
            }
        });

        hitboxes.forEach(hb => {
            hb.addEventListener('click', (e) => {
                e.stopPropagation();
                if (hb.style.display === 'none') return;
                found++;
                hb.style.display = 'none';
                
                const li = document.createElement('li');
                li.innerHTML = `✅ ${hb.dataset.clue}`;
                collectedList.appendChild(li);
                
                if (found === 3) {
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
                
                <div id="jigsaw-board" style="display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 2px; width: 300px; height: 300px; margin: 0 auto; border: 2px solid #444; background: #222;"></div>
                
                <div style="display: flex; justify-content: center; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                    <button class="btn btn-secondary" id="jigsaw-hint-btn" style="background: rgba(212,175,55,0.2); border: 1px solid var(--accent-gold); color: var(--accent-gold); font-size: 0.85rem;"><i class="fa-solid fa-lightbulb"></i> Piazza 1 Tassello (-2 💰)</button>
                    <button class="btn btn-secondary" id="jigsaw-skip-btn" style="background: rgba(255,255,255,0.05); color: #aaa; font-size: 0.85rem;"><i class="fa-solid fa-forward-step"></i> Passa Indagine (BES)</button>
                </div>
            </div>
        `;

        const board = document.getElementById('jigsaw-board');
        const size = 3; 
        let pieces = [];
        let selectedPiece = null;

        for (let i = 0; i < size * size; i++) pieces.push(i);
        
        do { pieces.sort(() => Math.random() - 0.5); } while(isSolved());

        function isSolved() {
            for (let i = 0; i < pieces.length; i++) if (pieces[i] !== i) return false;
            return true;
        }

        function renderBoard() {
            board.innerHTML = '';
            pieces.forEach((pieceIndex, gridIndex) => {
                const cell = document.createElement('div');
                const row = Math.floor(pieceIndex / size);
                const col = pieceIndex % size;
                
                cell.style.cssText = `width: 100%; height: 100%; background-image: url('${imgSrc}'); background-size: 300px 300px; background-position: -${col * 100}px -${row * 100}px; cursor: pointer; border: ${selectedPiece === gridIndex ? "3px solid var(--accent-gold)" : "1px solid rgba(0,0,0,0.5)"}; box-sizing: border-box;`;

                cell.onclick = () => {
                    if (selectedPiece === null) {
                        selectedPiece = gridIndex;
                        renderBoard();
                    } else {
                        const temp = pieces[selectedPiece];
                        pieces[selectedPiece] = pieces[gridIndex];
                        pieces[gridIndex] = temp;
                        selectedPiece = null;
                        renderBoard();
                        if (isSolved()) {
                            board.childNodes.forEach(c => c.style.border = 'none');
                            if (nextBtn) { nextBtn.disabled = false; nextBtn.classList.add('glow'); }
                            setTimeout(() => alert("Il mosaico è completo!"), 300);
                        }
                    }
                };
                board.appendChild(cell);
            });
        }

        document.getElementById('jigsaw-hint-btn').onclick = async () => {
            await this.useFioriniForHint(2);
            for (let i = 0; i < pieces.length; i++) {
                if (pieces[i] !== i) {
                    const idx = pieces.indexOf(i);
                    [pieces[i], pieces[idx]] = [pieces[idx], pieces[i]];
                    break;
                }
            }
            renderBoard();
            if (isSolved()) {
                if (nextBtn) { nextBtn.disabled = false; nextBtn.classList.add('glow'); }
            }
        };

        document.getElementById('jigsaw-skip-btn').onclick = () => this.skipMinigame(nextBtn, "Mosaico della Verità");
        renderBoard();
    },

    loadSequencePuzzle: function(container, nextBtn) {
        if (nextBtn) nextBtn.disabled = true;
        
        container.innerHTML = `
            <div class="minigame-wrapper animate-fade-in" style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 20px; border: 1px solid var(--accent-gold);">
                <h5 class="text-gold" style="text-align: center; margin-bottom: 10px;">L'Enigma della Serratura</h5>
                <p style="text-align: center; font-size: 0.9rem; margin-bottom: 20px;">Ordina gli elementi chiave: Amore, Libro, Tragedia.</p>
                <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px;">
                    <div class="seq-slot" data-index="0" style="width: 80px; height: 80px; border: 2px dashed #666; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem; cursor: pointer;"></div>
                    <div class="seq-slot" data-index="1" style="width: 80px; height: 80px; border: 2px dashed #666; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem; cursor: pointer;"></div>
                    <div class="seq-slot" data-index="2" style="width: 80px; height: 80px; border: 2px dashed #666; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem; cursor: pointer;"></div>
                </div>
                <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <div id="seq-options" style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                        <button class="btn btn-secondary seq-option" data-val="1">💖</button>
                        <button class="btn btn-secondary seq-option" data-val="2">📖</button>
                        <button class="btn btn-secondary seq-option" data-val="3">⚔️</button>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 15px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                    <button class="btn btn-primary" id="seq-check-btn">Sblocca</button>
                    <button class="btn btn-secondary" id="seq-hint-btn" style="background: rgba(212,175,55,0.2); border: 1px solid var(--accent-gold); color: var(--accent-gold); font-size: 0.85rem;"><i class="fa-solid fa-lightbulb"></i> Aiuto (-2 💰)</button>
                    <button class="btn btn-secondary" id="seq-skip-btn" style="background: rgba(255,255,255,0.05); color: #aaa; font-size: 0.85rem;"><i class="fa-solid fa-forward-step"></i> Passa (BES)</button>
                </div>
                <p id="seq-feedback" style="text-align: center; margin-top: 10px; display: none;"></p>
            </div>
        `;

        let currentSequence = [null, null, null];
        let currentSlot = 0;
        const slots = container.querySelectorAll('.seq-slot');
        
        container.querySelectorAll('.seq-option').forEach(opt => {
            opt.onclick = () => {
                if (currentSlot < 3) {
                    currentSequence[currentSlot] = opt.dataset.val;
                    slots[currentSlot].textContent = opt.textContent;
                    slots[currentSlot].style.borderColor = 'var(--accent-gold)';
                    currentSlot++;
                }
            };
        });
        
        document.getElementById('seq-hint-btn').onclick = async () => {
            await this.useFioriniForHint(2);
            ["1", "2", "3"].forEach((v, i) => {
                currentSequence[i] = v;
                slots[i].textContent = ["💖", "📖", "⚔️"][i];
                slots[i].style.borderColor = 'var(--accent-gold)';
            });
            currentSlot = 3;
        };

        document.getElementById('seq-skip-btn').onclick = () => this.skipMinigame(nextBtn, "Enigma della Serratura");
        
        document.getElementById('seq-check-btn').onclick = () => {
            if (currentSequence[0] === "1" && currentSequence[1] === "2" && currentSequence[2] === "3") {
                if (nextBtn) { nextBtn.disabled = false; nextBtn.classList.add('glow'); }
                alert("Serratura Sbloccata!");
            } else alert("Sequenza errata.");
        };
    },

    loadCryptoText: function(container, nextBtn) {
        if (nextBtn) nextBtn.disabled = true;
        
        container.innerHTML = `
            <div class="minigame-wrapper animate-fade-in" style="background: rgba(0,0,0,0.4); padding: 20px; border: 1px solid var(--accent-gold); border-radius: 8px;">
                <h5 class="text-gold" style="text-align: center; margin-bottom: 10px;">Analisi Criptata</h5>
                <p style="text-align: center; font-size: 0.9rem; margin-bottom: 15px; color: #ccc;">Decifra la parola chiave che condannò i due amanti (Anagramma: OBRLI).</p>
                <div style="text-align: center; margin: 15px 0;">
                    <span id="crypto-word" style="background: rgba(0,0,0,0.8); padding: 10px 20px; color: var(--accent-gold); font-size: 1.5rem; letter-spacing: 5px; border-radius: 4px; font-weight: bold;">_ _ _ _ _</span>
                </div>
                <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="crypto-input" class="form-input" placeholder="Scrivi la parola..." style="width: 200px; text-transform: uppercase; text-align: center; font-weight: bold;">
                    <button class="btn btn-primary" id="crypto-check-btn">Decodifica</button>
                    <button class="btn btn-secondary" id="crypto-hint-btn" style="background: rgba(212,175,55,0.2); border: 1px solid var(--accent-gold); color: var(--accent-gold);"><i class="fa-solid fa-lightbulb"></i> Aiuto (-2 <i class="fa-solid fa-coins"></i>)</button>
                    <button class="btn btn-secondary" id="crypto-skip-btn" style="background: rgba(255,255,255,0.05); color: #aaa;"><i class="fa-solid fa-forward-step"></i> Passa (BES)</button>
                </div>
                <p id="crypto-feedback" style="text-align: center; margin-top: 10px; display: none; font-size: 0.95rem;"></p>
            </div>
        `;

        const input = document.getElementById('crypto-input');
        const checkBtn = document.getElementById('crypto-check-btn');
        const feedback = document.getElementById('crypto-feedback');
        const wordDisplay = document.getElementById('crypto-word');

        document.getElementById('crypto-hint-btn').onclick = async () => {
            await this.useFioriniForHint(2);
            input.value = "LIB";
            if (window.showToast) window.showToast('Iniziali suggerite: LIB...', 'info');
        };

        document.getElementById('crypto-skip-btn').onclick = () => {
            this.skipMinigame(nextBtn, "Analisi Criptata");
        };

        checkBtn.onclick = () => {
            const guess = input.value.trim().toUpperCase();
            if (guess === "LIBRO") {
                wordDisplay.textContent = "L I B R O";
                wordDisplay.style.color = "#16a34a";
                feedback.textContent = "Testimonianza decodificata con successo!";
                feedback.style.color = "#16a34a";
                feedback.style.display = "block";
                input.disabled = true;
                checkBtn.disabled = true;
                if (nextBtn) {
                    nextBtn.disabled = false;
                    nextBtn.classList.add('glow');
                }
            } else {
                feedback.textContent = "Decodifica errata, riprova.";
                feedback.style.color = "#ef4444";
                feedback.style.display = "block";
            }
        };

        input.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                checkBtn.click();
            }
        });
    },

    loadCrossExamination: function(container, nextBtn, caseData) {
        if (nextBtn) nextBtn.disabled = true;
        
        if (!caseData || !caseData.phases || !caseData.phases.crossExamination) {
            container.innerHTML = `<p class="text-crimson">Errore: Dati dell'esame incrociato non trovati.</p>`;
            if (nextBtn) nextBtn.disabled = false;
            return;
        }

        const questions = caseData.phases.crossExamination;
        let currentQuestionIndex = 0;

        const renderQuestion = () => {
            if (currentQuestionIndex >= questions.length) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 30px; background: rgba(0,255,0,0.1); border-radius: 10px; border: 1px solid var(--accent-gold);">
                        <h4 style="color: var(--accent-gold); font-size: 1.5rem;">Esame Incrociato Superato!</h4>
                        <p style="font-size: 1.1rem;">Hai dimostrato di possedere la logica necessaria per giudicare questo caso.</p>
                        <p style="font-size: 2rem; margin-top: 10px;">⚖️</p>
                    </div>
                `;
                if (nextBtn) {
                    nextBtn.disabled = false;
                    nextBtn.classList.add('glow');
                }
                return;
            }

            const q = questions[currentQuestionIndex];
            
            let optionsHtml = '';
            q.options.forEach((opt, idx) => {
                optionsHtml += `<button class="btn ce-option-btn" style="display: block; width: 100%; text-align: left; margin-bottom: 10px; white-space: normal; height: auto;" data-idx="${idx}">${opt}</button>`;
            });

            container.innerHTML = `
                <div class="animate-fade-in" style="background: rgba(0,0,0,0.6); border-radius: 8px; border: 1px solid #555; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; color: var(--accent-gold); font-weight: bold;">
                        <span>Esame Incrociato</span>
                        <span>Domanda ${currentQuestionIndex + 1} di ${questions.length}</span>
                    </div>
                    <h5 style="font-size: 1.2rem; margin-bottom: 20px; line-height: 1.5; color: #fff;">${q.question}</h5>
                    <div id="ce-options-container">
                        ${optionsHtml}
                    </div>
                    <div id="ce-feedback" style="margin-top: 20px; padding: 15px; border-radius: 5px; display: none; font-size: 1.1rem; line-height: 1.5;"></div>
                </div>
            `;

            const optionBtns = container.querySelectorAll('.ce-option-btn');
            const feedbackDiv = document.getElementById('ce-feedback');

            optionBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // Disable all buttons
                    optionBtns.forEach(b => b.disabled = true);
                    
                    const selectedIdx = parseInt(e.target.dataset.idx);
                    if (selectedIdx === q.correctIndex) {
                        e.target.style.background = 'rgba(0, 150, 0, 0.5)';
                        e.target.style.borderColor = '#0f0';
                        feedbackDiv.style.display = 'block';
                        feedbackDiv.style.background = 'rgba(0, 150, 0, 0.2)';
                        feedbackDiv.style.borderLeft = '4px solid #0f0';
                        feedbackDiv.innerHTML = `<strong>Corretto!</strong> ${q.explanation}`;
                        if (window.AudioEngine) window.AudioEngine.playSuccess();
                        
                        setTimeout(() => {
                            currentQuestionIndex++;
                            renderQuestion();
                        }, 4000);
                    } else {
                        e.target.style.background = 'rgba(150, 0, 0, 0.5)';
                        e.target.style.borderColor = '#f00';
                        feedbackDiv.style.display = 'block';
                        feedbackDiv.style.background = 'rgba(150, 0, 0, 0.2)';
                        feedbackDiv.style.borderLeft = '4px solid #f00';
                        feedbackDiv.innerHTML = `<strong>Sbagliato.</strong> L'analisi logica è fallita. Ricarico l'esame...`;
                        if (window.AudioEngine) window.AudioEngine.playError();
                        
                        setTimeout(() => {
                            // Penalità: ricarica dall'inizio per essere cattivi o della stessa domanda. Il piano diceva "non permette di proseguire a meno di non ritentare ragionando meglio". Facciamolo ripartire dall'inizio.
                            currentQuestionIndex = 0;
                            renderQuestion();
                        }, 3000);
                    }
                });
            });
        };

        renderQuestion();
    },

    loadSealPuzzle: function(container, nextBtn, caseData) {
        if (nextBtn) nextBtn.disabled = true;
        
        if (!caseData || !caseData.phases || !caseData.phases.sealPuzzle) {
            container.innerHTML = `<p class="text-crimson">Errore: Dati del sigillo non trovati.</p>`;
            if (nextBtn) nextBtn.disabled = false;
            return;
        }

        const sealData = caseData.phases.sealPuzzle;
        
        container.innerHTML = `
            <div class="animate-fade-in" style="background: url('assets/Immagini/parchment_bg.png') center/cover; border-radius: 10px; padding: 30px; box-shadow: inset 0 0 40px rgba(0,0,0,0.8); color: #222; font-family: 'Times New Roman', serif;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="assets/Immagini/3.png" style="width: 80px; opacity: 0.8;">
                    <h3 style="color: #6a040f; margin-top: 10px; font-family: 'Julius Sans One', sans-serif;">Il Sigillo della Sentenza</h3>
                    <p style="font-style: italic; font-size: 1.1rem; color: #444;">Per archiviare la tua decisione e apporre il sigillo di ceralacca, devi dimostrare di aver colto l'essenza del caso.</p>
                </div>
                
                <div style="background: rgba(255,255,255,0.4); padding: 20px; border-radius: 5px; border: 1px dashed #6a040f; margin-bottom: 20px;">
                    <p style="font-size: 1.25rem; font-weight: bold; text-align: center; margin: 0; color: #333;">${sealData.riddle}</p>
                </div>

                <div style="text-align: center;">
                    <input type="text" id="seal-input" class="form-input" placeholder="Digita la parola chiave..." style="font-size: 1.5rem; text-align: center; text-transform: uppercase; width: 80%; max-width: 300px; margin-bottom: 15px; border: 2px solid #6a040f; background: rgba(255,255,255,0.8); color: #000;">
                    <br>
                    <button id="seal-check-btn" class="btn" style="background-color: #6a040f; color: #fff;">Apponi il Sigillo</button>
                    <p id="seal-feedback" style="margin-top: 15px; font-weight: bold; display: none;"></p>
                </div>
            </div>
        `;

        const input = document.getElementById('seal-input');
        const checkBtn = document.getElementById('seal-check-btn');
        const feedback = document.getElementById('seal-feedback');

        checkBtn.onclick = () => {
            const userVal = input.value.trim().toUpperCase();
            if (userVal === sealData.answer.toUpperCase()) {
                feedback.textContent = "Sigillo apposto correttamente!";
                feedback.style.color = "#006600";
                feedback.style.display = "block";
                if (window.AudioEngine) window.AudioEngine.playSuccess();
                input.disabled = true;
                checkBtn.disabled = true;
                
                if (nextBtn) {
                    nextBtn.disabled = false;
                    nextBtn.classList.add('glow');
                }
            } else {
                feedback.textContent = "La parola è errata. Il sigillo non prende forma.";
                feedback.style.color = "#6a040f";
                feedback.style.display = "block";
                if (window.AudioEngine) window.AudioEngine.playError();
                
                // Shake effect
                input.style.animation = 'none';
                input.offsetHeight; // trigger reflow
                input.style.animation = 'shake 0.5s';
                
                setTimeout(() => { feedback.style.display = 'none'; }, 3000);
            }
        };

        input.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                checkBtn.click();
            }
        });
    }
};

window.MinigamesEngine = MinigamesEngine;
