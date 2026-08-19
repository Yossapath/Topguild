const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBXPfxhSLBt9dQqf5glFrXvx6KLxqPmEE8",
  authDomain: "topguild-eeb40.firebaseapp.com",
  projectId: "topguild-eeb40",
  storageBucket: "topguild-eeb40.firebasestorage.app",
  messagingSenderId: "879954426796",
  appId: "1:879954426796:web:48e305dc9f78bda6a51809"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnection() {
  console.log("Connecting to Firebase Firestore...");
  try {
    const docRef = doc(db, 'guild_system', 'roster');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("SUCCESS! Roster doc exists:", Object.keys(docSnap.data().data || {}).length, "jobs found.");
    } else {
      console.log("Doc does not exist, creating default roster...");
      await setDoc(docRef, { data: { test: true } });
      console.log("SUCCESS! Created document in Firestore!");
    }
  } catch (err) {
    console.error("Firestore connection error:", err);
  }
}

testConnection();
