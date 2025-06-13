
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace these placeholder values with your actual Firebase project configuration
// You can find these values in your Firebase Console > Project Settings > General tab
const firebaseConfig = {
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
