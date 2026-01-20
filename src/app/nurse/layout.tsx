"use client";
import Header from "@/components/Header";
import RoleBasedSidenav from "@/components/RoleBasedSidenav";
import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { EditModeContext } from "@/contexts/EditModeContext";
import Modal from "@/components/modals/Modal";
import Button from "@/components/Button";
import { ClipboardList, XCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

function NurseLayout({ children }: LayoutProps) {
  const [isMobileSidenavOpen, setIsMobileSidenavOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user: authUser, userInfo, loading: authLoading, userInfoLoading } = useAuth();

  const pathname = usePathname();
  const router = useRouter();
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  useEffect(() => {
    // Wait for auth loading to finish
    if (authLoading) return;

    // If not logged in, do nothing (ProtectedRoute will handle)
    if (!authUser) return;

    // Use userInfoLoading to determine if we are still syncing
    if (userInfoLoading) {
      const toastId = toast.loading("Syncing profile data...");
      return () => {
        toast.dismiss(toastId);
      };
    }

    // If sync is done but userInfo is missing, it might be a fetch failure or new user
    // We shouldn't block forever.

    // If we have userInfo, we can proceed with checks
    if (userInfo) {
      setIsProfileLoaded(true);

      // Don't show if dismissed or on settings page
      if (isDismissed || pathname === '/nurse/settings') {
        setShowProfileAlert(false);
        return;
      }

      const user = userInfo as any;
      // Check if profile is incomplete
      const isProfileIncomplete = !user.medical_license || !user.experience_yrs || !user.hospital || !user.about;

      if (isProfileIncomplete) {
        setShowProfileAlert(true);
        toast.warning("Profile Incomplete", {
          description: "Please complete your profile to receive job offers.",
          action: {
            label: "Update",
            onClick: () => router.push("/nurse/settings"),
          },
          duration: 10000, // Show for longer
        });
      }
    }
  }, [userInfo, pathname, isDismissed, authLoading, router, authUser, userInfoLoading]);

  const handleMobileMenuToggle = () => {
    setIsMobileSidenavOpen(!isMobileSidenavOpen);
  };

  const handleMobileSidenavClose = () => {
    setIsMobileSidenavOpen(false);
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  // Create the exact same transition classes for both elements
  const transitionClasses = `transition-all duration-300 ease-in-out ${isMobileSidenavOpen ? "translate-x-64" : "translate-x-0"
    } lg:translate-x-0`;

  return (
    <ProtectedRoute>
      <EditModeContext.Provider value={{ isEditing, setIsEditing }}>
        <div id="page-wrapper">
          <Header
            userRole="nurse"
            notificationCount={3}
            onMobileMenuToggle={handleMobileMenuToggle}
            onEditClick={handleEditClick}
            className={transitionClasses}
            userInfo={userInfo}
          />
          <RoleBasedSidenav
            userRole="nurse"
            isMobileOpen={isMobileSidenavOpen}
            onMobileClose={handleMobileSidenavClose}
          />
          <main className={`p-6 ${transitionClasses}`}>{children}</main>
        </div>

        <Modal
          isOpen={showProfileAlert}
          onClose={() => {
            setShowProfileAlert(false);
            setIsDismissed(true);
          }}
          title="Action Required"
        >
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-2 ring-4 ring-orange-50">
              <ClipboardList size={32} />
            </div>

            <div className="text-center w-full space-y-2">
              <h4 className="text-xl font-semibold text-gray-900">Profile Incomplete</h4>
              <p className="text-gray-500 max-w-xs mx-auto text-sm">
                To ensure you can receive job offers and get paid, please complete the following details:
              </p>
            </div>

            <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="space-y-3">
                {!(userInfo as any)?.medical_license && (
                  <div className="flex items-center text-sm text-gray-700">
                    <XCircle className="w-4 h-4 text-red-500 mr-3 flex-shrink-0" />
                    <span>Medical License</span>
                  </div>
                )}
                {!(userInfo as any)?.experience_yrs && (
                  <div className="flex items-center text-sm text-gray-700">
                    <XCircle className="w-4 h-4 text-red-500 mr-3 flex-shrink-0" />
                    <span>Years of Experience</span>
                  </div>
                )}
                {!(userInfo as any)?.hospital && (
                  <div className="flex items-center text-sm text-gray-700">
                    <XCircle className="w-4 h-4 text-red-500 mr-3 flex-shrink-0" />
                    <span>Hospital/Clinic</span>
                  </div>
                )}
                {!(userInfo as any)?.about && (
                  <div className="flex items-center text-sm text-gray-700">
                    <XCircle className="w-4 h-4 text-red-500 mr-3 flex-shrink-0" />
                    <span>Bio</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row w-full gap-3 pt-2">
              <Button
                variant="neutral"
                fullWidth
                onClick={() => {
                  setShowProfileAlert(false);
                  setIsDismissed(true);
                }}
              >
                Remind Me Later
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setShowProfileAlert(false);
                  router.push("/nurse/settings");
                }}
              >
                Complete Profile
              </Button>
            </div>
          </div>
        </Modal>
      </EditModeContext.Provider>
    </ProtectedRoute>
  );
}

export default NurseLayout;
