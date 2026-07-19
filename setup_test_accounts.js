const API_KEY = "AIzaSyCgz52XehTx0qQQ1MkKtTnIM5LmjJKcPls";
const PROJECT_ID = "la-corte-della-commedia";

const accounts = [
  { email: "prof.memmo@lacorte.it", password: "password123", role: "teacher", name: "Prof. Memmo" },
  { email: "studente.test@lacorte.it", password: "password123", role: "student", name: "Studente Test" },
  { email: "esterno.test@lacorte.it", password: "password123", role: "external", name: "Visitatore Test" }
];

async function createAccount(acc) {
  console.log(`Processing ${acc.email}...`);
  // 1. Sign up user
  const signupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: acc.email, password: acc.password, returnSecureToken: true })
  });
  
  const signupData = await signupRes.json();
  
  if (signupData.error && signupData.error.message === 'EMAIL_EXISTS') {
     console.log(`- ${acc.email} already exists. Getting UID via login...`);
     const signinRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: acc.email, password: acc.password, returnSecureToken: true })
     });
     const signinData = await signinRes.json();
     if (!signinData.localId) {
         console.error("- Failed to sign in existing user:", signinData);
         return;
     }
     signupData.localId = signinData.localId;
  } else if (signupData.error) {
     console.error("- Error creating user:", signupData.error);
     return;
  }

  const uid = signupData.localId;
  console.log(`- UID: ${uid}`);
  
  // 2. Add to Firestore
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${uid}`;
  
  const docData = {
    fields: {
      email: { stringValue: acc.email },
      role: { stringValue: acc.role },
      name: { stringValue: acc.name },
      displayName: { stringValue: acc.name },
      createdAt: { timestampValue: new Date().toISOString() }
    }
  };
  
  // If student, link to the teacher's class
  // Wait, does prof.memmo have a class? Let's just create a mock class for testing
  if (acc.role === "student") {
      docData.fields.classId = { stringValue: "TEST-CLASS" };
      docData.fields.xp = { integerValue: "0" };
      docData.fields.level = { integerValue: "1" };
  }
  
  const fsRes = await fetch(firestoreUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(docData)
  });
  
  const fsData = await fsRes.json();
  if (fsData.error) {
      console.error("- Error writing to Firestore:", fsData.error);
  } else {
      console.log(`- Successfully setup Firestore document for: ${acc.email}`);
  }
}

async function main() {
  // Let's also create the mock class in Firestore so the teacher sees the student
  const classData = {
    fields: {
      name: { stringValue: "Classe di Test (3^A)" },
      teacher: { stringValue: "prof.memmo@lacorte.it" },
      code: { stringValue: "TEST1234" }
    }
  };
  
  console.log("Creating TEST-CLASS...");
  await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/classes/TEST-CLASS`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(classData)
  });

  for (const acc of accounts) {
      await createAccount(acc);
  }
  console.log("Done.");
}

main();
