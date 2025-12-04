// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9l4_7gCDNoVAuky6VaC7mW_ksAmCW8H8",
  authDomain: "gen-lang-client-0390401818.firebaseapp.com",
  projectId: "gen-lang-client-0390401818",
  storageBucket: "gen-lang-client-0390401818.firebasestorage.app",
  messagingSenderId: "416820105726",
  appId: "1:416820105726:web:f1f4c384bf6414b7d7f0af",
  measurementId: "G-MQKNJ7WZ4K"
};

// Initialize Firebase
let app;
let db: any;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
} catch (e) {
    console.error("Firebase initialization error:", e);
    // Fallback to null db so app can degrade to mock mode if needed
    db = null;
}

export { db };