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


export const INFERNO_COORDINATES_PC = [
    { id: "Antinferno", x: 30.96, y: 11.28 },
    { id: "Limbo", x: 35.29, y: 31.62 },
    { id: "Lussuriosi", x: 24.40, y: 49.14 },
    { id: "Golosi", x: 35.52, y: 62.67 },
    { id: "Avari", x: 46.64, y: 51.27 },
    { id: "Iracondi", x: 55.91, y: 34.72 },
    { id: "Eretici", x: 67.32, y: 48.86 },
    { id: "Violenti", x: 73.80, y: 69.50 },
    { id: "Fraudolenti", x: 61.30, y: 80.29 },
    { id: "Traditori", x: 75.83, y: 88.99 }
];

export const INFERNO_COORDINATES_MOBILE = [
    { id: "Antinferno", x: 30.29, y: 8.36 },
    { id: "Limbo", x: 68.74, y: 14.21 },
    { id: "Lussuriosi", x: 30.28, y: 24.83 },
    { id: "Golosi", x: 69.46, y: 32.76 },
    { id: "Avari", x: 30.26, y: 43.13 },
    { id: "Iracondi", x: 69.83, y: 54.01 },
    { id: "Eretici", x: 30.28, y: 61.19 },
    { id: "Violenti", x: 70.28, y: 70.28 },
    { id: "Fraudolenti", x: 30.28, y: 83.31 },
    { id: "Traditori", x: 69.83, y: 89.02 }
];

export const PURGATORIO_COORDINATES_PC = [
    { id: "Antipurgatorio", x: 7.14, y: 76.39 },
    { id: "Superbi", x: 15.21, y: 59.54 },
    { id: "Invidiosi", x: 24.74, y: 42.31 },
    { id: "Iracondi_Purg", x: 34.90, y: 56.76 },
    { id: "Accidiosi", x: 47.24, y: 40.46 },
    { id: "Avari_Purg", x: 59.64, y: 50.19 },
    { id: "Golosi_Purg", x: 72.14, y: 35.09 },
    { id: "Lussuriosi_Purg", x: 85.73, y: 44.35 },
    { id: "ParadisoTerrestre", x: 92.66, y: 24.07 }
];

export const PURGATORIO_COORDINATES_MOBILE = [
    { id: "Antipurgatorio", x: 30.83, y: 8.23 },
    { id: "Superbi", x: 70.09, y: 14.22 },
    { id: "Invidiosi", x: 30.37, y: 25.10 },
    { id: "Iracondi_Purg", x: 69.81, y: 32.97 },
    { id: "Accidiosi", x: 30.37, y: 42.97 },
    { id: "Avari_Purg", x: 69.91, y: 54.32 },
    { id: "Golosi_Purg", x: 30.46, y: 61.35 },
    { id: "Lussuriosi_Purg", x: 69.91, y: 70.36 },
    { id: "ParadisoTerrestre", x: 30.28, y: 83.54 }
];

export const PARADISO_COORDINATES_PC = [
    { id: "Luna", x: 8.97, y: 58.12 },
    { id: "Mercurio", x: 20.08, y: 43.83 },
    { id: "Venere", x: 28.08, y: 60.33 },
    { id: "Sole", x: 35.47, y: 40.37 },
    { id: "Marte", x: 44.88, y: 61.33 },
    { id: "Giove", x: 51.89, y: 40.55 },
    { id: "Saturno", x: 61.90, y: 61.42 },
    { id: "StelleFisse", x: 72.40, y: 38.96 },
    { id: "PrimoMobile", x: 78.67, y: 62.55 },
    { id: "Empireo", x: 90.98, y: 47.52 }
];

export const PARADISO_COORDINATES_MOBILE = [
    { id: "Luna", x: 30.18, y: 8.41 },
    { id: "Mercurio", x: 69.73, y: 14.20 },
    { id: "Venere", x: 30.18, y: 24.97 },
    { id: "Sole", x: 69.72, y: 32.93 },
    { id: "Marte", x: 30.18, y: 43.11 },
    { id: "Giove", x: 69.73, y: 54.08 },
    { id: "Saturno", x: 30.18, y: 61.24 },
    { id: "StelleFisse", x: 69.73, y: 70.35 },
    { id: "PrimoMobile", x: 30.18, y: 83.40 },
    { id: "Empireo", x: 69.72, y: 89.08 }
];

const CAMPAIGN_CONFIG = {
    inferno: {
        name: "Inferno",
        nodes: INFERNO_CIRCLES,
        coordsPC: INFERNO_COORDINATES_PC,
        coordsMobile: INFERNO_COORDINATES_MOBILE,
        bgPC: "assets/maps/pc/inferno.png",
        bgMobile: "assets/maps/mobile/inferno.png",
        glowColor: "#f59e0b",
        glowFilter: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))"
    },
    purgatorio: {
        name: "Purgatorio",
        nodes: PURGATORIO_TERRACES,
        coordsPC: PURGATORIO_COORDINATES_PC,
        coordsMobile: PURGATORIO_COORDINATES_MOBILE,
        bgPC: "assets/maps/pc/purgatorio.png",
        bgMobile: "assets/maps/mobile/purgatorio.png",
        glowColor: "#e0a96d",
        glowFilter: "drop-shadow(0 0 8px rgba(224, 169, 109, 0.8))"
    },
    paradiso: {
        name: "Paradiso",
        nodes: PARADISO_HEAVENS,
        coordsPC: PARADISO_COORDINATES_PC,
        coordsMobile: PARADISO_COORDINATES_MOBILE,
        bgPC: "assets/maps/pc/paradiso.png",
        bgMobile: "assets/maps/mobile/paradiso.png",
        glowColor: "#38bdf8",
        glowFilter: "drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))"
    }
};

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
        if (window.EroiDB && EroiDB.cache && EroiDB.cache.userProfile) {
            const email = EroiDB.cache.userProfile.email ? EroiDB.cache.userProfile.email.toLowerCase() : '';
            if (EroiDB.cache.userProfile.role === 'admin' || email === 'prof.memmo@gmail.com') return true;
        }
        if (window.Auth && typeof window.Auth.getUser === 'function') {
            const u = window.Auth.getUser();
            if (u && (u.role === 'admin' || (u.email && u.email.toLowerCase() === 'prof.memmo@gmail.com'))) return true;
        }
        if (window.firebase && window.firebase.auth && window.firebase.auth().currentUser) {
            const fbEmail = (window.firebase.auth().currentUser.email || '').toLowerCase();
            if (fbEmail === 'prof.memmo@gmail.com') return true;
        }
        const saved = localStorage.getItem('commedia_user') || localStorage.getItem('user');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.role === 'admin' || (parsed.email && parsed.email.toLowerCase() === 'prof.memmo@gmail.com')) return true;
            } catch(e) {}
        }
        return false;
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
        this.renderIllustratedCampaign(campaignId, container);
    },

    toggleFullscreenMap: function(btn) {
        const wrapper = btn.closest('.illustrated-map-wrapper');
        if (!wrapper) return;
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (wrapper.requestFullscreen) {
                wrapper.requestFullscreen();
            } else if (wrapper.webkitRequestFullscreen) {
                wrapper.webkitRequestFullscreen();
            }
            btn.innerHTML = '<i class="fa-solid fa-compress"></i>';
            btn.title = "Esci da Schermo Intero LIM";
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            btn.innerHTML = '<i class="fa-solid fa-expand"></i>';
            btn.title = "Schermo Intero LIM";
        }
    },

    renderIllustratedCampaign: function(campaignId, container) {
        const config = CAMPAIGN_CONFIG[campaignId] || CAMPAIGN_CONFIG.inferno;
        const isMobile = window.innerWidth <= 768;
        const coords = isMobile ? config.coordsMobile : config.coordsPC;
        const bgImgPath = isMobile ? config.bgMobile : config.bgPC;
        const nodesArray = config.nodes;

        container.innerHTML = `
            <div class="illustrated-map-wrapper ${isMobile ? 'mode-mobile' : 'mode-pc'}" data-campaign="${campaignId}">
                <button class="btn-fullscreen-lim" onclick="window.MapEngine.toggleFullscreenMap(this)" title="Schermo Intero LIM" aria-label="Schermo Intero LIM">
                    <i class="fa-solid fa-expand"></i>
                </button>
                <img class="map-bg-img" src="${bgImgPath}" alt="Mappa ${config.name}" />
                <svg class="map-svg-layer" viewBox="${isMobile ? '0 0 1080 1920' : '0 0 1920 1080'}"></svg>
                <div class="map-hotspots-layer"></div>
            </div>
        `;

        const hotspotsLayer = container.querySelector('.map-hotspots-layer');
        const svgLayer = container.querySelector('.map-svg-layer');

        nodesArray.forEach((circle, index) => {
            const coord = coords[index] || { x: 50, y: 50 };
            const unlocked = this.isCircleUnlocked(index, campaignId);
            const completed = this.isCircleCompleted(circle.id);
            const casesInCircle = this.allCases.filter(c => c.campaignId === campaignId && c.cerchio === circle.id);
            const numCases = casesInCircle.length;
            const solvedCases = casesInCircle.filter(c => this.completedCaseIds.includes(c.id)).length;
            const isCurrentTappa = unlocked && !completed;

            const hotspot = document.createElement('div');
            let statusClass = completed ? 'completed' : (unlocked ? 'unlocked' : 'locked');
            if (isCurrentTappa) statusClass += ' active-tappa';

            hotspot.className = `map-hotspot ${statusClass}`;
            hotspot.style.left = `${coord.x}%`;
            hotspot.style.top = `${coord.y}%`;
            hotspot.setAttribute('role', 'button');
            hotspot.setAttribute('tabindex', '0');
            hotspot.setAttribute('aria-label', `${circle.name} - ${completed ? 'Completato' : (unlocked ? 'Sbloccato' : 'Bloccato')}`);

            // Badges
            let badgeIcon = '<i class="fa-solid fa-lock"></i>';
            let badgeType = 'locked';
            if (completed) {
                badgeIcon = '<i class="fa-solid fa-check"></i>';
                badgeType = 'completed';
            } else if (unlocked) {
                badgeIcon = '<i class="fa-solid fa-door-open"></i>';
                badgeType = 'active';
            }

            const badgeHtml = `<span class="hotspot-badge ${badgeType}">${badgeIcon}</span>`;
            const pillHtml = numCases > 0 ? `<span class="hotspot-fascicoli-pill">${solvedCases}/${numCases}</span>` : '';
            const statusLabel = completed ? 'Completato' : (unlocked ? (isCurrentTappa ? 'Tappa Attiva' : 'Sbloccato') : 'Bloccato');
            const tooltipHtml = `
                <div class="hotspot-tooltip">
                    <strong>${circle.name}</strong><br>
                    <span style="font-size:0.75rem; color:#cbd5e1;">${statusLabel} • ${solvedCases}/${numCases} fascicoli</span>
                </div>
            `;

            hotspot.innerHTML = `${badgeHtml}${pillHtml}${tooltipHtml}`;

            hotspot.onclick = (e) => {
                e.stopPropagation();
                if (unlocked) {
                    this.openCircleDashboard(circle.id, casesInCircle, campaignId);
                } else {
                    alert(`Devi prima completare i fascicoli del cerchio precedente per accedere a: ${circle.name}!`);
                }
            };

            hotspot.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    hotspot.click();
                }
            };

            hotspotsLayer.appendChild(hotspot);
        });

        // Dynamic SVG Path connecting nodes
        let pathD = "";
        let completedPathD = "";
        for (let i = 0; i < nodesArray.length - 1; i++) {
            const c1 = coords[i];
            const c2 = coords[i+1];
            if (!c1 || !c2) continue;

            const scaleX = isMobile ? 1080 / 100 : 1920 / 100;
            const scaleY = isMobile ? 1920 / 100 : 1080 / 100;

            const x1 = c1.x * scaleX;
            const y1 = c1.y * scaleY;
            const x2 = c2.x * scaleX;
            const y2 = c2.y * scaleY;

            const cx1 = x1 + (x2 - x1) * 0.5;
            const cy1 = y1;
            const cx2 = x1 + (x2 - x1) * 0.5;
            const cy2 = y2;

            const seg = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2} `;
            pathD += seg;

            const circle1 = nodesArray[i];
            const circle2 = nodesArray[i+1];
            if (this.isCircleCompleted(circle1.id) || this.isCircleUnlocked(i+1, campaignId)) {
                completedPathD += seg;
            }
        }

        if (pathD) {
            const bgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            bgPath.setAttribute('d', pathD);
            bgPath.setAttribute('fill', 'none');
            bgPath.setAttribute('stroke', 'rgba(255, 255, 255, 0.15)');
            bgPath.setAttribute('stroke-width', isMobile ? '8' : '5');
            bgPath.setAttribute('stroke-dasharray', isMobile ? '8 6' : '6 4');
            bgPath.setAttribute('stroke-linecap', 'round');
            svgLayer.appendChild(bgPath);

            if (completedPathD) {
                const fgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                fgPath.setAttribute('d', completedPathD);
                fgPath.setAttribute('fill', 'none');
                fgPath.setAttribute('stroke', config.glowColor);
                fgPath.setAttribute('stroke-width', isMobile ? '8' : '5');
                fgPath.setAttribute('stroke-linecap', 'round');
                fgPath.style.filter = config.glowFilter;
                svgLayer.appendChild(fgPath);
            }
        }

        // Debounced resize listener
        if (!this._resizeAttached) {
            this._resizeAttached = true;
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    const activeContainer = document.getElementById(`map-${this.currentCampaign}`);
                    if (activeContainer && activeContainer.style.display !== 'none') {
                        this.renderIllustratedCampaign(this.currentCampaign, activeContainer);
                    }
                }, 200);
            });

            document.addEventListener('fullscreenchange', () => {
                const fsBtns = document.querySelectorAll('.btn-fullscreen-lim');
                const isFs = !!document.fullscreenElement;
                fsBtns.forEach(b => {
                    b.innerHTML = isFs ? '<i class="fa-solid fa-compress"></i>' : '<i class="fa-solid fa-expand"></i>';
                    b.title = isFs ? 'Esci da Schermo Intero LIM' : 'Schermo Intero LIM';
            });
        }
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
