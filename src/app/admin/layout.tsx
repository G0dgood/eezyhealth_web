"use client";
import Header from "@/components/Header";
import RoleBasedSidenav from "@/components/RoleBasedSidenav";
import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface LayoutProps {
  children: React.ReactNode;
}

function AdminLayout({ children }: LayoutProps) {
  const [isMobileSidenavOpen, setIsMobileSidenavOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileSidenavOpen(!isMobileSidenavOpen);
  };

  const handleMobileSidenavClose = () => {
    setIsMobileSidenavOpen(false);
  };

  // Create the exact same transition classes for both elements
  const transitionClasses = `transition-all duration-300 ease-in-out ${
    isMobileSidenavOpen ? "translate-x-[266px]" : "translate-x-0"
  } lg:translate-x-0`;

  return (
    <ProtectedRoute>
      <div id="page-wrapper">
        <Header
          userRole="ADMIN"
          notificationCount={3}
          onMobileMenuToggle={handleMobileMenuToggle}
          className={transitionClasses}
        />
        <RoleBasedSidenav
          userRole="ADMIN"
          isMobileOpen={isMobileSidenavOpen}
          onMobileClose={handleMobileSidenavClose}
        />
        <main className={`${transitionClasses}`}>{children}</main>
      </div>
    </ProtectedRoute>
  );
}

export default AdminLayout;
