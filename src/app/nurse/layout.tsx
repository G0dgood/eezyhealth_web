"use client";
import Header from "@/components/Header";
import RoleBasedSidenav from "@/components/RoleBasedSidenav";
import React, { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

function NurseLayout({ children }: LayoutProps) {
  const [isMobileSidenavOpen, setIsMobileSidenavOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileSidenavOpen(!isMobileSidenavOpen);
  };

  const handleMobileSidenavClose = () => {
    setIsMobileSidenavOpen(false);
  };

  // Create the exact same transition classes for both elements
  const transitionClasses = `transition-all duration-300 ease-in-out ${
    isMobileSidenavOpen ? "translate-x-64" : "translate-x-0"
  } lg:translate-x-0`;

  return (
    <div id="page-wrapper">
      <Header
        userRole="NURSE"
        notificationCount={3}
        onMobileMenuToggle={handleMobileMenuToggle}
        className={transitionClasses}
      />
      <RoleBasedSidenav
        userRole="NURSE"
        isMobileOpen={isMobileSidenavOpen}
        onMobileClose={handleMobileSidenavClose}
      />
      <main className={`p-6 ${transitionClasses}`}>{children}</main>
    </div>
  );
}

export default NurseLayout;
