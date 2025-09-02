"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Grid3X3,
  Users,
  Calendar,
  CalendarX,
  Cross,
  Stethoscope,
  User,
  CreditCard,
  Upload,
  Settings,
  Activity,
  FileText,
  Shield,
  BarChart3,
  Database,
  Bell,
  X,
  ChevronDown,
  Home,
  CalendarCheck,
  MessageSquare,
  Clock,
  XCircle,
  Award,
} from "lucide-react";
import Image from "next/image";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  count?: number;
  subItems?: NavItem[];
  roles?: string[];
}

interface RoleBasedSidenavProps {
  userRole: "NURSE" | "DOCTOR" | "ADMIN";
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

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleNavigation = (href?: string) => {
    if (href) {
      router.push(href);
      // Close mobile sidenav after navigation
      if (isMobileOpen) {
        onMobileClose();
      }
    }
  };

  // Define navigation items for each role
  const getNavItems = (role: string): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <Grid3X3 className="w-5 h-5" />,
        href: `/${role.toLowerCase()}`,
        roles: ["NURSE", "DOCTOR", "ADMIN"],
      },
    ];

    if (role === "NURSE") {
      return [
        ...baseItems,
        {
          id: "patients",
          label: "Patients",
          icon: <Users className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/patients`,
          count: 156,
        },
        // {
        //   id: "appointments",
        //   label: "Appointments",
        //   icon: <Calendar className="w-5 h-5" />,
        //   href: `/${role.toLowerCase()}/patients/appointments`,
        // },
        {
          id: "bookings",
          label: "Bookings",
          icon: <Calendar className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/bookings`,
        },
        {
          id: "booking-cancellation",
          label: "Booking Cancellation",
          icon: <CalendarX className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/booking-cancellation`,
        },
        {
          id: "payment",
          label: "Payment",
          icon: <CreditCard className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/payment`,
        },
        {
          id: "settings",
          label: "Settings",
          icon: <Settings className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/settings`,
        },
      ];
    } else if (role === "DOCTOR") {
      return [
        ...baseItems,
        {
          id: "patients",
          label: "Patient",
          icon: <Users className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/patients`,
        },
        {
          id: "appointments",
          label: "Appointment",
          icon: <Calendar className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/appointments`,
        },
        {
          id: "bookings",
          label: "Bookings",
          icon: <Calendar className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/bookings`,
        },
        {
          id: "message",
          label: "Message",
          icon: <Bell className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/message`,
        },
        {
          id: "availability",
          label: "Availability",
          icon: <Activity className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/availability`,
        },
        {
          id: "booking-cancellation",
          label: "Booking Cancellation",
          icon: <CalendarX className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/booking-cancellation`,
        },
        {
          id: "payment",
          label: "Payment",
          icon: <CreditCard className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/payment`,
        },
        {
          id: "settings",
          label: "Settings",
          icon: <Settings className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/settings`,
        },
      ];
    } else if (role === "ADMIN") {
      return [
        ...baseItems,
        {
          id: "users",
          label: "Users",
          icon: <Users className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/users`,
          subItems: [
            {
              id: "doctors",
              label: "Doctor",
              icon: <Stethoscope className="w-4 h-4" />,
              href: `/${role.toLowerCase()}/users/doctors`,
              count: 24,
            },
            {
              id: "patients",
              label: "Patient",
              icon: <User className="w-4 h-4" />,
              href: `/${role.toLowerCase()}/users/patients`,
              count: 156,
            },
          ],
        },
        {
          id: "all-users",
          label: "All Users",
          icon: <Users className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/users`,
        },
        {
          id: "bookings",
          label: "Bookings",
          icon: <Calendar className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/bookings`,
          count: 89,
        },
        {
          id: "booking-cancellation",
          label: "Booking Cancellation",
          icon: <CalendarX className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/booking-cancellation`,
          count: 12,
        },
        {
          id: "specialization",
          label: "Specialization",
          icon: <Shield className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/specialization`,
        },
        {
          id: "doctor-month",
          label: "Doctor of the Month",
          icon: <BarChart3 className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/doctor-month`,
        },
        {
          id: "payment",
          label: "Payment",
          icon: <CreditCard className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/payment`,
          count: 234,
        },
        {
          id: "document",
          label: "Document",
          icon: <Upload className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/document`,
        },
        {
          id: "settings",
          label: "Settings",
          icon: <Settings className="w-5 h-5" />,
          href: `/${role.toLowerCase()}/settings`,
        },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems(userRole);

  const isActive = (href?: string) => {
    if (!href) return false;

    // For Dashboard, only show active if we're exactly on the dashboard page
    if (href === "/nurse" || href === "/admin" || href === "/doctor") {
      return pathname === href;
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
          className={`px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 ease-in-out cursor-pointer group ${
            isItemActive ? "bg-[#44CE2D] text-white shadow-md" : ""
          }`}
          style={{
            color: isItemActive ? "white" : "var(--foreground)",
            backgroundColor: isItemActive ? "#22c55e" : "transparent",
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
              className={`transition-all duration-200 ${
                isItemActive ? "text-white" : ""
              }`}
              style={{
                color: isItemActive ? "white" : "var(--muted-foreground)",
              }}>
              {item.icon}
            </div>
            <span
              className={`text-sm font-medium transition-colors whitespace-nowrap duration-200 ${
                isItemActive ? "text-white" : ""
              }`}
              style={{
                color: isItemActive ? "white" : "var(--foreground)",
              }}>
              {item.label}
            </span>
          </div>
          {hasSubItems && (
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
              style={{
                color: isItemActive ? "white" : "var(--muted-foreground)",
              }}
            />
          )}
          {!hasSubItems && item?.count && (
            <span
              className={`p-1 text-xs rounded flex items-center justify-center transition-all duration-200 ${
                isItemActive ? "bg-white text-green-500" : ""
              }`}
              style={{
                backgroundColor: isItemActive ? "white" : "var(--muted)",
                color: isItemActive ? "#22c55e" : "var(--muted-foreground)",
              }}>
              {item?.count}
            </span>
          )}
        </div>

        {hasSubItems && (
          <div
            className={`ml-4 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}>
            {item.subItems!.map((subItem) => {
              const isSubItemActive = isActive(subItem.href);
              return (
                <div
                  key={subItem.id}
                  className={`px-4 py-2 rounded-lg flex items-center justify-between transition-all duration-200 ease-in-out cursor-pointer group ${
                    isSubItemActive ? "bg-green-500 text-white shadow-md" : ""
                  }`}
                  style={{
                    color: isSubItemActive
                      ? "white"
                      : "var(--muted-foreground)",
                    backgroundColor: isSubItemActive
                      ? "#22c55e"
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
                      className={`transition-all duration-200 ${
                        isSubItemActive ? "text-white" : ""
                      }`}
                      style={{
                        color: isSubItemActive
                          ? "white"
                          : "var(--muted-foreground)",
                      }}>
                      {subItem.icon}
                    </div>
                    <span
                      className={`text-sm transition-colors duration-200 ${
                        isSubItemActive ? "text-white" : ""
                      }`}
                      style={{
                        color: isSubItemActive
                          ? "white"
                          : "var(--muted-foreground)",
                      }}>
                      {subItem.label}
                    </span>
                  </div>
                  {subItem.count && (
                    <span
                      className={`w-5 h-5 text-xs rounded-full flex items-center justify-center transition-all duration-200 ${
                        isSubItemActive ? "bg-white text-green-500" : ""
                      }`}
                      style={{
                        backgroundColor: isSubItemActive
                          ? "white"
                          : "var(--muted)",
                        color: isSubItemActive
                          ? "#22c55e"
                          : "var(--muted-foreground)",
                      }}>
                      {subItem.count}
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
        className={`fixed lg:static inset-y-0 left-0 z-40 min-h-screen w-[266px] p-4 transform transition-all duration-300 ease-in-out border-r-[1.5px] ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
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
