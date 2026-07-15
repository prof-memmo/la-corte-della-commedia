import { db, doc, getDoc, setDoc } from "./firebase-config.js";
import { collection, getDocs, query, where, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const MOCK_CASES = [
  { 
    id: "paolo_francesca", 
    campaignId: "inferno", 
    characterName: "Paolo e Francesca", 
    canto: "Canto V", 
    cerchio: "Lussuriosi", 
    order: 1, 
    active: true, 
    phases: { 
      facts: "Siamo nel secondo cerchio dell'Inferno, dove la bufera infernal che mai non resta trascina gli spiriti dei lussuriosi, coloro che sottomisero la ragione al talento. Francesca da Polenta, data in sposa per motivi politici a Gianciotto Malatesta (uomo deforme e violento), si innamorò perdutamente del fratello di lui, l'affascinante Paolo.<br><br>Un giorno, mentre i due leggevano per diletto le avventure di Lancillotto e Ginevra, arrivarono al punto in cui l'eroe bacia la regina. In quell'istante, come confessa Francesca stessa:<br><br><span style='display:block; text-align:center; font-style:italic; margin: 15px 0; color: #d4af37;'>&quot;Galeotto fu 'l libro e chi lo scrisse: quel giorno più non vi leggemmo avante.&quot;</span><br>Gianciotto li sorprese in flagrante e, accecato dall'ira e dal disonore, li trafisse entrambi con la sua spada, unendoli nella morte come lo erano stati nell'amore.", 
      accusation: "Onorevole Giudice, questi due spiriti hanno commesso il più vile dei tradimenti contro il sacro vincolo del matrimonio! Hanno permesso che il desiderio carnale prevalesse sulla ragione, principio divino che ci eleva dalle bestie.<br><br>Non lasciatevi ingannare dalle loro lacrime: non vi è pentimento in loro. Hanno infranto le leggi degli uomini e di Dio per soddisfare un capriccio terreno. La loro lussuria ha scatenato sangue e morte, distruggendo l'onore della famiglia Malatesta!", 
      defense: "Vostro Onore, vi prego di guardare non all'atto in sé, ma alla forza sovrumana che l'ha generato. L'Amore è un signore potente e invincibile per i cuori gentili. Come ha detto la mia assistita:<br><br><span style='display:block; font-style:italic; margin: 15px 0; color: #4a2c11; font-weight: bold;'>&quot;Amor, ch'a nullo amato amar perdona, mi prese del costui piacer sì forte, che, come vedi, ancor non m'abbandona.&quot;</span><br>Non è stata una scelta maliziosa e calcolata, ma l'impeto di un sentimento così puro e travolgente da accecare chiunque. Condannerete davvero per l'eternità due anime la cui unica colpa è stata l'aver amato troppo?",
      reflection: "Ai miei tempi, la lussuria era una tempesta fisica. Oggi vedo che il vostro mondo è dominato dagli schermi. Quanti tradimenti nascono non da un libro galeotto, ma da un &quot;mi piace&quot;, da un messaggio nascosto, da una chat segreta? L'illusione dell'Amore virtuale è forse meno colpevole? Che significato ha oggi la fedeltà?"
    } 
  },
  { id: "celestino_v", campaignId: "inferno", characterName: "Colui che fece il gran rifiuto (Celestino V)", canto: "Canto III", cerchio: "Ignavi", order: 1, active: true, phases: { facts: "Vissero senza infamia e senza lodo.", accusation: "Non presero mai posizione nella vita.", defense: "Non fecero del male attivamente." } },
  { id: "omero", campaignId: "inferno", characterName: "Omero", canto: "Canto IV", cerchio: "Limbo", order: 1, active: true, phases: { facts: "Poeta sommo dell'antichità, nato prima di Cristo.", accusation: "Non ha ricevuto il battesimo cristiano.", defense: "Visse una vita virtuosa e onorevole, illuminando il mondo con l'arte." } },
  { id: "ciacco", campaignId: "inferno", characterName: "Ciacco", canto: "Canto VI", cerchio: "Golosi", order: 1, active: true },
  { id: "papi_avari", campaignId: "inferno", characterName: "Papi e Cardinali", canto: "Canto VII", cerchio: "Avari", order: 1, active: true },
  { id: "filippo_argenti", campaignId: "inferno", characterName: "Filippo Argenti", canto: "Canto VIII", cerchio: "Iracondi", order: 1, active: true },
  { id: "farinata", campaignId: "inferno", characterName: "Farinata degli Uberti", canto: "Canto X", cerchio: "Eretici", order: 1, active: true },
  { id: "pier_della_vigna", campaignId: "inferno", characterName: "Pier della Vigna", canto: "Canto XIII", cerchio: "Violenti", order: 1, active: true },
  { 
    id: "ulisse", 
    campaignId: "inferno", 
    characterName: "Ulisse", 
    canto: "Canto XXVI", 
    cerchio: "Fraudolenti", 
    order: 1, 
    active: true, 
    phases: { 
      facts: "Siamo nell'ottava bolgia dell'ottavo cerchio. Qui le anime sono avvolte da fiamme a forma di lingua, simbolo della loro intelligenza usata per ingannare.<br><br>Ulisse, re di Itaca, dopo innumerevoli peripezie e inganni (tra cui il celebre Cavallo di Troia), non volle tornare a casa a godersi la vecchiaia. Radunò i suoi vecchi compagni e li convinse a oltrepassare le Colonne d'Ercole (l'attuale Stretto di Gibilterra), il limite estremo del mondo conosciuto, sfidando i divieti divini per esplorare l'ignoto.<br><br><span style='display:block; text-align:center; font-style:italic; margin: 15px 0; color: #d4af37;'>&quot;Fatti non foste a viver come bruti, ma per seguir virtute e canoscenza.&quot;</span><br>Questo celebre discorso infiammò i compagni. Il loro &quot;folle volo&quot; si concluse in tragedia quando una tempesta, voluta da Dio, fece inabissare la nave davanti alla Montagna del Purgatorio.", 
      accusation: "Costui ha usato l'astuzia non per il bene, ma per l'inganno e la rovina! Non dimentichiamo le lacrime versate a causa del Cavallo di Troia. Ma c'è di peggio: la sua arroganza! Ha creduto di potersi sostituire a Dio, ignorando i limiti imposti all'umanità. Ha sedotto i suoi stessi compagni con belle parole, conducendoli consapevolmente verso una morte certa per saziare la propria fame egoistica di grandezza.", 
      defense: "Vostro Onore, guardiamo l'altro lato della medaglia. Ulisse incarna la scintilla più pura dell'essere umano: la sete di conoscenza! Se l'umanità non avesse mai osato sfidare i propri limiti, vivremmo ancora nelle caverne. Non era un mero ingannatore, ma un esploratore. Ha sbagliato per eccesso di intelletto, ma è stata l'ambizione a spingerlo oltre le colonne, non la malvagità. Era davvero solo colpevole o semplicemente in anticipo sui tempi?",
      reflection: "Una persona supera ogni limite pur di raggiungere un obiettivo. Oltrepassa confini, sacrifica tempo e affetti, sfida l'impossibile. È coraggio? È ambizione? È imprudenza? Oggi glorifichiamo chi va su Marte o crea intelligenze artificiali. È lo stesso peccato di Ulisse?"
    } 
  },
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

    // --- DOCENTI E CLASSI ---
    saveClass: async function(classData) {
        try {
            await setDoc(doc(db, "classes", classData.id), classData);
            return classData.id;
        } catch (e) {
            console.error("Errore saveClass:", e);
            throw e;
        }
    },

    getTeacherClasses: async function(teacherEmail) {
        try {
            const q = query(collection(db, "classes"), where("teacher", "==", teacherEmail));
            const querySnapshot = await getDocs(q);
            const classes = [];
            querySnapshot.forEach((doc) => {
                classes.push(doc.data());
            });
            return classes;
        } catch (e) {
            console.error("Errore getTeacherClasses:", e);
            return [];
        }
    },

    getStudentsByClass: async function(classId) {
        try {
            const q = query(collection(db, "users"), where("classId", "==", classId), where("role", "==", "student"));
            const querySnapshot = await getDocs(q);
            const students = [];
            querySnapshot.forEach((doc) => {
                students.push(doc.data());
            });
            return students;
        } catch (e) {
            console.error("Errore getStudentsByClass:", e);
            return [];
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
