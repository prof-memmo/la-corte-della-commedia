import { db, doc, getDoc, setDoc } from "./firebase-config.js";
import { collection, getDocs, query, where, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const EroiDB = {
    // Cache locale per i dati caricati
    cache: {
        campaigns: [],
        cases: [],
        activities: [],
        userProfile: null
    },

    // --- PROFILO UTENTE ---
    getUserProfile: async function(uid) {
        try {
            const docSnap = await getDoc(doc(db, "users", uid));
            if (docSnap.exists()) {
                this.cache.userProfile = docSnap.data();
                return this.cache.userProfile;
            }
            return null;
        } catch (e) {
            console.error("Errore fetch profilo:", e);
            return null;
        }
    },

    updateXP: async function(uid, amount) {
        if (!this.cache.userProfile) return;
        const newXp = (this.cache.userProfile.xp || 0) + amount;
        try {
            await updateDoc(doc(db, "users", uid), { xp: newXp });
            this.cache.userProfile.xp = newXp;
            return newXp;
        } catch (e) {
            console.error("Errore aggiornamento XP:", e);
        }
    },

    // --- CAMPAGNE E CASI ---
    getCampaigns: async function() {
        if (this.cache.campaigns.length > 0) return this.cache.campaigns;
        
        try {
            const q = query(collection(db, "campaigns"), orderBy("order", "asc"));
            const querySnapshot = await getDocs(q);
            const campaigns = [];
            querySnapshot.forEach((doc) => {
                campaigns.push({ id: doc.id, ...doc.data() });
            });
            this.cache.campaigns = campaigns;
            return campaigns;
        } catch (e) {
            console.error("Errore fetch campagne:", e);
            return [];
        }
    },

    getCasesByCampaign: async function(campaignId) {
        try {
            const q = query(collection(db, "cases"), where("campaignId", "==", campaignId));
            const querySnapshot = await getDocs(q);
            const cases = [];
            querySnapshot.forEach((doc) => {
                cases.push({ id: doc.id, ...doc.data() });
            });
            return cases;
        } catch (e) {
            console.error("Errore fetch casi:", e);
            return [];
        }
    },

    // --- VERDETTI E LOGS ---
    saveSentence: async function(sentenceData) {
        try {
            // Un id casuale o generato, qui usiamo push id finto o doc vuoto
            const newDocRef = doc(collection(db, "sentences"));
            await setDoc(newDocRef, sentenceData);
            return newDocRef.id;
        } catch (e) {
            console.error("Errore salvataggio sentenza:", e);
            return null;
        }
    }
};

window.EroiDB = EroiDB;
export default EroiDB;
