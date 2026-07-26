import admin from "firebase-admin";

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
   
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function main() {
  const email = "softwareteam@outcess.com";
  const password = process.env.ADMIN_INITIAL_PASSWORD || "Admin123!";
  const displayName = "EezyHealth Admin";

  try {
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email); 
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        userRecord = await auth.createUser({
          email,
          password,
          displayName,
          emailVerified: true,
          disabled: false,
        }); 
      } else {
        throw err;
      }
    }

    const uid = userRecord.uid;
    const userDocRef = db.collection("users").doc(uid);
    const nowIso = new Date().toISOString();

    const adminProfile = {
      uid,
      email,
      display_name: displayName,
      first_name: "EezyHealth",
      last_name: "Admin",
      role: "admin",
      isActive: true,
      address: "75 opebi road ikeja, lagos",
      location: "Lagos",
      phone_number: "",
      date_of_birth: "",
      createdTime: nowIso,
    };

    await userDocRef.set(adminProfile, { merge: true });
 
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

main();

