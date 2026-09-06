"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, safeGetDoc, DEMO_USER } from "@/lib/firebase";
import { useStore } from "@/store/useStore";
import { User } from "@/types";

export default function AuthSync() {
  const { setUser, setIsAuthenticated } = useStore();

  useEffect(() => {
    // 1. Check local storage cache on initial client mount
    if (typeof window !== "undefined") {
      try {
        const isDemo = localStorage.getItem("dhanuspice_demo_auth");
        const cachedUserStr = localStorage.getItem("dhanuspice_current_user");

        if (isDemo === "true") {
          setUser(DEMO_USER);
          setIsAuthenticated(true);
          return;
        }

        if (cachedUserStr) {
          const cachedUser = JSON.parse(cachedUserStr);
          if (cachedUser && cachedUser.uid) {
            setUser(cachedUser);
            setIsAuthenticated(true);
          }
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    // 2. Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let profile: User | null = await safeGetDoc("users", firebaseUser.uid, 2000);

        if (!profile) {
          profile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName:
              firebaseUser.displayName ||
              firebaseUser.email?.split("@")[0] ||
              "Customer",
            phone: firebaseUser.phoneNumber || "",
            addresses: [],
            savedRestaurants: [],
            createdAt: new Date(),
          };
        }

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("dhanuspice_current_user", JSON.stringify(profile));
          } catch {
            // ignore
          }
        }

        setUser(profile);
        setIsAuthenticated(true);
      } else {
        // Only clear if not in local demo mode
        if (typeof window !== "undefined") {
          const isDemo = localStorage.getItem("dhanuspice_demo_auth");
          if (isDemo !== "true") {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("dhanuspice_current_user");
          }
        }
      }
    });

    return () => unsubscribe();
  }, [setUser, setIsAuthenticated]);

  return null;
}
