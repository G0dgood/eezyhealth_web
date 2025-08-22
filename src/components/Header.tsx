"use client";

import { Search, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import NotificationBell from "./NotificationBell";

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
  const { theme, toggleTheme } = useTheme();

  // Debug logging
  console.log("Current theme:", theme);
  console.log(
    "Document data-theme:",
    document.documentElement.getAttribute("data-theme")
  );

  return (
    <header
      className={`px-6 py-4 flex items-center justify-between border-b transition-colors duration-200 ${className}`}
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
        {/* Search Bar - Hidden on mobile */}
        <div className="relative hidden md:block">
          <Search
            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
            style={{ color: "var(--muted-foreground)" }}
          />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-64 cursor-pointer transition-colors duration-200"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 transition-colors duration-200"
          style={{ color: "var(--muted-foreground)" }}
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }>
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <NotificationBell />

        <div className="flex items-center space-x-3 cursor-pointer">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
            style={{ backgroundColor: "var(--muted)" }}>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}>
              {userRole.charAt(0)}
            </span>
          </div>
          {/* User info - Hidden on mobile */}
          <div className="hidden sm:block">
            <p
              className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}>
              {userRole}
            </p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              User
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
