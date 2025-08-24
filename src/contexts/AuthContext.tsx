"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import {
  auth,
  onAuthStateChange,
  signInWithGoogle,
  signOutUser,
} from "@/lib/firebase";

interface UserInfo {
  uid: string;
  email: string;
  display_name: string;
  photo_url?: string;
  role: "ADMIN" | "DOCTOR" | "NURSE";
  phone_number?: string;
  address?: string;
  date_of_birth?: any; // Firestore timestamp
  first_name?: string;
  last_name?: string;
  location?: string;
  isActive?: boolean;
  password?: string;
  confirmPassword?: string;
  createdTime?: any; // Firestore timestamp
  // Legacy fields for backward compatibility
  displayName?: string;
  photoURL?: string;
  phone?: string;
  dateOfBirth?: string;
  specialization?: string;
  bio?: string;
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
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
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

  useEffect(() => {
    // Check localStorage for existing user info
    const storedUserInfo = localStorage.getItem("userInfo-eezy-health");
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
      } catch (error) {
        console.error("Error parsing stored user info:", error);
        localStorage.removeItem("userInfo-eezy-health");
      }
    }

    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      // Clear localStorage and user info
      localStorage.removeItem("userInfo-eezy-health");
      setUserInfo(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const value = {
    user,
    userInfo,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
