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
        
        // Layer SVG per la linea di connessione (stile Duolingo)
        const svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgLayer.style.position = 'absolute';
        svgLayer.style.top = '0';
        svgLayer.style.left = '0';
        svgLayer.style.width = '100%';
        svgLayer.style.height = '100%';
        svgLayer.style.zIndex = '0';
        svgLayer.style.pointerEvents = 'none';
        container.appendChild(svgLayer);

        // Layer per i nodi HTML
        const nodesLayer = document.createElement('div');
        nodesLayer.style.position = 'relative';
        nodesLayer.style.zIndex = '1';
        nodesLayer.style.display = 'flex';
        nodesLayer.style.flexDirection = 'column';
        nodesLayer.style.alignItems = 'center';
        container.appendChild(nodesLayer);
        
        const renderedNodes = [];

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
            nodesLayer.appendChild(node);
            renderedNodes.push({ node, completed });
        });

        // Disegna il percorso SVG sfalsato una volta renderizzati i nodi
        setTimeout(() => {
            let pathD = "";
            let completedPathD = "";

            const cRect = container.getBoundingClientRect();
            
            for (let i = 0; i < renderedNodes.length - 1; i++) {
                const n1 = renderedNodes[i].node;
                const n2 = renderedNodes[i+1].node;
                
                // Usa offsetTop/offsetLeft relativi al container per non dipendere dallo scroll
                const btn1 = n1.querySelector('.circle-btn');
                const btn2 = n2.querySelector('.circle-btn');
                
                // Coordinate centro del bottone (n1)
                const x1 = n1.offsetLeft + btn1.offsetLeft + (btn1.offsetWidth / 2);
                const y1 = n1.offsetTop + btn1.offsetTop + (btn1.offsetHeight / 2);
                
                // Coordinate centro del bottone (n2)
                const x2 = n2.offsetLeft + btn2.offsetLeft + (btn2.offsetWidth / 2);
                const y2 = n2.offsetTop + btn2.offsetTop + (btn2.offsetHeight / 2);

                if (i === 0) {
                    pathD += `M ${x1} ${y1} `;
                    completedPathD += `M ${x1} ${y1} `;
                }
                
                const yMid = (y1 + y2) / 2;
                const curveStr = `C ${x1} ${yMid}, ${x2} ${yMid}, ${x2} ${y2} `;
                pathD += curveStr;
                
                if (renderedNodes[i].completed && renderedNodes[i+1].completed) {
                    completedPathD += curveStr;
                } else if (renderedNodes[i].completed) {
                    // Traccia fino a metà o fino al prossimo non completato
                    completedPathD += `C ${x1} ${yMid}, ${x2} ${yMid}, ${x2} ${y2} `;
                }
            }
            
            if (pathD) {
                // Sfondo (linea scura/disattivata)
                const bgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                bgPath.setAttribute('d', pathD);
                bgPath.setAttribute('fill', 'none');
                bgPath.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
                bgPath.setAttribute('stroke-width', '12');
                bgPath.setAttribute('stroke-linecap', 'round');
                svgLayer.appendChild(bgPath);
                
                // Primo piano (linea dorata/verde completata)
                if (completedPathD) {
                    const fgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    fgPath.setAttribute('d', completedPathD);
                    fgPath.setAttribute('fill', 'none');
                    fgPath.setAttribute('stroke', '#d4af37'); // oro
                    fgPath.setAttribute('stroke-width', '12');
                    fgPath.setAttribute('stroke-linecap', 'round');
                    svgLayer.appendChild(fgPath);
                }
            }
        }, 50);
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
