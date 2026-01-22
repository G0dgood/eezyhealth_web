"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 
import {
  User,
  Bell,
  Shield,
  Sun,
  Moon,
} from "lucide-react";
import Button from "@/components/Button";
import Breadcrumb from "@/components/Breadcrumb";
import ToggleSwitch from "@/components/ToggleSwitch";
import { Toggle } from "@/components/Toggle";
import { validateField } from "@/utils/fieldValidation";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Dropdown from "@/components/Dropdown";
import { PageSkeleton } from "@/components/SkeletonLoader";
import ProfilePictureSection from "@/components/ProfilePictureSection";
import { useUpdateUserProfileMutation } from "@/store/authApi";

import { motion } from "framer-motion";

export default function AdminSettings() {
  const { userInfo, loading, signOut, setUserInfo } = useAuth();
  const [updateUser] = useUpdateUserProfileMutation();
  const [activeTab, setActiveTab] = useState("profile");
  const { theme, setTheme, toggleTheme } = useTheme();

  const router = useRouter();

  const [profileImage, setProfileImage] = useState(userInfo?.photo_url || "");

  // Sync profileImage with userInfo when it changes
  useEffect(() => {
    if (userInfo?.photo_url) {
      setProfileImage(userInfo.photo_url);
    }
  }, [userInfo?.photo_url]);

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: userInfo?.display_name || "-",
    adminId: userInfo?.uid || "-",
    role: userInfo?.role || "-",
    email: userInfo?.email || "-",
    mobileNumber: userInfo?.phone_number || "-",
    department: "",
    accessLevel: "",
    bio: "",
    firstName: userInfo?.first_name || "-",
    lastName: userInfo?.last_name || "-",
    address: userInfo?.address || "-",
    location: userInfo?.location || "-",
    dateOfBirth: userInfo?.date_of_birth || "-",
    isActive: userInfo?.isActive || false,
  });

  // Sync profileData with userInfo when it changes
  useEffect(() => {
    if (userInfo) {
      setProfileData((prev) => ({
        ...prev,
        fullName: userInfo.display_name || prev.fullName,
        adminId: userInfo.uid || prev.adminId,
        role: userInfo.role || prev.role,
        email: userInfo.email || prev.email,
        mobileNumber: userInfo.phone_number || prev.mobileNumber,
        firstName: userInfo.first_name || prev.firstName,
        lastName: userInfo.last_name || prev.lastName,
        address: userInfo.address || prev.address,
        location: userInfo.location || prev.location,
        dateOfBirth: userInfo.date_of_birth || prev.dateOfBirth,
        isActive: userInfo.isActive || prev.isActive,
      }));
    }
  }, [userInfo]);

  // Validation functions

  // Update profile data when form fields change
  const handleProfileDataChange = (field: string, value: string) => {
    // Clear error for this field when user starts typing
    if (profileErrors[field]) {
      setProfileErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Mark that changes have been made
    setProfileChanges(true);
  };

  // Authentication is handled by ProtectedRoute in the admin layout

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    newUserRegistrations: true,
    securityAlerts: true,
    userAccountUpdates: true,
    systemMaintenance: true,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: "40",
  });

  // Session timeout state
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const [timeUntilLogout, setTimeUntilLogout] = useState<number>(0);
  const [isSessionWarning, setIsSessionWarning] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Profile validation state
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {}
  );
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileChanges, setProfileChanges] = useState(false);

  // Session timeout functions
  const clearAllTimeouts = () => {
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const startSessionTimeout = useCallback(() => {
    clearAllTimeouts();

    const timeoutMinutes = parseInt(securitySettings.sessionTimeout);

    // Validate timeout: must be a number and at least 1 minute
    if (isNaN(timeoutMinutes) || timeoutMinutes < 1) {
      return;
    }

    const timeoutMs = timeoutMinutes * 60 * 1000;

    // Set warning 2 minutes before logout, or at 80% if timeout is small
    const warningTime = timeoutMs > 3 * 60 * 1000 ? timeoutMs - 2 * 60 * 1000 : Math.floor(timeoutMs * 0.8);

    // Start countdown for warning
    warningTimeoutRef.current = setTimeout(() => {
      setIsSessionWarning(true);
      const secondsRemaining = Math.floor((timeoutMs - warningTime) / 1000);
      setTimeUntilLogout(secondsRemaining);

      // Start countdown timer
      countdownIntervalRef.current = setInterval(() => {
        setTimeUntilLogout((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, warningTime);

    // Set actual logout timeout
    logoutTimeoutRef.current = setTimeout(() => {
      handleSessionTimeout();
    }, timeoutMs);
  }, [securitySettings.sessionTimeout]);

  const resetSessionTimeout = useCallback(() => {
    const now = Date.now();
    // Throttle: only reset if 30 seconds have passed since last activity
    if (now - lastActivityRef.current < 30000) return;

    lastActivityRef.current = now;

    // Only clear and restart if we are in warning mode OR enough time passed
    // But for simplicity and correctness, we restart the timer
    setIsSessionWarning(false);
    startSessionTimeout();
  }, [startSessionTimeout]);
  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleSessionTimeout = () => {
    toast.error("Session expired due to inactivity. You will be logged out.");
    // Clear user session and redirect to login
    setTimeout(() => {
      handleSignOut();
    }, 2000);
  };

  const extendSession = () => {
    toast.success("Session extended successfully!");
    resetSessionTimeout();
  };

  // Initialize session timeout when component mounts
  useEffect(() => {
    startSessionTimeout();

    // Cleanup on unmount
    return () => {
      clearAllTimeouts();
    };
  }, [startSessionTimeout]);

  // Reset session timeout on user activity
  useEffect(() => {
    const handleUserActivity = () => {
      resetSessionTimeout();
    };

    // Add event listeners for user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Cleanup event listeners
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [resetSessionTimeout]);

  // Update session timeout when settings change
  useEffect(() => {
    if (securitySettings.sessionTimeout) {
      resetSessionTimeout();
    }
  }, [securitySettings.sessionTimeout]);

  const handleProfileUrlChange = async (url: string) => {
    setProfileImage(url);

    // Auto-save the profile image
    if (userInfo?.uid) {
      try {
        // Update user in database
        await updateUser({
          userId: userInfo.uid,
          photo_url: url,
          role: userInfo.role || "",
          updatedAt: new Date().toISOString(),
        }).unwrap();

        // Update local storage and context
        if (userInfo && setUserInfo) {
          const updatedUserInfo = { ...userInfo, photo_url: url, photoURL: url };
          setUserInfo(updatedUserInfo);
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
    // Validate all fields
    const errors: Record<string, string> = {};
    const requiredFields = [
      "fullName",
      "email",
      "mobileNumber",
      "firstName",
      "lastName",
      "address",
      "location",
    ];

    requiredFields.forEach((field) => {
      const error = validateField(
        field,
        profileData[field as keyof typeof profileData] as string
      );
      if (error) {
        errors[field] = error;
      }
    });

    // If there are validation errors, set them and return
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    setIsProfileSaving(true);
    setProfileErrors({});

    try {
      // Simulate API call to update profile
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update profile data (in real app, this would call Firebase)
      toast.success("Profile updated successfully!");
      setProfileChanges(false);
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    try {
      // Simulate API call to update notification preferences
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Notification preferences updated successfully!");
    } catch {
      toast.error(
        "Failed to update notification preferences. Please try again."
      );
    }
  };

  const handleSecuritySave = async () => {
    try {
      // Simulate API call to update security settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Security settings updated successfully!");
    } catch {
      toast.error("Failed to update security settings. Please try again.");
    }
  };

  const handlePasswordUpdate = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
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
            />

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Full Name"
                  required
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) =>
                    handleProfileDataChange("fullName", e.target.value)
                  }
                  error={profileErrors.fullName}
                  helperText={profileErrors.fullName}
                  placeholder="Enter your full name"
                  fullWidth
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <Dropdown
                  value={profileData.role}
                  onChange={(value) =>
                    handleProfileDataChange("role", value)
                  }
                  options={[
                    { value: "System Administrator", label: "System Administrator" },
                    { value: "IT Manager", label: "IT Manager" },
                    { value: "Security Admin", label: "Security Admin" },
                    { value: "User Manager", label: "User Manager" },
                    { value: "Data Administrator", label: "Data Administrator" },
                  ]}
                  placeholder="Select Role"
                  className="w-full"
                  variant="default"
                />
              </div>

              <div>
                <Input
                  label="Email"
                  required
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    handleProfileDataChange("email", e.target.value)
                  }
                  error={profileErrors.email}
                  helperText={profileErrors.email}
                  placeholder="Enter your email address"
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Mobile Number"
                  required
                  type="tel"
                  value={profileData.mobileNumber}
                  onChange={(e) =>
                    handleProfileDataChange("mobileNumber", e.target.value)
                  }
                  error={profileErrors.mobileNumber}
                  helperText={profileErrors.mobileNumber}
                  placeholder="Enter your mobile number"
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <Dropdown
                  value={profileData.department}
                  onChange={(value) =>
                    handleProfileDataChange("department", value)
                  }
                  options={[
                    { value: "IT & Administration", label: "IT & Administration" },
                    { value: "Human Resources", label: "Human Resources" },
                    { value: "Finance", label: "Finance" },
                    { value: "Operations", label: "Operations" },
                    { value: "Quality Assurance", label: "Quality Assurance" },
                  ]}
                  placeholder="Select Department"
                  className="w-full"
                  variant="default"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Level
                </label>
                <Dropdown
                  value={profileData.accessLevel}
                  onChange={(value) =>
                    handleProfileDataChange("accessLevel", value)
                  }
                  options={[
                    { value: "Full Access", label: "Full Access" },
                    { value: "Limited Access", label: "Limited Access" },
                    { value: "Read Only", label: "Read Only" },
                    { value: "User Management", label: "User Management" },
                  ]}
                  placeholder="Select Access Level"
                  className="w-full"
                  variant="default"
                />
              </div>
            </div>

            {/* Additional Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="First Name"
                  required
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) =>
                    handleProfileDataChange("firstName", e.target.value)
                  }
                  error={profileErrors.firstName}
                  helperText={profileErrors.firstName}
                  placeholder="Enter your first name"
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Last Name"
                  required
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) =>
                    handleProfileDataChange("lastName", e.target.value)
                  }
                  error={profileErrors.lastName}
                  helperText={profileErrors.lastName}
                  placeholder="Enter your last name"
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Address"
                  required
                  type="text"
                  value={profileData.address}
                  onChange={(e) =>
                    handleProfileDataChange("address", e.target.value)
                  }
                  error={profileErrors.address}
                  helperText={profileErrors.address}
                  placeholder="Enter your address"
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Location"
                  required
                  type="text"
                  value={profileData.location}
                  onChange={(e) =>
                    handleProfileDataChange("location", e.target.value)
                  }
                  error={profileErrors.location}
                  helperText={profileErrors.location}
                  placeholder="Enter your location"
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Date of Birth"
                  type="text"
                  value={
                    profileData.dateOfBirth
                      ? typeof profileData.dateOfBirth === "string"
                        ? new Date(profileData.dateOfBirth).toLocaleDateString()
                        : typeof profileData.dateOfBirth === "object" &&
                          "seconds" in profileData.dateOfBirth
                          ? new Date(
                            profileData.dateOfBirth.seconds * 1000
                          ).toLocaleDateString()
                          : ""
                      : ""
                  }
                  disabled
                  fullWidth
                  className="bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center">
                  <span
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${profileData.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {profileData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <Textarea
                label="Your bio"
                value={profileData.bio}
                onChange={(e) => handleProfileDataChange("bio", e.target.value)}
                rows={4}
                maxLength={400}
                helperText={`${profileData?.bio?.length || 0} characters`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button variant="neutral">
                Cancel
              </Button>
              <Button
                onClick={handleProfileSave}
                variant="primary"
                isLoading={isProfileSaving}
              >
                Save
              </Button>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {/* New User Registrations */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h3 className="font-medium text-gray-900">
                    New User Registrations
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get notified when new users register in the system.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={notificationPrefs.newUserRegistrations}
                    onChange={(checked) => {

                      setNotificationPrefs({
                        ...notificationPrefs,
                        newUserRegistrations: checked,
                      });
                    }}
                  />
                </div>
              </div>

              {/* Security Alerts */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h3 className="font-medium text-gray-900">Security Alerts</h3>
                  <p className="text-sm text-gray-600">
                    Get notified about security breaches or suspicious
                    activities.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={notificationPrefs.securityAlerts}
                    onChange={(checked) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        securityAlerts: checked,
                      })
                    }
                  />
                </div>
              </div>

              {/* User Account Updates */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h3 className="font-medium text-gray-900">
                    User Account Updates
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get notified when user accounts are modified or updated.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={notificationPrefs.userAccountUpdates}
                    onChange={(checked) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        userAccountUpdates: checked,
                      })
                    }
                  />
                </div>
              </div>

              {/* System Maintenance */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h3 className="font-medium text-gray-900">
                    System Maintenance
                  </h3>
                  <p className="text-sm text-gray-600">
                    Receive notifications about scheduled maintenance and
                    updates.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={notificationPrefs.systemMaintenance}
                    onChange={(checked) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        systemMaintenance: checked,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleNotificationSave}
                className="bg-[#22c55e] hover:bg-[#1a9f4a] text-white"
              >
                Save Preference
              </Button>
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
                  Configure security and access control for admin accounts
                </p>
              </div>

              {/* Session Timeout */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Session Timeout</h4>
                  <p className="text-sm text-gray-600">
                    Auto-logout after inactivity
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Current timeout: {securitySettings.sessionTimeout} minutes
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min={5}
                    max={120}
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: e.target.value,
                      })
                    }
                    className="w-20 text-center"
                    fullWidth={false}
                  />
                  <span className="text-sm text-gray-600">minutes</span>
                </div>
              </div>

              {/* Dark Mode */}
              {/* <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h4 className="font-medium text-gray-900">Dark Mode</h4>
                  <p className="text-sm text-gray-600">
                    Enable dark theme for the admin interface
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Current theme: {theme}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={theme === "dark"}
                    onChange={(checked) => {
                      if (checked) {
                        setTheme("dark");
                      } else {
                        setTheme("light");
                      }
                    }}
                  />
                </div>
              </div> */}

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
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter Current Password"
                    fullWidth
                    showPasswordToggle
                  />
                </div>

                <div>
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter New Password"
                    fullWidth
                    showPasswordToggle
                  />
                </div>

                <div>
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm New Password"
                    fullWidth
                    showPasswordToggle
                  />
                </div>
              </div>


              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline-neutral"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePasswordUpdate}
                  className="bg-[#22c55e] hover:bg-[#1a9f4a] text-white"
                >
                  Update Password
                </Button>
              </div>
            </div>

            {/* Save Security Settings Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSecuritySave}
                variant="primary"
              >
                Save Settings
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state while user data is being fetched
  if (loading) {
    return <PageSkeleton activeTab={activeTab} />;
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[{ label: "Admin", href: "/admin" }, { label: "Settings" }]}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your admin account preferences and security settings
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
                    layoutId="admin-settings-active-tab"
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
