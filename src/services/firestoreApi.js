import { db } from './firebase';
import { collection, doc, getDocs, getDoc, query, where, setDoc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';

export const api = {
  // === CAMPAGNE E CASI ===
  getCampaigns: async () => {
    const q = query(collection(db, 'campaigns'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getCasesByCampaign: async (campaignId) => {
    const q = query(collection(db, 'cases'), where('campaignId', '==', campaignId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getCaseDetails: async (caseId) => {
    const caseDoc = await getDoc(doc(db, 'cases', caseId));
    if (!caseDoc.exists()) throw new Error('Caso non trovato');
    return { id: caseDoc.id, ...caseDoc.data() };
  },

  // === PROGRESSI UTENTE ===
  getUserProgress: async (userId) => {
    const q = query(collection(db, 'progress'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  updateCaseProgress: async (userId, caseId, phase, isCompleted = false) => {
    const progressId = `${userId}_${caseId}`;
    const progressRef = doc(db, 'progress', progressId);
    
    await setDoc(progressRef, {
      userId,
      caseId,
      currentPhase: phase,
      status: isCompleted ? 'completed' : 'started',
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  // === SENTENZE ===
  saveSentence: async (userId, caseId, verdictData) => {
    const sentenceRef = doc(collection(db, 'sentences'));
    await setDoc(sentenceRef, {
      userId,
      caseId,
      ...verdictData,
      timestamp: serverTimestamp()
    });
    
    // Assegna XP all'utente
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const currentXp = userDoc.data().xp || 0;
      await updateDoc(userRef, {
        xp: currentXp + (verdictData.xpEarned || 0)
      });
    }
    return sentenceRef.id;
  },

  // === CORTI PRIVATE E CLASSI ===
  joinCourt: async (userId, joinCode) => {
    // Esempio logica per codice invito
    const q = query(collection(db, 'courts'), where('joinCode', '==', joinCode));
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error('Codice Corte non valido');
    
    const courtId = snapshot.docs[0].id;
    const memberRef = doc(collection(db, 'courtMembers'));
    await setDoc(memberRef, {
      courtId,
      userId,
      role: 'member',
      joinedAt: serverTimestamp()
    });
    return courtId;
  }
};
