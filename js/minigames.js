// minigames.js - Motore per i giochi interattivi della Fase 3 (Prove)

export const MinigamesEngine = {
    init: function() {
        console.log("MinigamesEngine initialized");
    },
    
    loadMinigame: function(caseId, containerElement) {
        containerElement.innerHTML = `<p class="text-on-parchment-muted" style="text-align: center;">Caricamento prove per il caso ${caseId}...</p>`;
    }
};

window.MinigamesEngine = MinigamesEngine;
