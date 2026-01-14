import admin from "firebase-admin";

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("GOOGLE_APPLICATION_CREDENTIALS is not set.");
  console.error(
    "Set it to the path of your service account JSON, e.g.:"
  );
  console.error(
    'export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"'
  );
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
      console.log("User already exists in Auth:", userRecord.uid);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        userRecord = await auth.createUser({
          email,
          password,
          displayName,
          emailVerified: true,
          disabled: false,
        });
        console.log("Created new Auth user:", userRecord.uid);
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
      address: "",
      location: "",
      phone_number: "",
      date_of_birth: "",
      createdTime: nowIso,
    };

    await userDocRef.set(adminProfile, { merge: true });

    console.log("Admin profile created/updated in Firestore `users` collection.");
    console.log("You can now log in as:", email);
    console.log("Initial password:", password);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

main();

