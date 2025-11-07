"use client";
import Header from "@/components/Header";
import RoleBasedSidenav from "@/components/RoleBasedSidenav";
import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { EditModeContext } from "@/contexts/EditModeContext";

interface LayoutProps {
  children: React.ReactNode;
}

function NurseLayout({ children }: LayoutProps) {
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
  const transitionClasses = `transition-all duration-300 ease-in-out ${isMobileSidenavOpen ? "translate-x-64" : "translate-x-0"
    } lg:translate-x-0`;

  return (
    <ProtectedRoute>
      <EditModeContext.Provider value={{ isEditing, setIsEditing }}>
        <div id="page-wrapper">
          <Header
            userRole="NURSE"
            notificationCount={3}
            onMobileMenuToggle={handleMobileMenuToggle}
            onEditClick={handleEditClick}
            className={transitionClasses}
            userInfo={userInfo}
          />
          <RoleBasedSidenav
            userRole="NURSE"
            isMobileOpen={isMobileSidenavOpen}
            onMobileClose={handleMobileSidenavClose}
          />
          <main className={`p-6 ${transitionClasses}`}>{children}</main>
        </div>
      </EditModeContext.Provider>
    </ProtectedRoute>
  );
}

export default NurseLayout;
