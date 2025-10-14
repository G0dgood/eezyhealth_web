"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Bell,
  Shield,
  Camera,
  UserCircle,
  Sun,
  Moon,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import ToggleSwitch from "@/components/ToggleSwitch";
import { validateField } from "@/utils/fieldValidation";
import { PageSkeleton } from "@/components/SkeletonLoader";

export default function AdminSettings() {
  const { userInfo, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const { theme, setTheme, toggleTheme } = useTheme();

  const router = useRouter();

  const [profileImage, setProfileImage] = useState(userInfo?.photo_url || "");

  // Function to check if image URL is valid for Next.js Image component
  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    // Check if it's a valid HTTP/HTTPS URL
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

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
  const [sessionTimeoutId, setSessionTimeoutId] =
    useState<NodeJS.Timeout | null>(null);
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
  const startSessionTimeout = () => {
    // Clear existing timeout
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
    }

    const timeoutMinutes = parseInt(securitySettings.sessionTimeout);
    const timeoutMs = timeoutMinutes * 60 * 1000;

    // Set warning 2 minutes before logout
    const warningTime = timeoutMs - 2 * 60 * 1000;

    // Start countdown for warning
    const warningTimeoutId = setTimeout(() => {
      setIsSessionWarning(true);
      setTimeUntilLogout(120); // 2 minutes in seconds

      // Start countdown timer
      const countdownInterval = setInterval(() => {
        setTimeUntilLogout((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, warningTime);

    // Set actual logout timeout
    const logoutTimeoutId = setTimeout(() => {
      handleSessionTimeout();
    }, timeoutMs);

    setSessionTimeoutId(logoutTimeoutId);
  };

  const resetSessionTimeout = () => {
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
    }
    setIsSessionWarning(false);
    setTimeUntilLogout(0);
    startSessionTimeout();
  };
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
      if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
      }
    };
  }, []);

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
  }, [securitySettings.sessionTimeout]);

  // Update session timeout when settings change
  useEffect(() => {
    if (securitySettings.sessionTimeout) {
      resetSessionTimeout();
    }
  }, [securitySettings.sessionTimeout]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a temporary URL for the selected file
      const tempUrl = URL.createObjectURL(file);
      setProfileImage(tempUrl);

      // Clean up the temporary URL when component unmounts
      return () => URL.revokeObjectURL(tempUrl);
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
            <div className="text-center">
              <div className="relative inline-block">
                {profileImage && isValidImageUrl(profileImage) ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                    <UserCircle className="w-24 h-24 text-gray-400" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-[#22c55e] text-white p-2 rounded-full cursor-pointer hover:bg-[#1a9f4a] transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[#22c55e] font-medium mt-2 cursor-pointer">
                Update
              </p>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) =>
                    handleProfileDataChange("fullName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    profileErrors.fullName
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  }`}
                  placeholder="Enter your full name"
                />
                {profileErrors.fullName && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin ID
                </label>
                <input
                  type="text"
                  value={profileData.adminId}
                  onChange={(e) =>
                    handleProfileDataChange("adminId", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={profileData.role}
                  onChange={(e) =>
                    handleProfileDataChange("role", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 cursor-pointer"
                >
                  <option value="System Administrator">
                    System Administrator
                  </option>
                  <option value="IT Manager">IT Manager</option>
                  <option value="Security Admin">Security Admin</option>
                  <option value="User Manager">User Manager</option>
                  <option value="Data Administrator">Data Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    handleProfileDataChange("email", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    profileErrors.email
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  }`}
                  placeholder="Enter your email address"
                />
                {profileErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={profileData.mobileNumber}
                  onChange={(e) =>
                    handleProfileDataChange("mobileNumber", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    profileErrors.mobileNumber
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  }`}
                  placeholder="Enter your mobile number"
                />
                {profileErrors.mobileNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileErrors.mobileNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={profileData.department}
                  onChange={(e) =>
                    handleProfileDataChange("department", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 cursor-pointer"
                >
                  <option value="IT & Administration">
                    IT & Administration
                  </option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Level
                </label>
                <select
                  value={profileData.accessLevel}
                  onChange={(e) =>
                    handleProfileDataChange("accessLevel", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 cursor-pointer"
                >
                  <option value="Full Access">Full Access</option>
                  <option value="Limited Access">Limited Access</option>
                  <option value="Read Only">Read Only</option>
                  <option value="User Management">User Management</option>
                </select>
              </div>
            </div>

            {/* Additional Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) =>
                    handleProfileDataChange("firstName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    profileErrors.firstName
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  }`}
                  placeholder="Enter your first name"
                />
                {profileErrors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileErrors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) =>
                    handleProfileDataChange("lastName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    profileErrors.lastName
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  }`}
                  placeholder="Enter your last name"
                />
                {profileErrors.lastName && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileErrors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) =>
                    handleProfileDataChange("address", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    profileErrors.address
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  }`}
                  placeholder="Enter your address"
                />
                {profileErrors.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileErrors.address}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) =>
                    handleProfileDataChange("location", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    profileErrors.location
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  }`}
                  placeholder="Enter your location"
                />
                {profileErrors.location && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileErrors.location}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center">
                  <span
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      profileData.isActive
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleProfileDataChange("bio", e.target.value)}
                rows={4}
                maxLength={400}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 resize-none"
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
                className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#1a9f4a] transition-colors cursor-pointer"
              >
                Save
              </button>
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
                      console.log("Admin notification toggle:", {
                        checked,
                        current: notificationPrefs.newUserRegistrations,
                      });
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
              <button
                onClick={handleNotificationSave}
                className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#1a9f4a] transition-colors cursor-pointer"
              >
                Save Preference
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
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: e.target.value,
                      })
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 text-center"
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
                      className={`w-4 h-4 ${
                        theme === "light" ? "text-yellow-500" : "text-gray-400"
                      }`}
                    />
                    <span className="text-sm text-gray-600">Light</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={theme === "dark"}
                      onChange={() => toggleTheme()}
                      className="sr-only"
                    />
                    <div
                      className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                        theme === "dark" ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                          theme === "dark" ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      ></div>
                    </div>
                  </label>
                  <div className="flex items-center space-x-2">
                    <Moon
                      className={`w-4 h-4 ${
                        theme === "dark" ? "text-blue-500" : "text-gray-400"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter Current Password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter New Password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm New Password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200"
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
                  className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#1a9f4a] transition-colors cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </div>

            {/* Save Security Settings Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSecuritySave}
                className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#1a9f4a] transition-colors cursor-pointer"
              >
                Save Settings
              </button>
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
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-[#22c55e] text-[#22c55e]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
}
