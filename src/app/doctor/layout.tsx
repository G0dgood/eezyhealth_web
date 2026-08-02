"use client";
import Header from "@/components/Header";
import RoleBasedSidenav from "@/components/RoleBasedSidenav";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { EditModeContext } from "@/contexts/EditModeContext";
import Modal from "@/components/modals/Modal";
import Button from "@/components/Button";
import { ClipboardList, XCircle } from "lucide-react";
import { toast } from "sonner";
import VideoProvider from "@/components/VideoProvider";
import { useCreateStreamTokenMutation } from "@/store/streamChatApi";
import { streamApiKey } from "@/lib/config";

interface LayoutProps {
  children: React.ReactNode;
}

function DoctorLayout({ children }: LayoutProps) {
  const [isMobileSidenavOpen, setIsMobileSidenavOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user: authUser, userInfo, loading: authLoading, userInfoLoading } = useAuth();

  const pathname = usePathname();
  const router = useRouter();
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // Stream Video Token Logic
  const [streamToken, setStreamToken] = useState<string>("");
  const [createStreamToken] = useCreateStreamTokenMutation();

  useEffect(() => {
    if (authUser && !streamToken) {
      createStreamToken({ name: authUser.displayName || "Doctor" })
        .unwrap()
        .then((res) => setStreamToken(res.token))
        .catch((err) => console.error("Failed to generate global video token", err));
    }
  }, [authUser, streamToken, createStreamToken]);

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
      if (isDismissed || pathname === '/doctor/settings') {
        setShowProfileAlert(false);
        return;
      }

      const user = userInfo as any;
      // Check if profile is incomplete
      const isProfileIncomplete = !user.specialization || !user.experience_yrs || !user.hospital || !user.about || !user.title || !user.gender || !user.license;

      if (isProfileIncomplete) {
        setShowProfileAlert(true);
        toast.warning("Profile Incomplete", {
          description: "Please complete your profile to receive patient appointments.",
          action: {
            label: "Update",
            onClick: () => router.push("/doctor/settings"),
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
  const transitionClasses = `transition-all duration-300 ease-in-out ${isMobileSidenavOpen ? "translate-x-[230px]" : "translate-x-0"
    } lg:translate-x-0`;

  // Check if we're on the message page
  const isMessagePage = pathname === "/doctor/message";
  const isAudioCall = pathname === "/doctor/audio-call";
  const isVideoCall = pathname === "/doctor/video-call";



  return (
    <ProtectedRoute>
      <EditModeContext.Provider value={{ isEditing, setIsEditing }}>
        <VideoProvider
          apiKey={streamApiKey || ""}
          token={streamToken}
          userId={authUser?.uid || ""}
          userName={authUser?.displayName || "Doctor"}
          userRole="doctor"
        >
          <div id="page-wrapper">
            <Header
              userRole="doctor"
              notificationCount={4}
              onMobileMenuToggle={handleMobileMenuToggle}
              onEditClick={handleEditClick}
              className={transitionClasses}
              userInfo={userInfo}
            />
            <RoleBasedSidenav
              userRole="doctor"
              isMobileOpen={isMobileSidenavOpen}
              onMobileClose={handleMobileSidenavClose}
            />
            <main
              className={`${transitionClasses} ${isMessagePage || isAudioCall || isVideoCall ? "" : "p-4 md:p-6"}`}
              data-page={isMessagePage ? "message" : isAudioCall ? "audio-call" : isVideoCall ? "video-call" : undefined}>
              {children}
            </main>
          </div>
        </VideoProvider>

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
              <h4 className="text-[16px] md:text-[18px] font-semibold text-gray-900">Profile Incomplete</h4>
              <p className="text-gray-500 max-w-xs mx-auto  !text-[10px]  !md:text-[12px]">
                To ensure you can receive patient appointments, please complete the following details:
              </p>
            </div>

            <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="space-y-3">
                {!(userInfo as any)?.title && (
                  <div className="flex items-center  !text-[10px]  !md:text-[12px] text-gray-700">
                    <XCircle className="w-4 h-4 text-red-500 mr-3 flex-shrink-0" />
                    <span>Title (e.g. Dr.)</span>
                  </div>
                )}
                {!(userInfo as any)?.gender && (
                  <div className="flex items-center  !text-[10px]  !md:text-[12px] text-gray-700">
                    <XCircle className="w-4 h-4 text-red-500 mr-3 flex-shrink-0" />
                    <span>Gender</span>
                  </div>
                )}
                {!(userInfo as any)?.license && (
                  <div className="flex items-center  !text-[10px]  !md:text-[12px] text-gray-700">
                    <XCircle className="w-4 h-4 text-red-500 mr-3 flex-shrink-0" />
                    <span>Medical License</span>
                  </div>
                )}
                {!(userInfo as any)?.specialization && (
                  <div className="flex items-center  !text-[10px]  !md:text-[12px] text-gray-700">
                    <XCircle className="w-4 h-4 text-red-500 mr-3 flex-shrink-0" />
                    <span>Specialization</span>
                  </div>
                )}
                {!(userInfo as any)?.experience_yrs && (
                  <div className="flex items-center  !text-[10px]  !md:text-[12px] text-gray-700">
                    <XCircle className="w-4 h-4 text-red-500 mr-3 flex-shrink-0" />
                    <span>Years of Experience</span>
                  </div>
                )}
                {!(userInfo as any)?.hospital && (
                  <div className="flex items-center  !text-[10px]  !md:text-[12px] text-gray-700">
                    <XCircle className="w-4 h-4 text-red-500 mr-3 flex-shrink-0" />
                    <span>Hospital/Clinic</span>
                  </div>
                )}
                {!(userInfo as any)?.about && (
                  <div className="flex items-center  !text-[10px]  !md:text-[12px] text-gray-700">
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
                  router.push("/doctor/settings");
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

export default DoctorLayout;
