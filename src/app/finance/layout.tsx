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

function FinanceLayout({ children }: LayoutProps) {
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

  const transitionClasses = `transition-all duration-300 ease-in-out ${
    isMobileSidenavOpen ? "translate-x-[230px]" : "translate-x-0"
  } lg:translate-x-0`;

  // Determine user role for sidenav: if user is admin, they might see admin or finance view
  const userRole = userInfo?.role === "admin" ? "admin" : "finance";

  return (
    <ProtectedRoute>
      <EditModeContext.Provider value={{ isEditing, setIsEditing }}>
        <div id="page-wrapper">
          <Header
            userRole={userRole}
            notificationCount={0}
            onMobileMenuToggle={handleMobileMenuToggle}
            onEditClick={handleEditClick}
            className={transitionClasses}
            userInfo={userInfo}
          />
          <RoleBasedSidenav
            userRole={userRole}
            isMobileOpen={isMobileSidenavOpen}
            onMobileClose={handleMobileSidenavClose}
          />
          <main className={`p-4 md:p-6 ${transitionClasses}`}>{children}</main>
        </div>
      </EditModeContext.Provider>
    </ProtectedRoute>
  );
}

export default FinanceLayout;
