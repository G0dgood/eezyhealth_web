"use client";
import Header from "@/components/Header";
import RoleBasedSidenav from "@/components/RoleBasedSidenav";
import React, { useState, createContext, useContext } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

// Create context for edit mode
const EditModeContext = createContext<{
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}>({
  isEditing: false,
  setIsEditing: () => {},
});

interface LayoutProps {
  children: React.ReactNode;
}

function AdminLayout({ children }: LayoutProps) {
  const [isMobileSidenavOpen, setIsMobileSidenavOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { userInfo } = useAuth();

  const handleMobileMenuToggle = () => {
    setIsMobileSidenavOpen(!isMobileSidenavOpen);
  };

  const handleMobileSidenavClose = () => {
    setIsMobileSidenavOpen(false);
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  // Create the exact same transition classes for both elements
  const transitionClasses = `transition-all duration-300 ease-in-out ${
    isMobileSidenavOpen ? "translate-x-[266px]" : "translate-x-0"
  } lg:translate-x-0`;

  return (
    <ProtectedRoute>
      <EditModeContext.Provider value={{ isEditing, setIsEditing }}>
        <div id="page-wrapper">
          <Header
            userRole="ADMIN"
            notificationCount={3}
            onMobileMenuToggle={handleMobileMenuToggle}
            onEditClick={handleEditClick}
            className={transitionClasses}
            userInfo={userInfo}
          />
          <RoleBasedSidenav
            userRole="ADMIN"
            isMobileOpen={isMobileSidenavOpen}
            onMobileClose={handleMobileSidenavClose}
          />
          <main className={`${transitionClasses}`}>{children}</main>
        </div>
      </EditModeContext.Provider>
    </ProtectedRoute>
  );
}

export default AdminLayout;
