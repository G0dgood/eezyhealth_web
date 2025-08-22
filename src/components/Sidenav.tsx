"use client";

import { useState } from "react";
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
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  count?: number;
  subItems?: NavItem[];
}

export default function Sidenav() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Grid3X3 className="w-5 h-5" />,
      href: "/dashboard",
    },
    {
      id: "users",
      label: "Users",
      icon: <Users className="w-5 h-5" />,
      subItems: [
        {
          id: "doctor",
          label: "Doctor",
          icon: <Stethoscope className="w-4 h-4" />,
          count: 10,
        },
        {
          id: "patient",
          label: "Patient",
          icon: <User className="w-4 h-4" />,
          count: 10,
        },
      ],
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: "booking-cancellation",
      label: "Booking Cancellation",
      icon: <CalendarX className="w-5 h-5" />,
    },
    {
      id: "specialization",
      label: "Specialization",
      icon: <Cross className="w-5 h-5" />,
    },
    {
      id: "doctor-month",
      label: "Doctor of the Month",
      icon: <Stethoscope className="w-5 h-5" />,
    },
    {
      id: "payment",
      label: "Payment",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: "documents",
      label: "Documents",
      icon: <Upload className="w-5 h-5" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isActive = item.id === "dashboard";

    return (
      <div key={item.id}>
        <div
          className={`px-4 py-3 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
            isActive
              ? "bg-green-500 text-white"
              : "text-black hover:bg-gray-100"
          }`}
          onClick={() => (hasSubItems ? toggleExpanded(item.id) : undefined)}>
          <div className="flex items-center space-x-3">
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          {hasSubItems && (
            <span
              className={`text-xs transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}>
              ▼
            </span>
          )}
          {!hasSubItems && item.count && (
            <span className="w-5 h-5 bg-gray-200 text-black text-xs rounded-full flex items-center justify-center">
              {item.count}
            </span>
          )}
        </div>

        {hasSubItems && isExpanded && (
          <div className="ml-4 space-y-1">
            {item.subItems!.map((subItem) => (
              <div
                key={subItem.id}
                className="px-4 py-2 text-black hover:bg-gray-100 rounded-lg flex items-center justify-between transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  {subItem.icon}
                  <span className="text-sm">{subItem.label}</span>
                </div>
                {subItem.count && (
                  <span className="w-5 h-5 bg-gray-200 text-black text-xs rounded-full flex items-center justify-center">
                    {subItem.count}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className="bg-white border-r border-gray-200 min-h-screen w-64 p-4"
      style={{ gridArea: "sidenav" }}>
      {/* Logo */}
      <div className="mb-8 flex items-center space-x-2">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">e</span>
        </div>
        <span className="text-black font-medium text-lg">eezyhealth</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => renderNavItem(item))}
      </nav>
    </aside>
  );
}
