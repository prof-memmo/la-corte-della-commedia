import EroiDB from "./db.js";

const INFERNO_CIRCLES = [
    { id: "Antinferno", name: "Antinferno: Ignavi" },
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

const PURGATORIO_TERRACES = [
    { id: "Antipurgatorio", name: "Antipurgatorio" },
    { id: "Superbi", name: "1ª Cornice: Superbi" },
    { id: "Invidiosi", name: "2ª Cornice: Invidiosi" },
    { id: "Iracondi_Purg", name: "3ª Cornice: Iracondi" },
    { id: "Accidiosi", name: "4ª Cornice: Accidiosi" },
    { id: "Avari_Purg", name: "5ª Cornice: Avari e Prodighi" },
    { id: "Golosi_Purg", name: "6ª Cornice: Golosi" },
    { id: "Lussuriosi_Purg", name: "7ª Cornice: Lussuriosi" },
    { id: "ParadisoTerrestre", name: "Paradiso Terrestre" }
];

const PARADISO_HEAVENS = [
    { id: "Luna", name: "1° Cielo: Luna (Spiriti Inadempienti)" },
    { id: "Mercurio", name: "2° Cielo: Mercurio (Spiriti Attivi)" },
    { id: "Venere", name: "3° Cielo: Venere (Spiriti Amanti)" },
    { id: "Sole", name: "4° Cielo: Sole (Spiriti Sapienti)" },
    { id: "Marte", name: "5° Cielo: Marte (Spiriti Combattenti)" },
    { id: "Giove", name: "6° Cielo: Giove (Spiriti Giusti)" },
    { id: "Saturno", name: "7° Cielo: Saturno (Spiriti Contemplativi)" },
    { id: "StelleFisse", name: "8° Cielo: Stelle Fisse" },
    { id: "PrimoMobile", name: "9° Cielo: Primo Mobile" },
    { id: "Empireo", name: "10° Cielo: Empireo" }
];


export const MapEngine = {
    allCases: [],
    completedCaseIds: [],

    lockedNodes: [],
    unlockMode: 'auto',
        currentCampaign: 'inferno',
    init: async function() {
        console.log("Inizializzazione MapEngine...");
        if (EroiDB.cache.userProfile) {
            this.completedCaseIds = EroiDB.cache.userProfile.completedCases || [];
            
            const classId = EroiDB.cache.userProfile.classId;
            if (classId && !this.isAdmin()) {
                const classObj = await EroiDB.getClassByCode(EroiDB.cache.userProfile.classCode || classId) || await EroiDB.getClassById(classId);
                if (classObj) {
                    this.lockedNodes = classObj.lockedNodes || [];
                    this.unlockMode = classObj.unlockMode || 'auto';
                }
            }
        } else {
            this.completedCaseIds = JSON.parse(localStorage.getItem('completedCases') || '[]');
        }

        // Carichiamo TUTTI i casi per calcolare i progressi
        this.allCases = await EroiDB.getCasesByCampaign('all'); 
        
        this.renderMap('inferno');
    },

    markCaseCompleted: function(caseId) {
        if (!this.completedCaseIds.includes(caseId)) {
            this.completedCaseIds.push(caseId);
            localStorage.setItem('completedCases', JSON.stringify(this.completedCaseIds));
            if (EroiDB.cache.userProfile) {
                EroiDB.cache.userProfile.completedCases = this.completedCaseIds;
            }
        }
        this.renderMap(this.currentCampaign);
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

    
    isCircleUnlocked: function(circleIndex, campaignId) {
        if (this.isAdmin()) return true;
        
        let nodesArray = INFERNO_CIRCLES;
        if (campaignId === 'purgatorio') nodesArray = PURGATORIO_TERRACES;
        if (campaignId === 'paradiso') nodesArray = PARADISO_HEAVENS;
        
        const circleId = nodesArray[circleIndex].id;
        const isStudent = EroiDB.cache.userProfile && EroiDB.cache.userProfile.role === 'student';
        
        if (isStudent && this.unlockMode === 'manual') {
            if (this.lockedNodes && this.lockedNodes.includes(circleId)) {
                return false;
            }
            return true; 
        } else {
            if (circleIndex === 0) return true; 
            const prevCircle = nodesArray[circleIndex - 1];
            return this.isCircleCompleted(prevCircle.id);
        }
    },


    
    renderMap: function(campaignId) {
        this.currentCampaign = campaignId;
        const container = document.getElementById(`map-${campaignId}`);
        if (!container) return;
        
        container.innerHTML = '';
        
        let nodesArray = INFERNO_CIRCLES;
        let decorImage = 'assets/Immagini/10.png'; // inferno decor
        if (campaignId === 'purgatorio') {
            nodesArray = PURGATORIO_TERRACES;
            decorImage = 'assets/Immagini/6.png';
        }
        if (campaignId === 'paradiso') {
            nodesArray = PARADISO_HEAVENS;
            decorImage = 'assets/Immagini/7.png';
        }

        const svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgLayer.style.position = 'absolute';
        svgLayer.style.top = '0';
        svgLayer.style.left = '0';
        svgLayer.style.width = '100%';
        svgLayer.style.height = '100%';
        svgLayer.style.zIndex = '0';
        svgLayer.style.pointerEvents = 'none';
        container.appendChild(svgLayer);

        const nodesLayer = document.createElement('div');
        nodesLayer.style.position = 'relative';
        nodesLayer.style.zIndex = '1';
        nodesLayer.style.display = 'flex';
        nodesLayer.style.flexDirection = 'column';
        nodesLayer.style.alignItems = 'center';
        container.appendChild(nodesLayer);
        
        const decorImg = document.createElement('img');
        decorImg.src = decorImage;
        decorImg.style.position = 'absolute';
        decorImg.style.top = '15%';
        decorImg.style.right = '5%';
        decorImg.style.width = '120px';
        decorImg.style.height = '120px';
        decorImg.style.objectFit = 'cover';
        decorImg.style.borderRadius = '50%';
        decorImg.style.boxShadow = '0 0 20px rgba(0,0,0,0.8)';
        decorImg.style.border = '2px solid var(--border-color)';
        decorImg.style.zIndex = '0';
        decorImg.style.opacity = '0.8';
        container.appendChild(decorImg);
        
        const renderedNodes = [];

        nodesArray.forEach((circle, index) => {
            const unlocked = this.isCircleUnlocked(index, campaignId);
            const completed = this.isCircleCompleted(circle.id);
            
            // Fila solo i casi per la campagna corrente e per il cerchio corrente
            const casesInCircle = this.allCases.filter(c => c.campaignId === campaignId && c.cerchio === circle.id);
            const numCases = casesInCircle.length;

            const node = document.createElement('div');
            node.className = `map-node ${completed ? 'completed' : ''}`;
            
            const btn = document.createElement('div');
            
            if (unlocked) {
                btn.className = `circle-btn ${completed ? 'completed' : 'unlocked'}`;
                btn.onclick = () => {
                    this.openCircleDashboard(circle.id, casesInCircle, campaignId);
                };
            } else {
                btn.className = 'circle-btn locked';
                btn.onclick = () => {
                    alert('Devi prima completare i fascicoli del cerchio precedente per accedere a questo!');
                };
            }

            let icon = unlocked ? (completed ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-door-open"></i>') : '<i class="fa-solid fa-lock"></i>';
            if (numCases === 0 && unlocked && !completed) {
               icon = '<i class="fa-solid fa-ghost"></i>'; 
            }

            btn.innerHTML = `
                <span>${circle.name}</span>
                <span class="icon">${icon}</span>
            `;

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

        setTimeout(() => {
            let pathD = "";
            let completedPathD = "";
            
            for (let i = 0; i < renderedNodes.length - 1; i++) {
                const n1 = renderedNodes[i].node;
                const n2 = renderedNodes[i+1].node;
                
                const btn1 = n1.querySelector('.circle-btn');
                const btn2 = n2.querySelector('.circle-btn');
                
                if (!btn1 || !btn2) continue;

                const x1 = n1.offsetLeft + btn1.offsetLeft + (btn1.offsetWidth / 2);
                const y1 = n1.offsetTop + btn1.offsetTop + (btn1.offsetHeight / 2);
                
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
                    completedPathD += `C ${x1} ${yMid}, ${x2} ${yMid}, ${x2} ${y2} `;
                }
            }
            
            if (pathD) {
                const bgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                bgPath.setAttribute('d', pathD);
                bgPath.setAttribute('fill', 'none');
                bgPath.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
                bgPath.setAttribute('stroke-width', '12');
                bgPath.setAttribute('stroke-linecap', 'round');
                svgLayer.appendChild(bgPath);

                const fgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                fgPath.setAttribute('d', completedPathD);
                fgPath.setAttribute('fill', 'none');
                fgPath.setAttribute('stroke', 'var(--accent-gold)');
                fgPath.setAttribute('stroke-width', '12');
                fgPath.setAttribute('stroke-linecap', 'round');
                svgLayer.appendChild(fgPath);
            }
        }, 300);
    },

    openCircleDashboard: function(circleId, cases, campaignId) {
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
                if (window.commediaApp && window.commediaApp.trialsEngine) {
                    window.commediaApp.trialsEngine.startTrial(c.id);
                } else if (window.EroiGame) {
                    window.EroiGame.startTrial(c.id);
                }
            });

            list.appendChild(li);
        });
    }
};

window.MapEngine = MapEngine;
