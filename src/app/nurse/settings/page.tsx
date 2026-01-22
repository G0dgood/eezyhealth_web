"use client";

import { useState, useEffect, useRef } from "react";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Dropdown from "@/components/Dropdown";
import { useRouter } from "next/navigation";
import { User, Bell, Shield, Camera, Moon, Sun, UserCircle } from "lucide-react";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import { Toggle } from "@/components/Toggle";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useUpdateUserMutation, useUpdateUserProfileMutation } from "@/store/authApi";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ProfilePictureSection from "@/components/ProfilePictureSection";
import { motion } from "framer-motion";

export default function NurseSettingsPage() {
  const router = useRouter();
  const { signOut, setUserInfo: setAuthUserInfo, userInfo: authUserInfo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const notificationContext = useNotifications();

  const [activeTab, setActiveTab] = useState("profile");
  const [profileImage, setProfileImage] = useState("/api/placeholder/120/120");

  // Get current user information
  const userInfo = useUserInfo();

  // RTK Query mutation for updating user
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

  // Profile form state - initialize with user data
  const [profileData, setProfileData] = useState({
    fullName: "",
    medicalLicense: "",
    specialization: "",
    email: "",
    mobileNumber: "",
    yearsOfExperience: "",
    hospitalClinic: "",
    bio: "",
  });

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    newAppointments: true,
    patientReschedulings: true,
    accountUpdates: false,
    appointmentUpdates: true,
    appointmentCancellations: true,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: "30",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Session timeout tracking
  useEffect(() => {
    const timeoutMinutes = parseInt(securitySettings.sessionTimeout);
    if (!timeoutMinutes || timeoutMinutes <= 0) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        // Auto-logout user
        try {
          await signOut();
          toast.warning("Session expired due to inactivity");
          router.push("/login");
        } catch (error) {
          console.error("Error during auto-logout:", error);
          // Fallback: manually clear and redirect
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo-eezy-health");
          window.location.href = "/login";
        }
      }, timeoutMinutes * 60 * 1000);
    };

    // Set initial timeout
    resetTimeout();

    // Reset timeout on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => {
      document.addEventListener(event, resetTimeout, true);
    });

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }, [securitySettings.sessionTimeout, signOut, router]);

  // Refs to track last loaded data to prevent overwriting user edits
  const lastLoadedProfileData = useRef<string>("");
  const lastLoadedNotificationPrefs = useRef<string>("");
  const lastLoadedSecuritySettings = useRef<string>("");

  // Initialize profile data with user information
  useEffect(() => {
    if (userInfo) {
      const newProfileData = {
        fullName: String(userInfo.display_name || userInfo.first_name || ""),
        medicalLicense: String(userInfo.medical_license || ""),
        specialization: String(userInfo.specialization || ""),
        email: String(userInfo.email || ""),
        mobileNumber: String(userInfo.phone_number || ""),
        yearsOfExperience: String(userInfo.experience_yrs || ""),
        hospitalClinic: String(userInfo.hospital || ""),
        bio: String(userInfo.about || ""),
      };

      const profileDataStr = JSON.stringify(newProfileData);

      // Only update if the SOURCE data is different from what we last loaded
      if (profileDataStr !== lastLoadedProfileData.current) {
        setProfileData(newProfileData);
        lastLoadedProfileData.current = profileDataStr;
      }

      // Set profile image if available
      if (userInfo.photo_url || userInfo.image) {
        const newImageUrl = String(
          userInfo.photo_url || userInfo.image || "/api/placeholder/120/120"
        );
        setProfileImage((prev) => prev !== newImageUrl ? newImageUrl : prev);
      }

      // Initialize notification preferences if available
      if (
        userInfo.notification_preferences &&
        typeof userInfo.notification_preferences === "object"
      ) {
        const newPrefs = {
          ...notificationPrefs, // Keep existing defaults for missing keys
          ...(userInfo.notification_preferences as Record<string, unknown>),
        };

        // We need to compare only the parts that come from userInfo
        const relevantPrefs = userInfo.notification_preferences as Record<string, unknown>;
        const prefsStr = JSON.stringify(relevantPrefs);

        if (prefsStr !== lastLoadedNotificationPrefs.current) {
          setNotificationPrefs(prev => ({
            ...prev,
            ...relevantPrefs
          }));
          lastLoadedNotificationPrefs.current = prefsStr;
        }
      }

      // Initialize security settings if available
      if (
        userInfo.security_settings &&
        typeof userInfo.security_settings === "object"
      ) {
        const securityData = userInfo.security_settings as Record<
          string,
          unknown
        >;

        const securityStr = JSON.stringify(securityData);

        if (securityStr !== lastLoadedSecuritySettings.current) {
          setSecuritySettings(prev => ({
            ...prev,
            ...securityData
          }));
          lastLoadedSecuritySettings.current = securityStr;
        }

        // Set theme preference if available in security settings
        if (
          securityData.theme_preference &&
          typeof securityData.theme_preference === "string"
        ) {
          // Note: We don't call setTheme here as it would conflict with the ThemeContext
          // The theme is already managed by the ThemeContext and localStorage
        }
      }
    }
  }, [userInfo]);

  const handleProfileUrlChange = async (url: string) => {
    setProfileImage(url);

    // Auto-save the profile image
    if (userInfo?.uid) {
      try {
        await updateUser({
          userId: userInfo.uid,
          photo_url: url,
          role: userInfo.role || "nurse",
          updatedAt: new Date().toISOString(),
        }).unwrap();

        // Update local storage and context
        if (authUserInfo && setAuthUserInfo) {
          const updatedUserInfo = { ...authUserInfo, photo_url: url, photoURL: url };
          setAuthUserInfo(updatedUserInfo);
          localStorage.setItem(
            "userInfo-eezy-health",
            JSON.stringify(updatedUserInfo)
          );
        }

        toast.success("Profile picture updated successfully!");
      } catch (error: any) {
        console.error("Error auto-saving profile picture:", error);
        const errorMessage = error?.data?.error || error?.message || error?.error || "Unknown error";
        toast.error(`Failed to save profile picture: ${errorMessage}`);
      }
    }
  };

  const handleProfileSave = async () => {
    if (!userInfo?.uid) {
      toast.error("User information not available");
      return;
    }

    try {
      // Prepare the update data
      const updateData = {
        display_name: profileData.fullName,
        medical_license: profileData.medicalLicense,
        specialization: profileData.specialization,
        email: profileData.email,
        phone_number: profileData.mobileNumber,
        experience_yrs: profileData.yearsOfExperience,
        hospital: profileData.hospitalClinic,
        about: profileData.bio,
        photo_url: profileImage,
        role: userInfo.role || "nurse",
        updatedAt: new Date().toISOString(),
      };

      // Update user in database
      await updateUser({
        userId: userInfo.uid,
        ...updateData,
      }).unwrap();

      // Update localStorage with new data
      const updatedUserInfo = { ...userInfo, ...updateData };
      localStorage.setItem(
        "userInfo-eezy-health",
        JSON.stringify(updatedUserInfo)
      );

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(`Failed to update profile: ${(error as any)?.data?.error || (error as any)?.message || "Unknown error"}`);
    }
  };

  const handleNotificationSave = async () => {
    if (!userInfo?.uid) {
      toast.error("User information not available");
      return;
    }

    try {
      // Update notification preferences in database
      await updateUser({
        userId: userInfo.uid,
        notification_preferences: notificationPrefs,
        updatedAt: new Date().toISOString(),
      }).unwrap();

      // Update localStorage
      const updatedUserInfo = {
        ...userInfo,
        notification_preferences: notificationPrefs,
      };
      localStorage.setItem(
        "userInfo-eezy-health",
        JSON.stringify(updatedUserInfo)
      );

      // Sync with NotificationContext if available
      if (notificationContext?.updateNotificationPrefs) {
        await notificationContext.updateNotificationPrefs({
          newPatientBookings: notificationPrefs.newAppointments,
          appointmentReminders: notificationPrefs.patientReschedulings,
          patientMessages: notificationPrefs.appointmentUpdates,
        });
      }

      toast.success("Notification preferences updated successfully!");
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast.error(
        "Failed to update notification preferences. Please try again."
      );
    }
  };

  const handleSecuritySave = async () => {
    if (!userInfo?.uid) {
      toast.error("User information not available");
      return;
    }

    try {
      // Update security settings in database (including theme preference)
      await updateUser({
        userId: userInfo.uid,
        security_settings: {
          ...securitySettings,
          theme_preference: theme,
        },
        updatedAt: new Date().toISOString(),
      }).unwrap();

      // Update localStorage
      const updatedUserInfo = {
        ...userInfo,
        security_settings: {
          ...securitySettings,
          theme_preference: theme,
        },
      };
      localStorage.setItem(
        "userInfo-eezy-health",
        JSON.stringify(updatedUserInfo)
      );

      toast.success("Security settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update security settings. Please try again.");
    }
  };

  const handlePasswordUpdate = async () => {
    if (!userInfo?.uid) {
      toast.error("User information not available");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      // Update password in database
      await updateUser({
        userId: userInfo.uid,
        password: passwordData.newPassword,
        updatedAt: new Date().toISOString(),
      }).unwrap();

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error("Failed to update password. Please try again.");
    }
  };

  const tabs = [
    {
      id: "profile",
      label: "Profile Management",
      icon: <User className="w-5 h-5" />,
    },
    {
      id: "notifications",
      label: "Notification Preferences",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: "security",
      label: "Security Settings",
      icon: <Shield className="w-5 h-5" />,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <ProfilePictureSection
              profileImage={profileImage}
              onImageChange={handleProfileUrlChange}
              buttonClassName="bg-green-500 hover:bg-green-600"
              textClassName="text-green-600"
            />

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical License
                </label>
                <Input
                  type="text"
                  value={profileData.medicalLicense}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      medicalLicense: e.target.value,
                    })
                  }
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <Dropdown
                  value={profileData.specialization}
                  onChange={(value) =>
                    setProfileData({
                      ...profileData,
                      specialization: value,
                    })
                  }
                  options={[
                    { value: "Cardiology", label: "Cardiology" },
                    { value: "Dermatology", label: "Dermatology" },
                    { value: "Neurology", label: "Neurology" },
                    { value: "Pediatrics", label: "Pediatrics" },
                    { value: "Orthopedics", label: "Orthopedics" },
                  ]}
                  placeholder="Select Specialization"
                  className="w-full"
                  variant="default"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <Input
                  type="tel"
                  value={profileData.mobileNumber}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      mobileNumber: e.target.value,
                    })
                  }
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <Input
                  type="number"
                  value={profileData.yearsOfExperience}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      yearsOfExperience: e.target.value,
                    })
                  }
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital/Clinic
                </label>
                <Input
                  type="text"
                  value={profileData.hospitalClinic}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      hospitalClinic: e.target.value,
                    })
                  }
                  fullWidth
                />
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your bio
              </label>
              <Textarea
                value={profileData?.bio}
                onChange={(e) =>
                  setProfileData({ ...profileData, bio: e.target.value })
                }
                rows={4}
                maxLength={400}
                fullWidth
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {profileData?.bio?.length} characters
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleProfileSave}
                disabled={isUpdating}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {/* New Appointments */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    New Appointments
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get notified when a new patient books an appointment.
                  </p>
                </div>
                <Toggle
                  checked={notificationPrefs.newAppointments}
                  onChange={(checked) =>
                    setNotificationPrefs({
                      ...notificationPrefs,
                      newAppointments: checked,
                    })
                  }
                />
              </div>

              {/* Patient Reschedulings */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    Patient Reschedulings
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get notified when a patient changes their appointment time.
                  </p>
                </div>
                <Toggle
                  checked={notificationPrefs.patientReschedulings}
                  onChange={(checked) =>
                    setNotificationPrefs({
                      ...notificationPrefs,
                      patientReschedulings: checked,
                    })
                  }
                />
              </div>

              {/* Account Updates */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Account Updates</h3>
                  <p className="text-sm text-gray-600">
                    Receive notifications about changes to your account (e.g.,
                    password changes, profile updates).
                  </p>
                </div>
                <Toggle
                  checked={notificationPrefs.accountUpdates}
                  onChange={(checked) =>
                    setNotificationPrefs({
                      ...notificationPrefs,
                      accountUpdates: checked,
                    })
                  }
                />
              </div>

              {/* Appointment Updates */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    Appointment Updates
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get alerts for modifications made to existing appointments
                    by patient.
                  </p>
                </div>
                <Toggle
                  checked={notificationPrefs.appointmentUpdates}
                  onChange={(checked) =>
                    setNotificationPrefs({
                      ...notificationPrefs,
                      appointmentUpdates: checked,
                    })
                  }
                />
              </div>

              {/* Appointment Cancellations */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    Appointment Cancellations (By Doctor)
                  </h3>
                  <p className="text-sm text-gray-600">
                    Receive confirmations of your appointment cancellations.
                  </p>
                </div>
                <Toggle
                  checked={notificationPrefs.appointmentCancellations}
                  onChange={(checked) =>
                    setNotificationPrefs({
                      ...notificationPrefs,
                      appointmentCancellations: checked,
                    })
                  }
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleNotificationSave}
                disabled={isUpdating}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-8">
            {/* Security Settings Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Security Settings
                </h3>
                <p className="text-gray-600">
                  Configure security and access control
                </p>
              </div>

              {/* Theme Preference */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    Theme Preference
                  </h4>
                  <p className="text-sm text-gray-600">
                    Choose between light and dark mode
                  </p>
                </div>
                <div className="flex items-end justify-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Sun
                      className={`w-4 h-4 ${theme === "light" ? "text-yellow-500" : "text-gray-400"
                        }`}
                    />
                    <span className="text-sm text-gray-600">Light</span>
                  </div>
                  <Toggle
                    checked={theme === "dark"}
                    onChange={() => toggleTheme()}
                  />
                  <div className="flex items-center space-x-2">
                    <Moon
                      className={`w-4 h-4 ${theme === "dark" ? "text-blue-500" : "text-gray-400"
                        }`}
                    />
                    <span className="text-sm text-gray-600">Dark</span>
                  </div>
                </div>
              </div>

              {/* Session Timeout */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Session Timeout</h4>
                  <p className="text-sm text-gray-600">
                    Auto-logout after inactivity
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: e.target.value,
                      })
                    }
                    className="w-20 text-center"
                  />
                  <span className="text-sm text-gray-600">minutes</span>
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Change Password
                </h3>
                <p className="text-gray-600">
                  Please enter your current password to change your password.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter Password"
                    showPasswordToggle
                    fullWidth
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter New Password"
                    showPasswordToggle
                    fullWidth
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Enter New Password"
                    showPasswordToggle
                    fullWidth
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={handlePasswordUpdate}
                  disabled={isUpdating}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>

            {/* Save Security Settings Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSecuritySave}
                disabled={isUpdating}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[{ label: "Nurse", href: "/nurse" }, { label: "Settings" }]}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account preferences and security settings
        </p>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <div className="relative flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg w-fit p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap relative z-10 px-3 py-2 transition-colors font-inter font-semibold text-sm leading-5 rounded-md
                  ${activeTab === tab.id ? "text-white" : "text-gray-600"}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="nurse-settings-active-tab"
                    className="absolute inset-0 bg-[#44CE2D] shadow-sm rounded-md z-[-1]"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
}
