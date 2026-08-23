"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import PageLoader from "@/components/PageLoader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Session is truly gone. Clear the stale cached user so the login page
      // doesn't immediately redirect back here (which would loop and flicker).
      localStorage.removeItem("userInfo-eezy-health");
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return null;
  }

  // TODO: Add role-based access control here
  // if (requiredRole && user.role !== requiredRole) {
  //   router.push('/unauthorized');
  //   return null;
  // }

  return <>{children}</>;
}
