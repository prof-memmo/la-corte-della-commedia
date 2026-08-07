import { db, doc, getDoc, setDoc } from "../firebase-config.js";\nimport { collection, getDocs, query, where, orderBy, updateDoc, or, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";\n\nexport const getCampaigns = async function() {
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
        };\n
\n\nexport const getCasesByCampaign = async function(campaignId) {
        if (this.cache.cases && this.cache.cases.length > 0) {
            const cachedCases = this.cache.cases.filter(c => c.campaignId === campaignId);
            if (cachedCases.length > 0) return cachedCases;
        };\n
\n\nexport const saveSentence = async function(sentenceData) {
        try {
            const newDocRef = doc(collection(db, "sentences"));
            await setDoc(newDocRef, sentenceData);
            return newDocRef.id;
        } catch (e) {
            console.error("Errore salvataggio sentenza:", e);
            return null;
        };\n
\n\nexport const getCaseStats = async function(caseId, classCode = null) {
        try {
            let sentencesQuery = query(collection(db, "sentences"), where("caseId", "==", caseId));
            if (classCode) {
                sentencesQuery = query(collection(db, "sentences"), where("caseId", "==", caseId), where("classCode", "==", classCode));
            };\n
\n\nexport const getUserSentences = async function(uid) {
        try {
            const sentencesQuery = query(collection(db, "sentences"), where("uid", "==", uid));
            const querySnapshot = await getDocs(sentencesQuery);
            const verdicts = [];
            querySnapshot.forEach((doc) => {
                verdicts.push(doc.data());
            });
            // sort by timestamp descending locally since we didn't setup composite indexes
            verdicts.sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            return verdicts;
        } catch (e) {
            console.error("Errore recupero user sentences:", e);
            return [];
        };\n
\n\nexport const getRawVerdicts = async function(caseId, classCode = null) {
        try {
            let sentencesQuery = query(collection(db, "sentences"), where("caseId", "==", caseId));
            if (classCode) {
                sentencesQuery = query(collection(db, "sentences"), where("caseId", "==", caseId), where("classCode", "==", classCode));
            };\n
\n