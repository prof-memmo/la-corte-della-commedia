import urllib.request
import json
import datetime

API_KEY = "AIzaSyCgz52XehTx0qQQ1MkKtTnIM5LmjJKcPls"
PROJECT_ID = "la-corte-della-commedia"

accounts = [
  { "email": "prof.memmo@lacorte.it", "password": "password123", "role": "teacher", "name": "Prof. Memmo" },
  { "email": "studente.test@lacorte.it", "password": "password123", "role": "student", "name": "Studente Test" },
  { "email": "esterno.test@lacorte.it", "password": "password123", "role": "external", "name": "Visitatore Test" }
]

def request(url, method, data):
    req = urllib.request.Request(url, method=method)
    req.add_header('Content-Type', 'application/json')
    body = json.dumps(data).encode('utf-8')
    try:
        with urllib.request.urlopen(req, body) as f:
            return json.loads(f.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode('utf-8'))

print("Creating TEST-CLASS...")
classData = {
    "fields": {
        "name": { "stringValue": "Classe di Test (3^A)" },
        "teacher": { "stringValue": "prof.memmo@lacorte.it" },
        "code": { "stringValue": "TEST1234" }
    }
}
fsRes = request(f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/classes/TEST-CLASS", "PATCH", classData)
print(fsRes.get("name", "Class update OK"))

for acc in accounts:
    print("Processing", acc["email"])
    signup_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={API_KEY}"
    signupData = request(signup_url, "POST", {"email": acc["email"], "password": acc["password"], "returnSecureToken": True})
    
    if "error" in signupData and signupData["error"].get("message") == "EMAIL_EXISTS":
        print("- Already exists, getting UID via login...")
        signin_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"
        signinData = request(signin_url, "POST", {"email": acc["email"], "password": acc["password"], "returnSecureToken": True})
        if "localId" not in signinData:
            print("- Failed to login")
            continue
        uid = signinData["localId"]
    elif "error" in signupData:
        print("- Error:", signupData["error"])
        continue
    else:
        uid = signupData["localId"]
        
    print("- UID:", uid)
    
    firestoreUrl = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/users/{uid}"
    docData = {
        "fields": {
            "email": { "stringValue": acc["email"] },
            "role": { "stringValue": acc["role"] },
            "name": { "stringValue": acc["name"] },
            "displayName": { "stringValue": acc["name"] },
            "createdAt": { "timestampValue": datetime.datetime.utcnow().isoformat() + "Z" }
        }
    }
    
    if acc["role"] == "student":
        docData["fields"]["classId"] = { "stringValue": "TEST-CLASS" }
        docData["fields"]["xp"] = { "integerValue": "0" }
        docData["fields"]["level"] = { "integerValue": "1" }
        
    fsData = request(firestoreUrl, "PATCH", docData)
    if "error" in fsData:
        print("- Error Firestore:", fsData["error"])
    else:
        print("- Successfully setup Firestore document")
