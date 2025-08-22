"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { User, Bell, Shield, Camera } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Image from "next/image";

export default function AdminSettings() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");

  // Debug logging
  console.log("Admin Settings - Current theme:", theme);
  console.log(
    "Admin Settings - Document data-theme:",
    document.documentElement.getAttribute("data-theme")
  );

  const [profileImage, setProfileImage] = useState("/api/placeholder/120/120");

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: "Admin User",
    adminId: "ADM-001",
    role: "System Administrator",
    email: "admin@eezyhealth.com",
    mobileNumber: "08012345678",
    department: "IT & Administration",
    accessLevel: "Full Access",
    bio: "System administrator with full access to all healthcare management system features and user management capabilities.",
  });

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    newUserRegistrations: true,
    systemAlerts: true,
    securityAlerts: true,
    userAccountUpdates: true,
    systemMaintenance: true,
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
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = () => {
    console.log("Profile saved:", profileData);
    // Add toast notification here
  };

  const handleNotificationSave = () => {
    console.log("Notification preferences saved:", notificationPrefs);
    // Add toast notification here
  };

  const handleSecuritySave = () => {
    console.log("Security settings saved:", securitySettings);
    // Add toast notification here
  };

  const handlePasswordUpdate = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    console.log("Password updated");
    // Add toast notification here
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
                <Image
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
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
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin ID
                </label>
                <input
                  type="text"
                  value={profileData.adminId}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      adminId: e.target.value,
                    })
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
                    setProfileData({
                      ...profileData,
                      role: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 cursor-pointer">
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
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={profileData.department}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      department: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 cursor-pointer">
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
                    setProfileData({
                      ...profileData,
                      accessLevel: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 cursor-pointer">
                  <option value="Full Access">Full Access</option>
                  <option value="Limited Access">Limited Access</option>
                  <option value="Read Only">Read Only</option>
                  <option value="User Management">User Management</option>
                </select>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) =>
                  setProfileData({ ...profileData, bio: e.target.value })
                }
                rows={4}
                maxLength={400}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 resize-none"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {profileData.bio.length} characters
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleProfileSave}
                className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#1a9f4a] transition-colors cursor-pointer">
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
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    New User Registrations
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get notified when new users register in the system.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.newUserRegistrations}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        newUserRegistrations: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      notificationPrefs.newUserRegistrations
                        ? "bg-[#22c55e]"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        notificationPrefs.newUserRegistrations
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
              </div>

              {/* System Alerts */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">System Alerts</h3>
                  <p className="text-sm text-gray-600">
                    Receive critical system alerts and notifications.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.systemAlerts}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        systemAlerts: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      notificationPrefs.systemAlerts
                        ? "bg-[#22c55e]"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        notificationPrefs.systemAlerts
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
              </div>

              {/* Security Alerts */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Security Alerts</h3>
                  <p className="text-sm text-gray-600">
                    Get notified about security breaches or suspicious
                    activities.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.securityAlerts}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        securityAlerts: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      notificationPrefs.securityAlerts
                        ? "bg-[#22c55e]"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        notificationPrefs.securityAlerts
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
              </div>

              {/* User Account Updates */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    User Account Updates
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get notified when user accounts are modified or updated.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.userAccountUpdates}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        userAccountUpdates: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      notificationPrefs.userAccountUpdates
                        ? "bg-[#22c55e]"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        notificationPrefs.userAccountUpdates
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
              </div>

              {/* System Maintenance */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    System Maintenance
                  </h3>
                  <p className="text-sm text-gray-600">
                    Receive notifications about scheduled maintenance and
                    updates.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.systemMaintenance}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        systemMaintenance: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      notificationPrefs.systemMaintenance
                        ? "bg-[#22c55e]"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        notificationPrefs.systemMaintenance
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
              </div>

              {/* Emergency Notifications */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    Emergency Notifications
                  </h3>
                  <p className="text-sm text-gray-600">
                    Receive urgent notifications about system emergencies.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.emergencyNotifications}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        emergencyNotifications: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      notificationPrefs.emergencyNotifications
                        ? "bg-[#22c55e]"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        notificationPrefs.emergencyNotifications
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
              </div>

              {/* Report Generation */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    Report Generation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get notified when system reports are generated.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.reportGeneration}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        reportGeneration: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      notificationPrefs.reportGeneration
                        ? "bg-[#22c55e]"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        notificationPrefs.reportGeneration
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
              </div>

              {/* Backup Notifications */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    Backup Notifications
                  </h3>
                  <p className="text-sm text-gray-600">
                    Receive notifications about system backups and data
                    protection.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.backupNotifications}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        backupNotifications: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      notificationPrefs.backupNotifications
                        ? "bg-[#22c55e]"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        notificationPrefs.backupNotifications
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleNotificationSave}
                className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#1a9f4a] transition-colors cursor-pointer">
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

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-gray-600">
                    Require 2FA for admin access
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        twoFactorAuth: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      securitySettings.twoFactorAuth
                        ? "bg-[#22c55e]"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        securitySettings.twoFactorAuth
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
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
                  <input
                    type="number"
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

              {/* IP Whitelist */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    IP Address Whitelist
                  </h4>
                  <p className="text-sm text-gray-600">
                    Restrict admin access to specific IP addresses
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.ipWhitelist}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        ipWhitelist: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      securitySettings.ipWhitelist
                        ? "bg-[#22c55e]"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        securitySettings.ipWhitelist
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
              </div>

              {/* Audit Logging */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Audit Logging</h4>
                  <p className="text-sm text-gray-600">
                    Log all admin actions for security monitoring
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.auditLogging}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        auditLogging: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      securitySettings.auditLogging
                        ? "bg-[#22c55e]"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        securitySettings.auditLogging
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Dark Mode</h4>
                  <p className="text-sm text-gray-600">
                    Toggle between light and dark themes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme === "dark"}
                    onChange={(e) =>
                      setTheme(e.target.checked ? "dark" : "light")
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      theme === "dark" ? "bg-[#22c55e]" : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        theme === "dark" ? "translate-x-5" : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
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
                  className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#1a9f4a] transition-colors cursor-pointer">
                  Update Password
                </button>
              </div>
            </div>

            {/* Save Security Settings Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSecuritySave}
                className="px-6 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#1a9f4a] transition-colors cursor-pointer">
                Save Settings
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
