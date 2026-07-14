import EroiDB from "./db.js";

const INFERNO_CIRCLES = [
    { id: "Limbo", name: "1° Cerchio: Limbo" },
    { id: "Lussuriosi", name: "2° Cerchio: Lussuriosi" },
    { id: "Golosi", name: "3° Cerchio: Golosi" },
    { id: "Avari", name: "4° Cerchio: Avari e Prodighi" },
    { id: "Iracondi", name: "5° Cerchio: Iracondi e Accidiosi" },
    { id: "Eretici", name: "6° Cerchio: Eretici" },
    { id: "Violenti", name: "7° Cerchio: Violenti" },
    { id: "Fraudolenti", name: "8° Cerchio: Fraudolenti (Malebolge)" },
    { id: "Traditori", name: "9° Cerchio: Traditori (Cocito)" }
];

export const MapEngine = {
    allCases: [],
    completedCaseIds: [],

    init: async function() {
        console.log("Inizializzazione MapEngine...");
        // In un db reale, caricheremmo completati da EroiDB.getUserProfile(uid).completedCases
        // Per ora simuliamo array vuoto se non c'è.
        if (EroiDB.cache.userProfile) {
            this.completedCaseIds = EroiDB.cache.userProfile.completedCases || [];
        } else {
            this.completedCaseIds = JSON.parse(localStorage.getItem('completedCases') || '[]');
        }

        this.allCases = await EroiDB.getCasesByCampaign('inferno');
        this.renderInfernoMap();
    },

    markCaseCompleted: function(caseId) {
        if (!this.completedCaseIds.includes(caseId)) {
            this.completedCaseIds.push(caseId);
            // Salva su localStorage o db mock
            localStorage.setItem('completedCases', JSON.stringify(this.completedCaseIds));
            if (EroiDB.cache.userProfile) {
                EroiDB.cache.userProfile.completedCases = this.completedCaseIds;
                // in un app vera updateDoc in firebase
            }
        }
        this.renderInfernoMap();
    },

    isCircleCompleted: function(circleId) {
        // Un cerchio è completato se TUTTI i suoi casi sono in completedCaseIds
        const casesInCircle = this.allCases.filter(c => c.cerchio === circleId);
        if (casesInCircle.length === 0) return true; // Se non ci sono casi, tecnicamente è passato
        
        for (let c of casesInCircle) {
            if (!this.completedCaseIds.includes(c.id)) {
                return false;
            }
        }
        return true;
    },

    isAdmin: function() {
        if (!EroiDB.cache.userProfile) return false;
        const email = EroiDB.cache.userProfile.email ? EroiDB.cache.userProfile.email.toLowerCase() : '';
        return EroiDB.cache.userProfile.role === 'admin' || email === 'prof.memmo@gmail.com';
    },

    isCircleUnlocked: function(circleIndex) {
        if (this.isAdmin()) return true;
        if (circleIndex === 0) return true; // Il Limbo è sempre sbloccato
        
        // Per sbloccare il cerchio N, il cerchio N-1 deve essere completato
        const prevCircle = INFERNO_CIRCLES[circleIndex - 1];
        return this.isCircleCompleted(prevCircle.id);
    },

    renderInfernoMap: function() {
        const container = document.getElementById('map-inferno');
        if (!container) return;
        
        container.innerHTML = '';
        
        let previousCompleted = true; // flag per l'animazione della linea

        INFERNO_CIRCLES.forEach((circle, index) => {
            const unlocked = this.isCircleUnlocked(index);
            const completed = this.isCircleCompleted(circle.id);
            const casesInCircle = this.allCases.filter(c => c.cerchio === circle.id);
            const numCases = casesInCircle.length;

            const node = document.createElement('div');
            node.className = `map-node ${completed ? 'completed' : ''}`;
            
            const btn = document.createElement('div');
            
            if (unlocked) {
                btn.className = `circle-btn ${completed ? 'completed' : 'unlocked'}`;
                btn.onclick = () => {
                    this.openCircleDashboard(circle.id, casesInCircle);
                };
            } else {
                btn.className = 'circle-btn locked';
                btn.onclick = () => {
                    alert('Devi prima completare i fascicoli del cerchio precedente per accedere a questo!');
                };
            }

            let icon = unlocked ? (completed ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-door-open"></i>') : '<i class="fa-solid fa-lock"></i>';
            if (numCases === 0 && unlocked && !completed) {
               icon = '<i class="fa-solid fa-ghost"></i>'; // Nessun caso presente
            }

            btn.innerHTML = `
                <span>${circle.name}</span>
                <span class="icon">${icon}</span>
            `;

            // Testo sotto al bottone per info
            const infoText = document.createElement('div');
            infoText.style.fontSize = '0.8rem';
            infoText.style.color = '#888';
            infoText.style.marginTop = '5px';
            infoText.textContent = numCases > 0 ? `${casesInCircle.filter(c => this.completedCaseIds.includes(c.id)).length} / ${numCases} fascicoli` : 'Nessun fascicolo noto';

            node.appendChild(btn);
            node.appendChild(infoText);
            container.appendChild(node);
        });
    },

    openCircleDashboard: function(circleId, cases) {
        // Nascondi la mappa
        document.getElementById('view-map').classList.remove('active');
        
        // Mostra la dashboard
        const dashboard = document.getElementById('view-dashboard');
        dashboard.classList.add('active');

        const title = dashboard.querySelector('h2');
        title.textContent = `Fascicoli: ${circleId}`;
        
        const list = document.getElementById('student-cases-list');
        list.innerHTML = '';
        
        if (cases.length === 0) {
            list.innerHTML = '<li style="padding: 1rem; text-align: center; color: #888;">Nessun fascicolo trovato in questo cerchio. Torna indietro o avanza (il cerchio conta come completato).</li>';
            return;
        }

        cases.forEach(c => {
            const isCompleted = this.completedCaseIds.includes(c.id);
            const li = document.createElement('li');
            li.style.background = isCompleted ? 'rgba(50, 200, 50, 0.1)' : 'rgba(0, 0, 0, 0.3)';
            li.style.border = isCompleted ? '1px solid #3c3' : '1px solid var(--border-color)';
            li.style.margin = '0.5rem 0';
            li.style.padding = '1rem';
            li.style.borderRadius = 'var(--radius-sm)';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';

            li.innerHTML = `
                <div>
                    <h4 class="text-gold" style="margin-bottom: 5px;">${c.characterName}</h4>
                    <span style="font-size: 0.8rem; color: #888;">${c.canto}</span>
                    ${isCompleted ? '<span style="color: #3c3; font-size: 0.8rem; margin-left: 10px;">(Completato)</span>' : ''}
                </div>
                <button class="btn btn-primary" style="${isCompleted ? 'background: #3c3; color: #fff;' : ''}">
                    ${isCompleted ? 'Rivedi Caso' : 'Apri Fascicolo'}
                </button>
            `;

            li.querySelector('button').addEventListener('click', () => {
                if (window.EroiGame) {
                    window.EroiGame.startTrial(c.id);
                }
            });

            list.appendChild(li);
        });
    }
};

window.MapEngine = MapEngine;
