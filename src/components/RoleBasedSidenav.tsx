"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useBadges, getBadgeCount } from "@/contexts/BadgeContext";
import {
  X,
  ChevronDown
} from "lucide-react";
import Image from "next/image";
import { getNavigationItems, NavItem } from "@/utils/navigationItems";

interface RoleBasedSidenavProps {
  userRole: "nurse" | "doctor" | "admin";
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function RoleBasedSidenav({
  userRole,
  isMobileOpen,
  onMobileClose,
}: RoleBasedSidenavProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const { badgeCounts, loading: badgesLoading } = useBadges();

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Auto-expand dropdown when on sub-pages
  useEffect(() => {
    if (userRole === "admin" && pathname.startsWith("/admin/users")) {
      setExpandedItems(prev => new Set(prev).add("users"));
    }
  }, [pathname, userRole]);

  const handleNavigation = (href?: string) => {
    if (href) {
      router.push(href);
      // Close mobile sidenav after navigation
      if (isMobileOpen) {
        onMobileClose();
      }
    }
  };

  const navItems = getNavigationItems(userRole);

  const isActive = (href?: string) => {
    if (!href) return false;

    // For Dashboard, only show active if we're exactly on the dashboard page
    if (href === "/nurse" || href === "/admin" || href === "/doctor") {
      return pathname === href;
    }

    // For exact matches, use exact comparison
    if (pathname === href) {
      return true;
    }

    // For admin users pages, be more specific
    if (href === "/admin/users") {
      // Only active if we're exactly on /admin/users, not on sub-pages
      return pathname === "/admin/users";
    }

    // For other items, check if current path starts with the href
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem) => {
    const isItemActive = isActive(item.href);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div key={item.id} className="space-y-1">
        <div
          className={`px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 ease-in-out cursor-pointer group ${isItemActive ? "bg-[#44CE2D] text-white shadow-md" : ""
            }`}
          style={{
            color: isItemActive ? "white" : "var(--foreground)",
            backgroundColor: isItemActive ? "#44CE2D" : "transparent",
          }}
          onMouseEnter={(e) => {
            if (!isItemActive) {
              e.currentTarget.style.backgroundColor = "var(--muted)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isItemActive) {
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
          onClick={() => {
            if (hasSubItems) {
              toggleExpanded(item.id);
            } else {
              handleNavigation(item.href);
            }
          }}>
          <div className="flex items-center space-x-3">
            <div
              className={`transition-all duration-200 ${isItemActive ? "text-white" : ""
                }`}
              style={{
                color: isItemActive ? "white" : "var(--muted-foreground)",
              }}>
              {item.icon}
            </div>
            <span
              className={` text-[10px]  md:text-[12px] font-medium transition-colors whitespace-nowrap duration-200 ${isItemActive ? "text-white" : ""
                }`}
              style={{
                color: isItemActive ? "white" : "var(--foreground)",
              }}>
              {item.label}
            </span>
          </div>
          {hasSubItems && (
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
                }`}
              style={{
                color: isItemActive ? "white" : "var(--muted-foreground)",
              }}
            />
          )}
          {!hasSubItems && (item?.count || item?.dynamicCount) && (
            <span
              className={`p-1 text-xs rounded flex items-center justify-center transition-all duration-200 ${isItemActive ? "bg-white text-[#44CE2D]" : ""
                }`}
              style={{
                backgroundColor: isItemActive ? "white" : "var(--muted)",
                color: isItemActive ? "#44CE2D" : "var(--muted-foreground)",
              }}>
              {item?.dynamicCount
                ? getBadgeCount(badgeCounts, item.id)
                : item?.count || 0}
            </span>
          )}
        </div>

        {hasSubItems && (
          <div
            className={`ml-4 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}>
            {item.subItems!.map((subItem) => {
              const isSubItemActive = isActive(subItem.href);
              return (
                <div
                  key={subItem.id}
                  className={`px-4 py-2 rounded-lg flex items-center justify-between transition-all duration-200 ease-in-out cursor-pointer group ${isSubItemActive ? "bg-[#44CE2D] text-white shadow-md" : ""
                    }`}
                  style={{
                    color: isSubItemActive
                      ? "white"
                      : "var(--muted-foreground)",
                    backgroundColor: isSubItemActive
                      ? "#44CE2D"
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubItemActive) {
                      e.currentTarget.style.backgroundColor = "var(--muted)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubItemActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                  onClick={() => handleNavigation(subItem.href)}>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`transition-all duration-200 ${isSubItemActive ? "text-white" : ""
                        }`}
                      style={{
                        color: isSubItemActive
                          ? "white"
                          : "var(--muted-foreground)",
                      }}>
                      {subItem.icon}
                    </div>
                    <span
                      className={` text-[10px]  md:text-[12px] transition-colors duration-200 ${isSubItemActive ? "text-white" : ""
                        }`}
                      style={{
                        color: isSubItemActive
                          ? "white"
                          : "var(--muted-foreground)",
                      }}>
                      {subItem.label}
                    </span>
                  </div>
                  {(subItem.count || subItem.dynamicCount) && (
                    <span
                      className={`w-5 h-5 text-xs rounded-full flex items-center justify-center transition-all duration-200 ${isSubItemActive ? "bg-white text-[#44CE2D]" : ""
                        }`}
                      style={{
                        backgroundColor: isSubItemActive
                          ? "white"
                          : "var(--muted)",
                        color: isSubItemActive
                          ? "#44CE2D"
                          : "var(--muted-foreground)",
                      }}>
                      {subItem.dynamicCount
                        ? getBadgeCount(badgeCounts, item.id, subItem.id)
                        : subItem.count || 0}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Sidenav */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 min-h-screen w-[230px] p-4 transform transition-all duration-300 ease-in-out border-r-[1.5px] ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        style={{
          gridArea: "sidenav",
          backgroundColor: "var(--accent-white)",
          borderRightColor: "var(--border)",
          borderColor: "var(--border)",
        }}>
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between mb-8 lg:hidden">
          <div className="flex items-center space-x-2">
            <Image
              src={theme === "dark" ? "/logowhite.svg" : "/logodark.svg"}
              alt="eezyhealth"
              width={100}
              height={100}
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <button
            onClick={onMobileClose}
            className="p-2 cursor-pointer transition-colors duration-200"
            style={{ color: "var(--muted-foreground)" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Logo */}
        <div className="mb-8 flex items-center space-x-2 hidden lg:flex">
          <Image
            src={theme === "dark" ? "/logowhite.svg" : "/logodark.svg"}
            alt="eezyhealth"
            width={150}
            height={150}
            style={{ width: "auto", height: "auto" }}
          />
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => renderNavItem(item))}
        </nav>
      </aside>
    </>
  );
}
