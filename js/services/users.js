import { cache } from "./cache.js";
import { db, doc, collection, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, or, arrayUnion } from "../firebase-config.js";

export const getUserProfile = async function(uid) {
        try {
            const docSnap = await getDoc(doc(db, "users", uid));
            if (docSnap.exists()) {
                cache.userProfile = docSnap.data();
                return cache.userProfile;
            }
            return null;
        } catch (e) {
            console.error("Errore fetch profilo:", e);
            return null;
        }
    };

export const updateXP = async function(uid, amount) {
        if (!cache.userProfile) return;
        const newXp = (cache.userProfile.xp || 0) + amount;
        try {
            await updateDoc(doc(db, "users", uid), { xp: newXp });
            cache.userProfile.xp = newXp;
            return newXp;
        } catch (e) {
            console.error("Errore aggiornamento XP:", e);
        }
    };

export const getAllUsers = async function() {
        try {
            // Priorità su hub_users
            let querySnapshot;
            try {
                querySnapshot = await getDocs(collection(db, "hub_users"));
            } catch (_) {
                querySnapshot = await getDocs(collection(db, "users"));
            }

            const users = [];
            const mockTestEmails = [
                'testhero12345@gmail.com',
                'test@example.com',
                'docente.aurora@gmail.com',
                'studente.test@lacorte.it',
                'esterno.test@lacorte.it',
                'prof.memmo@lacorte.it'
            ];

            querySnapshot.forEach((doc) => {
                const d = doc.data() || {};
                const email = (d.email || '').toLowerCase().trim();
                if (!email || mockTestEmails.includes(email)) return;
                if (email.includes('studenti.prof-memmo.local') || email.includes('@studenti.profmemmo.internal')) return;
                if (d.role === 'pending' || d.statusAccount === 'pending') return;

                const userPlan = (d.plan || d.abbonamento || d.subscription || 'base').toLowerCase();
                const userGioco = (d.gioco || d.game || '').toLowerCase();
                const isAdmin = d.role === 'admin' || email === 'prof.memmo@gmail.com';
                const hasEcosystemPlan = userPlan.includes('ecosistema') || userPlan.includes('didattic');
                const isCommediaGame = userGioco.includes('commedia') || userGioco.includes('corte');

                // Filtra solo utenti con accesso a La Corte della Commedia
                if (!isAdmin && !hasEcosystemPlan && !isCommediaGame) return;

                let role = 'teacher';
                if (isAdmin) role = 'admin';
                else if (d.role === 'external' || d.role === 'viandante' || d.role === 'forestiero') role = 'external';

                users.push({
                    id: doc.id,
                    uid: doc.id,
                    email: email,
                    name: (d.anagrafica && (d.anagrafica.nome || d.anagrafica.cognome))
                        ? `${d.anagrafica.nome || ''} ${d.anagrafica.cognome || ''}`.trim()
                        : (d.displayName || d.nome || email.split('@')[0]),
                    displayName: (d.anagrafica && (d.anagrafica.nome || d.anagrafica.cognome))
                        ? `${d.anagrafica.nome || ''} ${d.anagrafica.cognome || ''}`.trim()
                        : (d.displayName || d.nome || email.split('@')[0]),
                    role: role,
                    school: (d.anagrafica && d.anagrafica.istituto) || d.school || d.scuola || '',
                    createdAt: d.createdAt ? (d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt)) : new Date()
                });
            });

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

