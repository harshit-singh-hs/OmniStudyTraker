import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBUR38m1_ioU8FKtCLh_PCzMIXSpFudPKM",
  authDomain: "omnistudytracker.firebaseapp.com",
  projectId: "omnistudytracker",
  storageBucket: "omnistudytracker.firebasestorage.app",
  messagingSenderId: "839298955075",
  appId: "1:839298955075:web:4324cf4b48a542c66661f6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error logging in:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
