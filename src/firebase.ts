import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCkIKlazu_avLDkLz_omcY7_UClR31ezuQ",
    authDomain: "trivia-game-cb9e0.firebaseapp.com",
    projectId: "trivia-game-cb9e0",
    storageBucket: "trivia-game-cb9e0.firebasestorage.app",
    messagingSenderId: "266951931350",
    appId: "1:266951931350:web:5572788d469fad31b0a077"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

signInAnonymously(auth).then((user) => {
  console.log("User signed in anonymously", user);
});

export { auth, db };