window.switchAdminTab = function(tabName) {
    ['utenti', 'scuole', 'sistema', 'fascicoli'].forEach(id => {
        const btn = document.getElementById('a-btn-' + id);
        if (btn) {
            btn.classList.remove('active');
            btn.style.borderBottom = 'none';
            btn.style.color = '#888';
        }
\n\nwindow.renderAdminSchoolsList = async function() {
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
\n\nwindow.sortAdminUsers = function(col) {
    if (!window.adminUsersSort) window.adminUsersSort = { col: 'date', asc: false };
    if (window.adminUsersSort.col === col) {
        window.adminUsersSort.asc = !window.adminUsersSort.asc;
    } else {
        window.adminUsersSort.col = col;
        window.adminUsersSort.asc = true;
    }
\n\nwindow.loadAdminUsers = async function() {
    const list = document.getElementById('admin-users-list');
    if (!list) return;
    
    list.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center; color: #888;">Caricamento in corso...</td></tr>';
    
    // Initialize global filter state if not exists
    if (!window.adminUsersFilter) window.adminUsersFilter = 'all';
    
    try {
        const users = await EroiDB.getAllUsers();
        window.adminUsersList = users || [];
        
        if (!users || users.length === 0) {
            list.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center; color: #888;">Nessun utente trovato</td></tr>';
            return;
        }
\n