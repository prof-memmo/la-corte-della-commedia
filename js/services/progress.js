import { cache } from "./cache.js";
import { db, doc, collection, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, or, arrayUnion } from "../firebase-config.js";

export const getCampaigns = async function() {
        if (cache.campaigns.length > 0) return cache.campaigns;
        
        try {
            const q = query(collection(db, "campaigns"), orderBy("order", "asc"));
            const querySnapshot = await getDocs(q);
            const campaigns = [];
            querySnapshot.forEach((doc) => {
                campaigns.push({ id: doc.id, ...doc.data() });
            });
            cache.campaigns = campaigns;
            return campaigns;
        } catch (e) {
            console.error("Errore fetch campagne:", e);
            return [];
        }
    };

export const getCasesByCampaign = async function(campaignId) {
        if (cache.cases && cache.cases.length > 0) {
            const cachedCases = cache.cases.filter(c => c.campaignId === campaignId);
            if (cachedCases.length > 0) return cachedCases;
        }

        try {
            const q = query(collection(db, "cases"), where("campaignId", "==", campaignId));
            const querySnapshot = await getDocs(q);
            const cases = [];
            querySnapshot.forEach((doc) => {
                cases.push({ id: doc.id, ...doc.data() });
            });
            cache.cases = cache.cases.concat(cases);
            return cases;
        } catch (e) {
            console.error("Errore fetch casi:", e);
            return [];
        }
    };

export const saveSentence = async function(sentenceData) {
        try {
            const newDocRef = doc(collection(db, "sentences"));
            await setDoc(newDocRef, sentenceData);
            return newDocRef.id;
        } catch (e) {
            console.error("Errore salvataggio sentenza:", e);
            return null;
        }
    };

export const getCaseStats = async function(caseId, classCode = null) {
        try {
            let sentencesQuery = query(collection(db, "sentences"), where("caseId", "==", caseId));
            if (classCode) {
                sentencesQuery = query(collection(db, "sentences"), where("caseId", "==", caseId), where("classCode", "==", classCode));
            }
            
            const querySnapshot = await getDocs(sentencesQuery);
            
            const stats = {
                conferma: 0,
                riduzione: 0,
                aggravo: 0,
                assoluzione: 0,
                total: 0,
                motivations: []
            };

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                stats.total++;
                if (data.verdict === 'conferma') stats.conferma++;
                if (data.verdict === 'riduzione') stats.riduzione++;
                if (data.verdict === 'aggravo') stats.aggravo++;
                if (data.verdict === 'assoluzione') stats.assoluzione++;
                
                if (data.motivation && data.motivation.trim() !== '') {
                    stats.motivations.push(data.motivation);
                }
            });
            
            return stats;
        } catch (e) {
            console.error("Errore recupero statistiche:", e);
            return { conferma: 0, riduzione: 0, aggravo: 0, assoluzione: 0, total: 0, motivations: [] };
        }
    };

export const getUserSentences = async function(uid) {
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
        }
    };

export const getRawVerdicts = async function(caseId, classCode = null) {
        try {
            let sentencesQuery = query(collection(db, "sentences"), where("caseId", "==", caseId));
            if (classCode) {
                sentencesQuery = query(collection(db, "sentences"), where("caseId", "==", caseId), where("classCode", "==", classCode));
            }
            const querySnapshot = await getDocs(sentencesQuery);
            const verdicts = [];
            querySnapshot.forEach((doc) => {
                verdicts.push(doc.data());
            });
            return verdicts;
        } catch (e) {
            console.error("Errore recupero raw verdicts:", e);
            return [];
        }
    };

