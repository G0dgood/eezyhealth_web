"use client";
import Header from "@/components/Header";
import RoleBasedSidenav from "@/components/RoleBasedSidenav";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

interface LayoutProps {
  children: React.ReactNode;
}

function DoctorLayout({ children }: LayoutProps) {
  const [isMobileSidenavOpen, setIsMobileSidenavOpen] = useState(false);
  const pathname = usePathname();

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

  // Check if we're on the message page
  const isMessagePage = pathname === "/doctor/message";

  return (
    <ProtectedRoute>
      <div id="page-wrapper">
        <Header
          userRole="DOCTOR"
          notificationCount={4}
          onMobileMenuToggle={handleMobileMenuToggle}
          className={transitionClasses}
        />
        <RoleBasedSidenav
          userRole="DOCTOR"
          isMobileOpen={isMobileSidenavOpen}
          onMobileClose={handleMobileSidenavClose}
        />
        <main
          className={`${transitionClasses}`}
          data-page={isMessagePage ? "message" : undefined}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default DoctorLayout;
