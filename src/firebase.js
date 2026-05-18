import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
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
  const isMobileOrCapacitor = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.Capacitor;
  
  if (isMobileOrCapacitor) {
    try {
      await signInWithRedirect(auth, googleProvider);
      return { user: null, redirectTriggered: true, error: null };
    } catch (error) {
      console.error("Redirect login error:", error);
      return { user: null, redirectTriggered: false, error };
    }
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, redirectTriggered: false, error: null };
  } catch (error) {
    console.error("Popup login error, trying redirect fallback:", error);
    if (error.code === "auth/popup-blocked" || error.code === "auth/cancelled-popup-request") {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { user: null, redirectTriggered: true, error: null };
      } catch (redirectError) {
        return { user: null, redirectTriggered: false, error: redirectError };
      }
    }
    return { user: null, redirectTriggered: false, error };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
