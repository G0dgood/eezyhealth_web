"use client";

import { Menu, User, Edit, RefreshCw } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import Image from "next/image";
import ConfirmModal from "./widgets/ConfirmModal";
import UserDropdownMenu from "./UserDropdownMenu";
import RoleBadge from "./RoleBadge";
import { api } from "@/store/baseApi";

interface HeaderProps {
  userRole?: string;
  notificationCount?: number;
  onMobileMenuToggle?: () => void;
  onEditClick?: () => void;
  className?: string;
  userInfo?: any;
}

export default function Header({
  userRole,
  notificationCount = 0,
  onMobileMenuToggle,
  onEditClick,
  className = "",
  userInfo,
}: HeaderProps) {
  const { user, userInfo: authUserInfo, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  // Soft refresh: re-run the current page's data (server components + RTK
  // Query) without a full browser reload of the whole app.
  const handleRefresh = () => {
    router.refresh();
    dispatch(api.util.resetApiState());
  };

  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      setIsSignOutModalOpen(false);
      // Close the dropdown
      setShowUserMenu(false);
      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      className={`px-4 py-3 md:px-6 md:py-4 flex items-center justify-between border-b-[1.5px] transition-colors duration-200 relative z-40 ${className}`}
      style={{
        gridArea: "header",
        backgroundColor: "var(--accent-white)",
        borderColor: "var(--border)",
        color: "var(--foreground)",
      }}
    >
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Mobile Menu Toggle Button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 cursor-pointer transition-colors duration-200"
          style={{ color: "var(--muted-foreground)" }}
        >
          <Menu className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <RoleBadge role={userRole || authUserInfo?.role} />

        {/* <div className="flex items-center space-x-2">
          <span
            className="text-base md:text-lg font-medium"
            style={{ color: "var(--foreground)" }}
          >
            {userInfo
              ? `${userRole} ${userInfo?.display_name || ""} `
              : "Hello"}
          </span>
        </div> */}
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleRefresh}
          className="rounded bg-white flex items-center justify-center p-2 hover:bg-gray-50 transition-colors cursor-pointer"
          aria-label="Refresh page"
          title="Refresh page"
        >
          <RefreshCw size={20} />
        </button>
        {userRole && pathname === `/${userRole.toLowerCase()}` && (
          <button
            onClick={onEditClick}
            className="rounded bg-white flex items-center justify-center p-2 hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="Edit dashboard layout"
            title="Edit dashboard layout"
          >
            <Edit size={20} />
          </button>
        )}
        <NotificationBell />

        <div className="relative" ref={userMenuRef}>
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200"
              style={{ backgroundColor: "var(--muted)" }}
            >
              {authUserInfo?.photo_url || authUserInfo?.photoURL || user?.photoURL ? (
                <Image
                  src={
                    authUserInfo?.photo_url ||
                    authUserInfo?.photoURL ||
                    user?.photoURL ||
                    ""
                  }
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div className="hidden sm:block text-right max-w-[180px]">
              <div className="flex items-center justify-end gap-2">

                <p
                  className="text-[10px] md:text-[12px] font-medium truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {authUserInfo?.displayName || user?.displayName || userRole}
                </p>
              </div>
              <p
                className="text-xs truncate"
                style={{ color: "var(--muted-foreground)" }}
              >
                {authUserInfo?.email || user?.email || "User"}
              </p>
            </div>
          </div>

          {/* User Dropdown Menu */}
          <UserDropdownMenu
            isOpen={showUserMenu}
            userRole={userRole}
            authUserInfo={authUserInfo}
            user={user}
            onSignOutClick={() => {
              setShowUserMenu(false);
              setIsSignOutModalOpen(true);
            }}
          />
        </div>
      </div>
      <ConfirmModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleSignOut}
        title="Confirm Sign Out"
        message="Are you sure you want to sign out of EezyHealth?"
        confirmText="Yes, Sign Out"
        cancelText="No, Keep Me Logged In"
        isLoading={isSigningOut}
        loaderColor="red"
      />
    </header>
  );
}
