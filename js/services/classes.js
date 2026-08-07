import { db, doc, getDoc, setDoc } from "../firebase-config.js";\nimport { collection, getDocs, query, where, orderBy, updateDoc, or, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";\n\nexport const saveClass = async function(classData) {
        try {
            await setDoc(doc(db, "classes", classData.id), classData);
            return classData.id;
        } catch (e) {
            console.error("Errore saveClass:", e);
            throw e;
        };\n
\n\nexport const getClassById = async function(id) {
        try {
            const docSnap = await getDoc(doc(db, "classes", id));
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            };\n
\n\nexport const getClassByCode = async function(code) {
        try {
            const q = query(collection(db, "classes"), where("code", "==", code.toUpperCase()));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
            };\n
\n\nexport const getTeacherClasses = async function(teacherEmail) {
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
            // --- MOCK CLASS ---
            if (teacherEmail === "prof.memmo@lacorte.it") {
                if (!classes.find(c => c.id === "TEST-CLASS")) {
                    classes.push({ id: "TEST-CLASS", name: "Classe di Test (3^A)", code: "TEST1234", teacher: "prof.memmo@lacorte.it" });
                };\n
\n\nexport const joinClassAsCollaborator = async function(classId, teacherEmail) {
        try {
            const docRef = doc(db, "classes", classId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                throw new Error("Classe non trovata.");
            };\n
\n\nexport const getStudentsByClass = async function(classId) {
        try {
            const q = query(collection(db, "users"), where("classId", "==", classId), where("role", "==", "student"));
            const querySnapshot = await getDocs(q);
            const students = [];
            querySnapshot.forEach((doc) => {
                students.push(doc.data());
            });
            // --- MOCK STUDENTS ---
            if (classId === "TEST-CLASS") {
                if (!students.find(s => s.email === "studente.test@lacorte.it")) {
                    students.push({ id: "mock-student", uid: "mock-student", email: "studente.test@lacorte.it", displayName: "Studente Test", role: "student", classId: "TEST-CLASS", level: 1, xp: 0 });
                };\n
\n