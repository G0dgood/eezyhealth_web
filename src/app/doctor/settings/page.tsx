"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Bell, Shield, Camera, UserCircle } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Image from "next/image";
import ToggleSwitch from "@/components/ToggleSwitch";

export default function DoctorSettings() {
  const { theme, setTheme } = useTheme();
  const { userInfo } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  console.log("userInfo--userInfo", userInfo);

  // Authentication check
  useEffect(() => {
    if (!userInfo || userInfo.role !== "DOCTOR") {
      router.push("/");
      return;
    }
  }, [userInfo, router]);

  // Sync securitySettings.darkMode with actual theme
  useEffect(() => {
    setSecuritySettings((prev) => ({
      ...prev,
      darkMode: theme === "dark",
    }));
  }, [theme]);

  // Handle theme change from security settings
  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
  };

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
    fullName: userInfo?.display_name || "n/a",
    doctorId: userInfo?.uid || "n/a",
    role: userInfo?.role || "n/a",
    email: userInfo?.email || "n/a",
    mobileNumber: userInfo?.phone_number || "n/a",
    department: "n/a",
    specialization: "n/a",
    experience: "n/a",
    bio: "n/a",
    firstName: userInfo?.first_name || "n/a",
    lastName: userInfo?.last_name || "n/a",
    address: userInfo?.address || "n/a",
    location: userInfo?.location || "n/a",
    dateOfBirth: userInfo?.date_of_birth || "n/a",
    isActive: userInfo?.isActive || false,
  });

  // Sync profileData with userInfo when it changes
  useEffect(() => {
    if (userInfo) {
      setProfileData((prev) => ({
        ...prev,
        fullName: userInfo.display_name || prev.fullName,
        doctorId: userInfo.uid || prev.doctorId,
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

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    newPatientBookings: true,
    appointmentReminders: true,
    patientMessages: true,
    systemAlerts: true,
    emergencyNotifications: true,
    reportGeneration: false,
    backupNotifications: true,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: "15",
    ipWhitelist: false,
    auditLogging: true,
    darkMode: false,
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a temporary URL for the selected file
      const tempUrl = URL.createObjectURL(file);
      setProfileImage(tempUrl);

      // In a real app, you would upload this file to Firebase Storage
      // and then update the user's profile with the new photo URL
      console.log("Profile image selected:", file.name);

      // Clean up the temporary URL when component unmounts
      return () => URL.revokeObjectURL(tempUrl);
    }
  };

  const handleProfileSave = async () => {
    try {
      // Simulate API call to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update profile data (in real app, this would call Firebase)
      console.log("Profile saved:", profileData);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleNotificationSave = async () => {
    try {
      // Simulate API call to update notification preferences
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Notification preferences saved:", notificationPrefs);
      toast.success("Notification preferences updated successfully!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          "Failed to update notification preferences. Please try again."
        );
      }
    }
  };

  const handleSecuritySave = async () => {
    try {
      // Simulate API call to update security settings
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update securitySettings.darkMode to match current theme
      setSecuritySettings((prev) => ({
        ...prev,
        darkMode: theme === "dark",
      }));

      console.log("Security settings saved:", securitySettings);
      toast.success("Security settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update security settings. Please try again.");
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

    try {
      // Simulate API call to update password
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Password updated");
      toast.success("Password updated successfully!");

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Failed to update password. Please try again.");
    }
  };

  // Redirect if not authenticated
  if (!userInfo || userInfo.role !== "DOCTOR") {
    return null;
  }

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
                  <Image
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
                <label className="absolute bottom-0 right-0 bg-[#44CE2D] text-white p-2 rounded-full cursor-pointer hover:bg-[#3bb025] transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[#44CE2D] font-medium mt-2 cursor-pointer">
                Update
              </p>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      firstName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D] transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, lastName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D] transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D] transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor ID
                </label>
                <input
                  type="text"
                  value={profileData.doctorId}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={profileData.role}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D] transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={profileData.mobileNumber}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      mobileNumber: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D] transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D] transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D] transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="text"
                  value={
                    profileData.dateOfBirth
                      ? new Date(
                          profileData.dateOfBirth.seconds * 1000
                        ).toLocaleDateString()
                      : "n/a"
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
                    }`}>
                    {profileData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleProfileSave}
                className="px-6 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Notification Preferences
              </h3>
              <p className="text-gray-600">
                Customize how you receive notifications and alerts.
              </p>
            </div>

            <div className="space-y-4">
              {/* New Patient Bookings */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h3 className="font-medium text-gray-900">
                    New Patient Bookings
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get notified when new patients book appointments with you.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={notificationPrefs.newPatientBookings}
                    onChange={(checked) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        newPatientBookings: checked,
                      })
                    }
                  />
                </div>
              </div>

              {/* Appointment Reminders */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h3 className="font-medium text-gray-900">
                    Appointment Reminders
                  </h3>
                  <p className="text-sm text-gray-600">
                    Receive reminders about upcoming appointments.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={notificationPrefs.appointmentReminders}
                    onChange={(checked) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        appointmentReminders: checked,
                      })
                    }
                  />
                </div>
              </div>

              {/* Patient Messages */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h3 className="font-medium text-gray-900">
                    Patient Messages
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get notified when patients send you messages.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={notificationPrefs.patientMessages}
                    onChange={(checked) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        patientMessages: checked,
                      })
                    }
                  />
                </div>
              </div>

              {/* System Alerts */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h3 className="font-medium text-gray-900">System Alerts</h3>
                  <p className="text-sm text-gray-600">
                    Receive critical system alerts and notifications.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={notificationPrefs.systemAlerts}
                    onChange={(checked) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        systemAlerts: checked,
                      })
                    }
                  />
                </div>
              </div>

              {/* Emergency Notifications */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h3 className="font-medium text-gray-900">
                    Emergency Notifications
                  </h3>
                  <p className="text-sm text-gray-600">
                    Receive urgent notifications about emergencies.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={notificationPrefs.emergencyNotifications}
                    onChange={(checked) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        emergencyNotifications: checked,
                      })
                    }
                  />
                </div>
              </div>

              {/* Report Generation */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h3 className="font-medium text-gray-900">
                    Report Generation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get notified when reports are generated.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={notificationPrefs.reportGeneration}
                    onChange={(checked) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        reportGeneration: checked,
                      })
                    }
                  />
                </div>
              </div>

              {/* Backup Notifications */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h3 className="font-medium text-gray-900">
                    Backup Notifications
                  </h3>
                  <p className="text-sm text-gray-600">
                    Receive notifications about system backups.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={notificationPrefs.backupNotifications}
                    onChange={(checked) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        backupNotifications: checked,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleNotificationSave}
                className="px-6 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors">
                Save Preferences
              </button>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Security Settings
              </h3>
              <p className="text-gray-600">
                Manage your account security and privacy settings.
              </p>
            </div>

            <div className="space-y-4">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h4 className="font-medium text-gray-900">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-gray-600">
                    Require 2FA for doctor access
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={securitySettings.twoFactorAuth}
                    onChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        twoFactorAuth: checked,
                      })
                    }
                  />
                </div>
              </div>

              {/* IP Whitelist */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h4 className="font-medium text-gray-900">
                    IP Address Whitelist
                  </h4>
                  <p className="text-sm text-gray-600">
                    Restrict doctor access to specific IP addresses
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={securitySettings.ipWhitelist}
                    onChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        ipWhitelist: checked,
                      })
                    }
                  />
                </div>
              </div>

              {/* Audit Logging */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h4 className="font-medium text-gray-900">Audit Logging</h4>
                  <p className="text-sm text-gray-600">
                    Track and log all doctor actions for security monitoring
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={securitySettings.auditLogging}
                    onChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        auditLogging: checked,
                      })
                    }
                  />
                </div>
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1 pr-4">
                  <h4 className="font-medium text-gray-900">Dark Mode</h4>
                  <p className="text-sm text-gray-600">
                    Enable dark theme for the doctor interface
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Current theme: {theme}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ToggleSwitch
                    checked={theme === "dark"}
                    onChange={handleThemeToggle}
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D] transition-all duration-200"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D] transition-all duration-200"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D] transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePasswordUpdate}
                  className="px-6 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors">
                  Update Password
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSecuritySave}
                className="px-6 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors">
                Save Security Settings
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
      <div className="mb-6">
        <Breadcrumb
          homeHref="/doctor"
          items={[
            { label: "Doctor", href: "/doctor" },
            { label: "Settings", href: "/doctor/settings" },
          ]}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-[#44CE2D] text-[#44CE2D]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}>
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
