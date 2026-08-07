import { db, doc, getDoc, setDoc } from "../firebase-config.js";\nimport { collection, getDocs, query, where, orderBy, updateDoc, or, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";\n\nexport const getUserProfile = async function(uid) {
        try {
            const docSnap = await getDoc(doc(db, "users", uid));
            if (docSnap.exists()) {
                this.cache.userProfile = docSnap.data();
                return this.cache.userProfile;
            };\n
\n\nexport const updateXP = async function(uid, amount) {
        if (!this.cache.userProfile) return;
        const newXp = (this.cache.userProfile.xp || 0) + amount;
        try {
            await updateDoc(doc(db, "users", uid), { xp: newXp });
            this.cache.userProfile.xp = newXp;
            return newXp;
        } catch (e) {
            console.error("Errore aggiornamento XP:", e);
        };\n
\n\nexport const getAllUsers = async function() {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const users = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });
            // --- Aggiunta MOCK DATA ---
            const mockUsers = [
                { id: "mock-teacher", uid: "mock-teacher", email: "prof.memmo@lacorte.it", displayName: "Prof Memmo", role: "teacher" },
                { id: "mock-student", uid: "mock-student", email: "studente.test@lacorte.it", displayName: "Studente Test", role: "student", classId: "TEST-CLASS", level: 1, xp: 0 },
                { id: "mock-external", uid: "mock-external", email: "esterno.test@lacorte.it", displayName: "Visitatore", role: "external" }
            ];
            const existingEmails = users.map(u => u.email);
            for (let mu of mockUsers) {
                if (!existingEmails.includes(mu.email)) users.push(mu);
            };\n
\n\nexport const updateUserRole = async function(uid, newRole) {
        try {
            await updateDoc(doc(db, "users", uid), { role: newRole });
        } catch (e) {
            console.error("Errore updateUserRole:", e);
            throw e;
        };\n
\n