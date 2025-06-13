import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  // Replace these with your actual Firebase config values
  apiKey: "AIzaSyBjGEuLSpruUucknYXyHEeqbXi8ihr2EOc",
  authDomain: "period-tracker-e6144.firebaseapp.com",
  projectId: "period-tracker-e6144",
  storageBucket: "period-tracker-e6144.firebasestorage.app",
  messagingSenderId: "55556853672",
  appId: "1:55556853672:web:269c2afa226159f508579d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
