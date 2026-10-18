import { db, doc, collection, getDoc, getDocs, query, where } from "../firebase-config.js";

export const saveClass = async function(classData) {
    // Obsolete: Class management is centralized in the Hub
    console.warn("saveClass is obsolete. Classes are managed in the Hub.");
    return classData.id;
};

export const getClassById = async function(id) {
    try {
        const docSnap = await getDoc(doc(db, "hub_classes", id));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (e) {
        console.error("Errore getClassById:", e);
        return null;
    }
};

export const getClassByCode = async function(code) {
    try {
        const q = query(collection(db, "hub_classes"), where("code", "==", code.toUpperCase()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        }
        return null;
    } catch (e) {
        console.error("Errore getClassByCode:", e);
        return null;
    }
};

export const getTeacherClasses = async function(teacherEmail, teacherUid = null) {
    try {
        if (!teacherEmail && !teacherUid) return [];
        const emailLower = teacherEmail ? teacherEmail.toLowerCase().trim() : '';
        const isSuperAdmin = (emailLower === 'prof.memmo@gmail.com');

        const classesMap = new Map();

        if (isSuperAdmin) {
            const snap = await getDocs(collection(db, "hub_classes")).catch(() => ({ empty: true, docs: [] }));
            snap.forEach(d => {
                classesMap.set(d.id, { id: d.id, ...d.data() });
            });
        } else {
            const queries = [];
            if (teacherUid) {
                queries.push(query(collection(db, "hub_classes"), where("teacherId", "==", teacherUid)));
            }
            if (emailLower) {
                queries.push(query(collection(db, "hub_classes"), where("teacherEmail", "==", emailLower)));
                queries.push(query(collection(db, "hub_classes"), where("collaboratori", "array-contains", emailLower)));
                queries.push(query(collection(db, "hub_classes"), where("teacher", "==", emailLower)));
                queries.push(query(collection(db, "hub_classes"), where("collaborators", "array-contains", emailLower)));
            }

            for (const q of queries) {
                try {
                    const snap = await getDocs(q);
                    snap.forEach(d => {
                        classesMap.set(d.id, { id: d.id, ...d.data() });
                    });
                } catch (e) {
                    console.warn("Query hub_classes warning:", e);
                }
            }
        }

        return Array.from(classesMap.values());
    } catch (e) {
        console.error("Errore getTeacherClasses:", e);
        return [];
    }
};

export const joinClassAsCollaborator = async function() {
    // Obsolete: Class management is centralized in the Hub
    console.warn("joinClassAsCollaborator is obsolete. Collaborators are managed in the Hub.");
    return false;
};

export const getStudentsByClass = async function(classId, classCode = null) {
    try {
        const students = [];
        const seenIds = new Set();

        // 1. Dalla classe in hub_classes
        if (classId) {
            const cDoc = await getDoc(doc(db, "hub_classes", classId)).catch(() => null);
            if (cDoc && cDoc.exists()) {
                const cData = cDoc.data();
                const rawList = Array.isArray(cData.students) ? cData.students : (Array.isArray(cData.roster) ? cData.roster : []);
                rawList.forEach(s => {
                    if (s) {
                        const sid = typeof s === 'object' ? (s.id || s.uid || s.studentId || s.email) : s;
                        const sname = typeof s === 'object' ? (s.name || s.displayName || s.email) : s;
                        if (sid && !seenIds.has(sid)) {
                            seenIds.add(sid);
                            students.push({
                                id: sid,
                                name: sname,
                                email: typeof s === 'object' ? (s.email || '') : '',
                                xp: typeof s === 'object' ? (s.xp || s.points || 0) : 0,
                                level: typeof s === 'object' ? (s.level || 'Pellegrino') : 'Pellegrino'
                            });
                        }
                    }
                });
            }
        }

        // 2. Dalla collezione users
        try {
            const queries = [];
            if (classId) {
                queries.push(query(collection(db, "users"), where("classId", "==", classId)));
            }
            if (classCode) {
                queries.push(query(collection(db, "users"), where("classCode", "==", classCode.toUpperCase())));
                queries.push(query(collection(db, "users"), where("code", "==", classCode.toUpperCase())));
            }
            for (const q of queries) {
                const snap = await getDocs(q).catch(() => ({ docs: [] }));
                snap.forEach(d => {
                    const u = d.data();
                    if (u.role === 'teacher' || u.role === 'docente' || u.role === 'admin') return;
                    if (!seenIds.has(d.id)) {
                        seenIds.add(d.id);
                        students.push({
                            id: d.id,
                            name: u.name || u.displayName || 'Studente',
                            email: u.email || '',
                            xp: u.xp || u.points || 0,
                            level: u.level || 'Pellegrino'
                        });
                    }
                });
            }
        } catch (err) {
            console.warn("Query users for class warning:", err);
        }

        return students;
    } catch (e) {
        console.error("Errore getStudentsByClass:", e);
        return [];
    }
};
