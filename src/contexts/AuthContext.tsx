"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import {
  onAuthStateChange,
  signInWithGoogle,
  signOutUser,
  db,
  fetchUserData,
} from "@/lib/firebase";

interface UserInfo {
  uid: string;
  email: string;
  display_name: string;
  photo_url?: string;
  role: "admin" | "doctor" | "nurse";
  phone_number?: string;
  address?: string;
  date_of_birth?: string | { seconds: number; nanoseconds: number }; // Firestore timestamp
  first_name?: string;
  last_name?: string;
  location?: string;
  isActive?: boolean;
  password?: string;
  confirmPassword?: string;
  createdTime?: string | { seconds: number; nanoseconds: number }; // Firestore timestamp
  // Legacy fields for backward compatibility
  displayName?: string;
  photoURL?: string;
  phone?: string;
  dateOfBirth?: string;
  specialization?: string;
  bio?: string;
  about?: string;
  experience_yrs?: string;
  hospital?: string;
  license?: string;
  gender?: string;
  title?: string;
  preferences?: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

interface AuthContextType {
  user: User | null;
  userInfo: UserInfo | null;
  loading: boolean;
  userInfoLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  setUserInfo: (userInfo: UserInfo | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInfoLoading, setUserInfoLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing user info
    const storedUserInfo = localStorage.getItem("userInfo-eezy-health");
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
        setUserInfoLoading(false);
      } catch (error) {
        console.error("Error parsing stored user info:", error);
        localStorage.removeItem("userInfo-eezy-health");
      }
    } else {
      // If no local storage, wait for auth to init
      setUserInfoLoading(true);
    }

    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      if (!user) {
        setUserInfoLoading(false);
        setUserInfo(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch fresh user info from Firestore when user changes
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (user) {
        setUserInfoLoading(true);
        try {
          const { collection, query, where, getDocs } = await import("firebase/firestore");
          // Use fetchUserData to be consistent with login logic (handles docId != uid)
          const data = await fetchUserData(user.uid);

          if (data) {
            let roleSpecificData = {};
            try {
              if (data.role === "doctor") {
                const docProfilesRef = collection(db, "doctorProfiles");
                const q = query(docProfilesRef, where("doctorId", "==", user.uid));
                const snap = await getDocs(q);
                if (!snap.empty) {
                  roleSpecificData = snap.docs[0].data();
                }
              } else if (data.role === "nurse") {
                const nurseProfilesRef = collection(db, "nurseProfiles");
                const q = query(nurseProfilesRef, where("nurseId", "==", user.uid));
                const snap = await getDocs(q);
                if (!snap.empty) {
                  roleSpecificData = snap.docs[0].data();
                }
              }
            } catch (err) {
              console.error("Error fetching role specific profile:", err);
            }

            // Merge the base user doc with the role-specific profile such that a
            // NON-EMPTY value always wins, regardless of which source it comes
            // from. Previously roleSpecificData was spread last and would
            // overwrite good `users` fields (e.g. specialization, hospital) with
            // empty values from the doctorProfiles/nurseProfiles doc — which made
            // the completeness check report "Profile Incomplete" even after the
            // user had filled everything in Settings.
            const isFilled = (v: unknown) =>
              v !== undefined && v !== null && v !== "";
            const mergedProfile: Record<string, unknown> = { ...data };
            Object.entries(roleSpecificData as Record<string, unknown>).forEach(
              ([key, value]) => {
                if (isFilled(value)) {
                  mergedProfile[key] = value;
                }
              }
            );

            const fullUserInfo = {
              ...mergedProfile,
              uid: user.uid,
              email: user.email || data.email,
              displayName: user.displayName || data.displayName || data.display_name || (roleSpecificData as any).display_name,
              photoURL: user.photoURL || data.photoURL || data.photo_url || (roleSpecificData as any).photo_url,
            };

            setUserInfo(fullUserInfo as UserInfo);
            localStorage.setItem(
              "userInfo-eezy-health",
              JSON.stringify(fullUserInfo)
            );
          } else {
            console.warn("User document not found via fetchUserData");
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
        } finally {
          setUserInfoLoading(false);
        }
      }
    };

    fetchUserInfo();
  }, [user]);

  const signIn = async () => {
    await signInWithGoogle();
  };

  const signOut = async () => {
    try {
      await signOutUser();
      // Clear localStorage and user info
      localStorage.removeItem("userInfo-eezy-health");
      setUserInfo(null);
      setUserInfoLoading(false);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const value = {
    user,
    userInfo,
    loading,
    userInfoLoading,
    signIn,
    signOut,
    setUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
