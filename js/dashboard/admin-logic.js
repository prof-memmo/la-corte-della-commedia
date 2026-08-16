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
    
    if (tabName === 'liveeditor' || tabName === 'sistema') {
        if (window.LiveEditor && typeof window.LiveEditor.renderAdminPanel === 'function') {
            window.LiveEditor.renderAdminPanel('admin-live-editor-container');
        }
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

