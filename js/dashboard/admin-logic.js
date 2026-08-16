window.switchAdminTab = function(tabName) {
    ['utenti', 'scuole', 'sistema', 'fascicoli', 'liveeditor'].forEach(id => {
        const btn = document.getElementById('a-btn-' + id);
        if (btn) {
            btn.classList.remove('active');
            btn.style.borderBottom = 'none';
            btn.style.color = '#888';
        }
        const tab = document.getElementById('a-tab-' + id);
        if (tab) tab.style.display = 'none';
    });
    
    const btnActive = document.getElementById('a-btn-' + tabName);
    if (btnActive) {
        btnActive.classList.add('active');
        btnActive.style.borderBottom = '2px solid var(--accent-gold)';
        btnActive.style.color = 'var(--accent-gold)';
    }
    const tabActive = document.getElementById('a-tab-' + tabName);
    if (tabActive) tabActive.style.display = 'block';
    
    if (tabName === 'liveeditor') {
        if (window.LiveEditor && typeof window.LiveEditor.renderAdminPanel === 'function') {
            window.LiveEditor.renderAdminPanel('admin-live-editor-container');
        }
    } else if (tabName === 'sistema') {
        if (window.loadHistoricalArchives) window.loadHistoricalArchives();
    } else if (tabName === 'utenti') {
        loadAdminUsers();
    } else if (tabName === 'scuole') {
        renderAdminSchoolsList();
    }
};

window.renderAdminSchoolsList = async function() {
    const list = document.getElementById('admin-schools-list');
    if (!list) return;
    
    list.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center; color: #888;">Caricamento scuole in corso...</td></tr>';
    
    try {
        const users = await EroiDB.getAllUsers();
        const schoolsMap = new Map();
        
        users.forEach(u => {
            if (u.role === 'teacher' && u.school) {
                const schoolName = u.school.trim();
                if (!schoolsMap.has(schoolName)) {
                    schoolsMap.set(schoolName, {
                        name: schoolName,
                        city: u.city || 'N/A',
                        referentName: u.displayName || u.name || 'Sconosciuto',
                        referentEmail: u.email
                    });
                }
            }
        });

        if (schoolsMap.size === 0) {
            list.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center; color: #888;">Nessuna scuola registrata.</td></tr>';
            return;
        }

        let html = '';
        Array.from(schoolsMap.values()).forEach(s => {
            html += `
              <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 10px; font-weight: bold; color: var(--accent-gold);">${s.name}</td>
                <td style="padding: 10px; color: #ccc;">${s.city}</td>
                <td style="padding: 10px;">${s.referentName}</td>
                <td style="padding: 10px; text-align: right;">
                    <a href="mailto:${s.referentEmail}" title="Scrivi al referente ${s.referentName}" class="btn" style="background: rgba(255,255,255,0.1); color: var(--accent-gold); padding: 5px 10px; border-radius: 5px; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
                        <i class="fa-solid fa-envelope"></i> Contatta
                    </a>
                </td>
              </tr>
            `;
        });
        list.innerHTML = html;
    } catch (e) {
        console.error("Errore renderAdminSchoolsList", e);
        list.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center; color: red;">Errore caricamento scuole</td></tr>';
    }
};

window.filterAdminUsers = function(filterType) {
    window.adminUsersFilter = filterType;
    
    // Mostra nascondi i contenitori
    const usersWrapper = document.getElementById('admin-users-table-wrapper');
    const schoolsWrapper = document.getElementById('admin-schools-table-wrapper');
    if (filterType === 'schools') {
        if (usersWrapper) usersWrapper.style.display = 'none';
        if (schoolsWrapper) schoolsWrapper.style.display = 'block';
    } else {
        if (usersWrapper) usersWrapper.style.display = 'block';
        if (schoolsWrapper) schoolsWrapper.style.display = 'none';
    }
    
    // Aggiorna gli stili delle card
    const cards = ['all', 'teacher', 'student', 'external', 'schools'];
    cards.forEach(c => {
        const el = document.getElementById('stat-card-' + c);
        if (el) {
            if (c === filterType) {
                el.style.border = '3px solid #5C67F2';
            } else {
                el.style.border = '3px solid transparent';
            }
        }
    });
    
    // Ricarica la lista per applicare il filtro e l'ordinamento
    window.loadAdminUsers();
};

window.testConnessioneAdmin = async function() {
    try {
        const db = window.fbDb || window.db || (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
        if (!db) throw new Error("Database Firebase non inizializzato");
        await db.collection('corte_cases').limit(1).get().catch(() => db.collection('users').limit(1).get());
        alert("✅ Connessione al Cloud Firestore riuscita e operativa!\nLatenza ottimale.");
    } catch (e) {
        console.error("Errore test connessione:", e);
        alert("❌ Errore connessione database: " + e.message);
    }
};

window.resetNotificheLette = function() {
    try {
        localStorage.removeItem('corte_unread_notifications');
        localStorage.removeItem('corte_seen_notifications');
        alert("✅ Tutte le notifiche dell'amministratore sono state reimpostate come lette.");
    } catch (e) {
        alert("Errore reset notifiche: " + e.message);
    }
};

window.azzeraValidazioniStagione = async function() {
    if (!confirm("Sei sicuro di voler AZZERARE TUTTI I VERDETTI E I PROGRESSI DEI PROCESSI per la nuova stagione?\nStudenti, docenti e classi rimarranno inalterati.")) return;
    try {
        const db = window.fbDb || window.db || (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
        if (!db) throw new Error("Database non connesso");
        const snap = await db.collection('corte_verdicts').get().catch(() => ({ docs: [] }));
        let batch = db.batch();
        snap.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        alert("✅ Tutti i verdetti e i processi della stagione sono stati azzerati con successo!");
        window.location.reload();
    } catch (e) {
        console.error("Errore azzeramento verdetti:", e);
        alert("Errore: " + e.message);
    }
};

window.archiviaAnnoCorrente = async function() {
    const currentYear = new Date().getFullYear();
    if (!confirm(`Sei ASSOLUTAMENTE sicuro di voler archiviare l'anno scolastico ${currentYear}?`)) return;
    try {
        const backupName = prompt("Inserisci un nome per l'archivio (es: Corte_${currentYear}_${currentYear+1}):", `Archivio_${currentYear}`);
        if (!backupName) return;

        const db = window.fbDb || window.db || (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
        if (!db) throw new Error("Database non connesso");

        const usersSnapshot = await db.collection('users').get().catch(() => ({ docs: [] }));
        const verdictsSnapshot = await db.collection('corte_verdicts').get().catch(() => ({ docs: [] }));
        let batch = db.batch();

        let leaderboard = [];
        usersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.role !== 'admin' && data.role !== 'docente' && data.status !== 'archived') {
                leaderboard.push({
                    name: data.displayName || data.name || data.email,
                    points: data.xp || data.score || data.points || 0,
                    school: data.school || '',
                    classRoom: data.classRoom || data.section || ''
                });
                batch.update(doc.ref, { archivedYear: backupName, status: 'archived' });
            }
        });
        leaderboard.sort((a,b) => b.points - a.points);

        const archiveRef = db.collection('corte_archives').doc();
        batch.set(archiveRef, {
            yearName: backupName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            leaderboard: leaderboard
        });

        await batch.commit();
        alert(`Archiviazione "${backupName}" completata. I progressi sono stati salvati nell'Archivio Storico.`);
        window.location.reload();
    } catch (e) {
        console.error("Errore archiviazione:", e);
        alert("Errore: " + e.message);
    }
};

window.ripristinaAnnoArchiviato = async function(backupName) {
    if (!confirm(`Sei ASSOLUTAMENTE sicuro di voler RIPRISTINARE l'anno archiviato "${backupName}"?`)) return;
    try {
        const db = window.fbDb || window.db || (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
        if (!db) throw new Error("Database non connesso");

        const usersSnapshot = await db.collection('users').where('archivedYear', '==', backupName).get();
        const archivesSnapshot = await db.collection('corte_archives').where('yearName', '==', backupName).get();

        let batch = db.batch();
        usersSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, {
                status: 'active',
                archivedYear: firebase.firestore.FieldValue.delete()
            });
        });

        archivesSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        alert(`Ripristino dell'anno "${backupName}" completato con successo!`);
        window.location.reload();
    } catch (e) {
        console.error("Errore ripristino:", e);
        alert("Errore ripristino: " + e.message);
    }
};

window.loadHistoricalArchives = async function() {
    try {
        const db = window.fbDb || window.db || (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
        if (!db) return;
        const snapshot = await db.collection('corte_archives').orderBy('timestamp', 'desc').get();
        const container = document.getElementById('admin-historical-archives-list');
        if (!container) return;

        if (snapshot.empty) {
            container.innerHTML = '<p style="color:var(--text-muted, #888); font-size: 0.9rem;">Nessun anno archiviato trovato.</p>';
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const d = data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate().toLocaleDateString('it-IT') : new Date(data.timestamp).toLocaleDateString('it-IT')) : 'Data Sconosciuta';

            let lbHtml = '<div style="margin-top:10px; display:none; background:rgba(0,0,0,0.3); padding:10px; border-radius:6px;" id="archive-lb-'+doc.id+'">';
            lbHtml += '<h4 style="margin-bottom:10px; color:var(--accent-gold); border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;">Classifica Finale</h4>';

            if (data.leaderboard && data.leaderboard.length > 0) {
                data.leaderboard.forEach((t, i) => {
                    let badge = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '°';
                    lbHtml += `<div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px dashed rgba(255,255,255,0.05); font-size:0.9rem;">
                        <span>${badge} <strong>${t.name}</strong> <span style="color:#aaa; font-size:0.8rem;">(${t.classRoom || ''} - ${t.school || ''})</span></span>
                        <span style="color:var(--accent-gold); font-weight:bold;">${t.points} xp</span>
                    </div>`;
                });
            } else {
                lbHtml += '<p style="font-size:0.85rem; color:#888;">Classifica non disponibile o vuota.</p>';
            }
            lbHtml += '</div>';

            html += `
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <h4 style="margin: 0; color: var(--accent-gold); font-size: 1.05rem;"><i class="fa-solid fa-box-archive"></i> ${data.yearName}</h4>
                        <div style="font-size: 0.8rem; color: #888; margin-top: 4px;">Archiviato il: ${d}</div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn" style="padding: 6px 12px; font-size: 0.8rem; background: rgba(255,255,255,0.1); color: var(--accent-gold); border: 1px solid var(--accent-gold); border-radius: 4px;" onclick="const el = document.getElementById('archive-lb-${doc.id}'); el.style.display = el.style.display === 'none' ? 'block' : 'none';"><i class="fa-solid fa-eye"></i> Classifica</button>
                        <button class="btn" style="background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #ef4444; padding: 6px 12px; font-size: 0.8rem; border-radius: 4px;" onclick="window.ripristinaAnnoArchiviato('${data.yearName}')"><i class="fa-solid fa-rotate-left"></i> Ripristina</button>
                    </div>
                </div>
                ${lbHtml}
            </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (e) {
        console.error("Errore caricamento archivio storico corte:", e);
    }
};

