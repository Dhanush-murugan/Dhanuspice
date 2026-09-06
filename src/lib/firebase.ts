import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { User } from "@/types";

// Firebase configuration with environment variables and safe defaults
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyD1J-ZTQUfEuEoTKZNx8VDnYU0panTQeAE",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "dhanushspice.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dhanushspice",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "dhanushspice.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "705936144857",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:705936144857:web:4bde5bde497ed2f9d581c8",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-J4D9PKR8S8",
};

// Initialize Firebase singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Safe client-side analytics initialization
export let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Ignore unsupported environments
    });
}

// Demo user for instant zero-friction testing
export const DEMO_USER: User = {
  uid: "demo-customer-001",
  email: "demo@dhanuspice.com",
  displayName: "Dhanush Kumar",
  phone: "9876543210",
  addresses: [
    {
      id: "addr-1",
      label: "Home",
      fullAddress: "123 Spice Garden, MG Road, Bangalore, Karnataka",
      landmark: "Near Central Mall",
      pincode: "560001",
      coordinates: {
        lat: 12.9716,
        lng: 77.5946,
      },
      isDefault: true,
    },
  ],
  savedRestaurants: ["1", "2"],
  createdAt: new Date(),
};

/**
 * Format Firebase Auth errors into clear, friendly user messages.
 */
export function formatFirebaseAuthError(error: any): string {
  const code = error?.code || "";
  const msg = error?.message || "";

  if (code === "auth/invalid-credential" || msg.includes("auth/invalid-credential")) {
    return "Invalid email or password. Please check your credentials.";
  }
  if (code === "auth/user-not-found" || msg.includes("user-not-found")) {
    return "No account found with this email. Please sign up.";
  }
  if (code === "auth/wrong-password" || msg.includes("wrong-password")) {
    return "Incorrect password. Please try again.";
  }
  if (code === "auth/email-already-in-use" || msg.includes("email-already-in-use")) {
    return "An account with this email already exists. Please log in instead.";
  }
  if (code === "auth/weak-password" || msg.includes("weak-password")) {
    return "Password is too weak. Please use at least 6 characters.";
  }
  if (code === "auth/invalid-email" || msg.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (code === "auth/network-request-failed" || msg.includes("network-request-failed")) {
    return "Network connection error. Please check your internet connection.";
  }
  if (code === "auth/popup-closed-by-user" || msg.includes("popup-closed-by-user")) {
    return "Google sign-in popup was closed before completing.";
  }
  if (msg.toLowerCase().includes("offline") || code === "unavailable") {
    return "Database is offline or connecting slowly. Continuing in offline mode.";
  }
  return msg || "Authentication failed. Please try again.";
}

/**
 * Resilient Firestore getDoc with offline fallback and timeout protection.
 */
export async function safeGetDoc(
  collectionName: string,
  docId: string,
  timeoutMs = 2500
): Promise<any | null> {
  const cacheKey = `dhanuspice_${collectionName}_${docId}`;

  const fetchPromise = (async () => {
    try {
      const docRef = doc(db, collectionName, docId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
          } catch {
            // Ignore storage quota errors
          }
        }
        return data;
      }
      return null;
    } catch (err: any) {
      console.warn(`[Firestore] safeGetDoc error for ${collectionName}/${docId}:`, err?.message);
      return null;
    }
  })();

  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), timeoutMs);
  });

  const result = await Promise.race([fetchPromise, timeoutPromise]);
  if (result) return result;

  // Fall back to local storage cache if available
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore parse errors
    }
  }

  return null;
}

/**
 * Resilient Firestore setDoc with local storage cache backup and timeout protection.
 */
export async function safeSetDoc(
  collectionName: string,
  docId: string,
  data: any,
  timeoutMs = 2500
): Promise<boolean> {
  const cacheKey = `dhanuspice_${collectionName}_${docId}`;

  // Always back up locally first
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }

  const setPromise = (async () => {
    try {
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, data, { merge: true });
      return true;
    } catch (err: any) {
      console.warn(`[Firestore] safeSetDoc offline/failed for ${collectionName}/${docId}:`, err?.message);
      return false;
    }
  })();

  const timeoutPromise = new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(false), timeoutMs);
  });

  return await Promise.race([setPromise, timeoutPromise]);
}

export default app;
