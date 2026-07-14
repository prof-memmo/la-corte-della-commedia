import { db, doc, getDoc, setDoc } from "./firebase-config.js";
import { collection, getDocs, query, where, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const MOCK_CASES = [
  { id: "paolo_francesca", campaignId: "inferno", characterName: "Paolo e Francesca", canto: "Canto V", cerchio: "Lussuriosi", order: 1, active: true, phases: { facts: "Si amarono leggendo di Lancillotto e Ginevra. Furono uccisi dal marito di lei, Gianciotto.", accusation: "Hanno sottomesso la ragione al desiderio carnale, tradendo i vincoli coniugali.", defense: "Amore, ch'a nullo amato amar perdona... fummo travolti da una forza irresistibile." } },
  { id: "celestino_v", campaignId: "inferno", characterName: "Colui che fece il gran rifiuto (Celestino V)", canto: "Canto III", cerchio: "Ignavi", order: 1, active: true, phases: { facts: "Vissero senza infamia e senza lodo.", accusation: "Non presero mai posizione nella vita.", defense: "Non fecero del male attivamente." } },
  { id: "omero", campaignId: "inferno", characterName: "Omero", canto: "Canto IV", cerchio: "Limbo", order: 1, active: true, phases: { facts: "Poeta sommo dell'antichità, nato prima di Cristo.", accusation: "Non ha ricevuto il battesimo cristiano.", defense: "Visse una vita virtuosa e onorevole, illuminando il mondo con l'arte." } },
  { id: "ciacco", campaignId: "inferno", characterName: "Ciacco", canto: "Canto VI", cerchio: "Golosi", order: 1, active: true },
  { id: "papi_avari", campaignId: "inferno", characterName: "Papi e Cardinali", canto: "Canto VII", cerchio: "Avari", order: 1, active: true },
  { id: "filippo_argenti", campaignId: "inferno", characterName: "Filippo Argenti", canto: "Canto VIII", cerchio: "Iracondi", order: 1, active: true },
  { id: "farinata", campaignId: "inferno", characterName: "Farinata degli Uberti", canto: "Canto X", cerchio: "Eretici", order: 1, active: true },
  { id: "pier_della_vigna", campaignId: "inferno", characterName: "Pier della Vigna", canto: "Canto XIII", cerchio: "Violenti", order: 1, active: true },
  { id: "ulisse", campaignId: "inferno", characterName: "Ulisse", canto: "Canto XXVI", cerchio: "Fraudolenti", order: 1, active: true },
  { id: "ugolino", campaignId: "inferno", characterName: "Conte Ugolino", canto: "Canto XXXIII", cerchio: "Traditori", order: 1, active: true }
];
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
        if (this.cache.cases && this.cache.cases.length > 0) {
            const cachedCases = this.cache.cases.filter(c => c.campaignId === campaignId);
            if (cachedCases.length > 0) return cachedCases;
        }

        try {
            const q = query(collection(db, "cases"), where("campaignId", "==", campaignId));
            const querySnapshot = await getDocs(q);
            const cases = [];
            querySnapshot.forEach((doc) => {
                cases.push({ id: doc.id, ...doc.data() });
            });
            if (cases.length === 0 && campaignId === "inferno") {
                this.cache.cases = this.cache.cases.concat(MOCK_CASES);
                return MOCK_CASES;
            }
            this.cache.cases = this.cache.cases.concat(cases);
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
