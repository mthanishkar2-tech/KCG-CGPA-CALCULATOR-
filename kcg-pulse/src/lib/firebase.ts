import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCtAdz2Z8EDQ2B0WME-VkE9xpRAdM-rut4",
  authDomain: "kcg-cgpa-calculator.firebaseapp.com",
  projectId: "kcg-cgpa-calculator",
  storageBucket: "kcg-cgpa-calculator.firebasestorage.app",
  messagingSenderId: "399365531411",
  appId: "1:399365531411:web:8ba3ee310a4901d8cd9ce6",
  measurementId: "G-8P79KRGBXK"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Enable Offline Persistence (IndexedDB) and Long Polling
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    experimentalForceLongPolling: true
  });
} catch (e) {
  // Fallback if already initialized in hot-reload
  db = getFirestore(app);
}

export { app, auth, db };
