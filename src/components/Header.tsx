"use client";

import { Menu, LogOut, User } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface HeaderProps {
  userRole?: string;
  notificationCount?: number;
  onMobileMenuToggle?: () => void;
  className?: string;
}

export default function Header({
  userRole = "ADMIN",
  notificationCount = 0,
  onMobileMenuToggle,
  className = "",
}: HeaderProps) {
  const { user, userInfo, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Close the dropdown
      setShowUserMenu(false);
      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      className={`px-6 py-4 flex items-center justify-between border-b-[1.5px] transition-colors duration-200 relative z-40 ${className}`}
      style={{
        gridArea: "header",
        backgroundColor: "var(--accent-white)",
        borderColor: "var(--border)",
        color: "var(--foreground)",
      }}>
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Toggle Button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 cursor-pointer transition-colors duration-200"
          style={{ color: "var(--muted-foreground)" }}>
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-2">
          <span
            className="text-lg font-medium"
            style={{ color: "var(--foreground)" }}>
            Hello
          </span>
          <span className="text-xl">👋</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <NotificationBell />

        <div className="relative" ref={userMenuRef}>
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setShowUserMenu(!showUserMenu)}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
              style={{ backgroundColor: "var(--muted)" }}>
              {userInfo?.photoURL || user?.photoURL ? (
                <Image
                  src={userInfo?.photoURL || user?.photoURL || ""}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground)" }}>
                  {userInfo?.displayName?.charAt(0) ||
                    user?.displayName?.charAt(0) ||
                    userRole.charAt(0)}
                </span>
              )}
            </div>
            {/* User info - Hidden on mobile */}
            <div className="hidden sm:block">
              <p
                className="text-sm font-medium"
                style={{ color: "var(--foreground)" }}>
                {userInfo?.displayName || user?.displayName || userRole}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}>
                {userInfo?.email || user?.email || "User"}
              </p>
            </div>
          </div>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-2xl py-1 z-[9999] border border-gray-200 backdrop-blur-sm">
              <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100 bg-white">
                <p className="font-medium">
                  {userInfo?.displayName || user?.displayName || userRole}
                </p>
                <p className="text-gray-500">
                  {userInfo?.email || user?.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 bg-white cursor-pointer">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
