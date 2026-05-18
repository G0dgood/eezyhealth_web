import {
  Grid3X3,
  Users,
  Calendar,
  CalendarX,
  Stethoscope,
  CreditCard,
  Upload,
  Settings,
  Shield,
  BarChart3,
  Bell,
  Activity,
  MessageCircle,
  Contact,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  count?: number;
  dynamicCount?: boolean; // Flag to indicate if count should be fetched dynamically
  subItems?: NavItem[];
  roles?: string[];
}

export const getNavItems = (rawRole: string): NavItem[] => {
  const role = rawRole.toLowerCase();

  const baseItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Grid3X3 className="w-5 h-5" />,
      href: `/${role.toLowerCase()}`,
      roles: ["nurse", "doctor", "admin"],
    },
  ];

  if (role === "nurse") {
    return [
      ...baseItems,
      {
        id: "patients",
        label: "Patients",
        icon: <Users className="w-5 h-5" />,
        href: `/${role.toLowerCase()}/patients`,
      },
      {
        id: "message",
        label: "Message",
        icon: <MessageCircle className="w-5 h-5" />,
        href: `/${role.toLowerCase()}/message`,
      },
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
  } else if (role === "doctor") {
    return [
      ...baseItems,
      {
        id: "appointments",
        label: "Appointment",
        icon: <Calendar className="w-5 h-5" />,
        href: `/${role.toLowerCase()}/appointments`,
      },
      {
        id: "message",
        label: "Message",
        icon: <MessageCircle className="w-5 h-5" />,
        href: `/${role.toLowerCase()}/message`,
      },
      {
        id: "bookings",
        label: "Bookings",
        icon: <Calendar className="w-5 h-5" />,
        href: `/${role.toLowerCase()}/bookings`,
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
  } else if (role === "admin") {
    return [
      ...baseItems,
      {
        id: "users",
        label: "Users",
        icon: <Users className="w-5 h-5" />,
        subItems: [
          {
            id: "all-users",
            label: "All Users",
            icon: <Users className="w-4 h-4" />,
            href: `/${role.toLowerCase()}/users`,
            dynamicCount: true,
          },
          {
            id: "doctors",
            label: "Doctors",
            icon: <Stethoscope className="w-4 h-4" />,
            href: `/${role.toLowerCase()}/users/doctors`,
            dynamicCount: true,
          },
          {
            id: "nurses",
            label: "Nurses",
            icon: <Users className="w-4 h-4" />,
            href: `/${role.toLowerCase()}/users/nurses`,
            dynamicCount: true,
          },
          {
            id: "patients",
            label: "Patients",
            icon: <Users className="w-4 h-4" />,
            href: `/${role.toLowerCase()}/users/patients`,
            dynamicCount: true,
          },
          // {
          //   id: "doctor-account-management",
          //   label: "Doctor Account Management",
          //   icon: <Shield className="w-4 h-4" />,
          //   href: `/${role.toLowerCase()}/doctors/account-management`,
          // },
        ],
      },
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
      },
      {
        id: "document",
        label: "Document",
        icon: <Upload className="w-5 h-5" />,
        href: `/${role.toLowerCase()}/document`,
      },
      {
        id: "contacts",
        label: "Contacts",
        icon: <Contact className="w-5 h-5" />,
        href: `/${role.toLowerCase()}/contacts`,
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

// Helper function to get navigation items for a specific role
export const getNavigationItems = (
  userRole: "nurse" | "doctor" | "admin"
): NavItem[] => {
  return getNavItems(userRole);
};

// Helper function to get all available roles
export const getAvailableRoles = (): string[] => {
  return ["nurse", "doctor", "admin"];
};

// Helper function to check if a role has access to a specific navigation item
export const hasAccessToNavItem = (
  userRole: string,
  navItem: NavItem
): boolean => {
  if (!navItem.roles) return true;
  return navItem.roles.includes(userRole);
};

// Helper function to get navigation items filtered by role access
export const getFilteredNavItems = (
  userRole: "nurse" | "doctor" | "admin"
): NavItem[] => {
  const navItems = getNavItems(userRole);
  return navItems.filter((item) => hasAccessToNavItem(userRole, item));
};
