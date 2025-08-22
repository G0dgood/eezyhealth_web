"use client";
import Header from "@/components/Header";
import Sidenav from "@/components/Sidenav";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div id="page-wrapper">
      <Header />
      <Sidenav />
      <main className="p-6">{children}</main>
    </div>
  );
}

export default Layout;
