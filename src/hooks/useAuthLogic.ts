import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, fetchUserData } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { toast } from "sonner";

export const useAuthLogic = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("eezy Health | Dashboard");

  // Set document title
  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    // This will run when the page first loads
    if (window.location.pathname === "/") {
      setTitle("eezy Health | Login");
    }
  }, []); // Only run once on mount

  useEffect(() => {
    // Check if user is already logged in
    const userInfo = localStorage.getItem("userInfo-eezy-health");
    if (userInfo) {
      const parsedUserInfo = JSON.parse(userInfo);
      // Redirect based on role
      if (parsedUserInfo.role === "ADMIN") {
        router.push("/admin");
      } else if (parsedUserInfo.role === "DOCTOR") {
        router.push("/doctor");
      } else if (parsedUserInfo.role === "NURSE") {
        router.push("/nurse");
      }
    }
  }, [router]);

  const handleSignInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();

      // Sign in with Google using Firebase Auth
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Fetch user information from Firestore
      const userData = await fetchUserData(user.uid);

      // Store user information locally
      localStorage.setItem("userInfo-eezy-health", JSON.stringify(userData));

      // Navigate based on role
      if (userData.role === "admin") {
        router.push("/admin");
      } else if (userData.role === "doctor") {
        router.push("/doctor");
      } else if (userData.role === "nurse") {
        router.push("/nurse");
      } else {
        throw new Error("Invalid user role");
      }
    } catch (error: unknown) {
      // Suppress Firebase console errors by not logging them
      // The error is already handled by Firebase internally

      // Handle Firebase Auth errors specifically
      if (error && typeof error === "object" && "code" in error) {
        const firebaseError = error as { code: string; message?: string };

        switch (firebaseError.code) {
          case "auth/popup-closed-by-user":
            toast.error("Sign-in was cancelled. Please try again.");
            break;
          case "auth/popup-blocked":
            toast.error(
              "Pop-up was blocked. Please allow pop-ups and try again."
            );
            break;
          case "auth/cancelled-popup-request":
            toast.error("Sign-in was cancelled. Please try again.");
            break;
          case "auth/network-request-failed":
            toast.error("Network error. Please check your connection.");
            break;
          case "auth/account-exists-with-different-credential":
            toast.error(
              "An account already exists with this email using a different sign-in method."
            );
            break;
          default:
            toast.error("Google sign-in failed. Please try again.");
        }
      } else {
        // Handle non-Firebase errors
        const errorMessage =
          error instanceof Error ? error.message : "Sign-in failed";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sign in the user with email and password using Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch user information from Firestore
      const userData = await fetchUserData(user.uid);

      // Store user information locally
      localStorage.setItem("userInfo-eezy-health", JSON.stringify(userData));

      // Navigate based on role
      if (userData.role === "admin") {
        router.push("/admin");
      } else if (userData.role === "doctor") {
        router.push("/doctor");
      } else if (userData.role === "nurse") {
        router.push("/nurse");
      } else {
        throw new Error("Invalid user role");
      }
    } catch (error: unknown) {
      // Suppress Firebase console errors by not logging them
      // The error is already handled by Firebase internally

      // Handle Firebase Auth errors specifically
      if (error && typeof error === "object" && "code" in error) {
        const firebaseError = error as { code: string; message?: string };

        switch (firebaseError.code) {
          case "auth/invalid-credential":
            toast.error("Invalid email or password. Please try again.");
            break;
          case "auth/user-not-found":
            toast.error("User not found. Please check your credentials.");
            break;
          case "auth/wrong-password":
            toast.error("Incorrect password. Please try again.");
            break;
          case "auth/too-many-requests":
            toast.error("Too many failed attempts. Please try again later.");
            break;
          case "auth/network-request-failed":
            toast.error("Network error. Please check your connection.");
            break;
          case "auth/user-disabled":
            toast.error(
              "This account has been disabled. Please contact support."
            );
            break;
          case "auth/invalid-email":
            toast.error("Please enter a valid email address.");
            break;
          default:
            toast.error(
              "Login failed. Please check your credentials and try again."
            );
        }
      } else {
        // Handle non-Firebase errors
        const errorMessage =
          error instanceof Error ? error.message : "Login failed";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    email,
    setEmail,
    password,
    setPassword,
    handleSignInWithGoogle,
    loginHandler,
  };
};
