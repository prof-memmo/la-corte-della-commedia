import { db, doc, collection, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, or, arrayUnion } from "../firebase-config.js";

export const saveClass = async function(classData) {
        try {
            await setDoc(doc(db, "classes", classData.id), classData);
            return classData.id;
        } catch (e) {
            console.error("Errore saveClass:", e);
            throw e;
        }
    };

export const getClassById = async function(id) {
        try {
            const docSnap = await getDoc(doc(db, "classes", id));
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
            const q = query(collection(db, "classes"), where("code", "==", code.toUpperCase()));
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

export const getTeacherClasses = async function(teacherEmail) {
        try {
            const q = query(
                collection(db, "classes"), 
                or(
                    where("teacher", "==", teacherEmail),
                    where("collaborators", "array-contains", teacherEmail)
                )
            );
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
    };

export const joinClassAsCollaborator = async function(classId, teacherEmail) {
        try {
            const docRef = doc(db, "classes", classId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                throw new Error("Classe non trovata.");
            }
            const data = docSnap.data();
            if (data.teacher === teacherEmail) {
                throw new Error("Sei già il docente principale di questa classe.");
            }
            if (data.collaborators && data.collaborators.includes(teacherEmail)) {
                throw new Error("Sei già un collaboratore di questa classe.");
            }
            await updateDoc(docRef, {
                collaborators: arrayUnion(teacherEmail)
            });
            return true;
        } catch (e) {
            console.error("Errore joinClassAsCollaborator:", e);
            throw e;
        }
    };

export const getStudentsByClass = async function(classId) {
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
    };

