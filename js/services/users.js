import EroiDB from "../db.js";
import { db, doc, getDoc, setDoc } from "../firebase-config.js";
import { collection, getDocs, query, where, orderBy, updateDoc, or, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export const getUserProfile = async function(uid) {
        try {
            const docSnap = await getDoc(doc(db, "users", uid));
            if (docSnap.exists()) {
                EroiDB.cache.userProfile = docSnap.data();
                return EroiDB.cache.userProfile;
            }
            return null;
        } catch (e) {
            console.error("Errore fetch profilo:", e);
            return null;
        }
    };

export const updateXP = async function(uid, amount) {
        if (!EroiDB.cache.userProfile) return;
        const newXp = (EroiDB.cache.userProfile.xp || 0) + amount;
        try {
            await updateDoc(doc(db, "users", uid), { xp: newXp });
            EroiDB.cache.userProfile.xp = newXp;
            return newXp;
        } catch (e) {
            console.error("Errore aggiornamento XP:", e);
        }
    };

export const getAllUsers = async function() {
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
            }
            // --- FINE MOCK DATA ---
            return users;
        } catch (e) {
            console.error("Errore getAllUsers:", e);
            return [];
        }
    };

export const updateUserRole = async function(uid, newRole) {
        try {
            await updateDoc(doc(db, "users", uid), { role: newRole });
        } catch (e) {
            console.error("Errore updateUserRole:", e);
            throw e;
        }
    };

