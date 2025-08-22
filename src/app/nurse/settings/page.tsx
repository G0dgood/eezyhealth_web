"use client";

import { useState } from "react";
import { User, Bell, Shield, Camera } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

export default function NurseSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileImage, setProfileImage] = useState("/api/placeholder/120/120");

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: "Dr Tunde Sanni",
    medicalLicense: "MD-12345",
    specialization: "Cardiology",
    email: "tundesanni@gmail.com",
    mobileNumber: "08034567890",
    yearsOfExperience: "5",
    hospitalClinic: "LASUTH",
    consultationFees: "",
    bio: "Dr. Tunde is a board-certified cardiologist with over 15 years of experience in diagnosing and treating heart conditions. She specializes in interventional cardiology and has a particular interest in minimally invasive procedures.",
  });

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    newAppointments: true,
    patientReschedulings: true,
    accountUpdates: false,
    appointmentUpdates: true,
    appointmentCancellations: true,
    systemAlerts: false,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
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
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
                <label className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full cursor-pointer hover:bg-green-600 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-green-600 font-medium mt-2 cursor-pointer">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical License
                </label>
                <input
                  type="text"
                  value={profileData.medicalLicense}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      medicalLicense: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <select
                  value={profileData.specialization}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      specialization: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer">
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={profileData.yearsOfExperience}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      yearsOfExperience: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital/Clinic
                </label>
                <input
                  type="text"
                  value={profileData.hospitalClinic}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      hospitalClinic: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fees
                </label>
                <input
                  type="text"
                  value={profileData.consultationFees}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      consultationFees: e.target.value,
                    })
                  }
                  placeholder="Enter consultation fees"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
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
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                Save
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
                    Get notified immediately when a new appointment is booked.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.newAppointments}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        newAppointments: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      notificationPrefs.newAppointments
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        notificationPrefs.newAppointments
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
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
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.patientReschedulings}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        patientReschedulings: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      notificationPrefs.patientReschedulings
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        notificationPrefs.patientReschedulings
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
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
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.accountUpdates}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        accountUpdates: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      notificationPrefs.accountUpdates
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        notificationPrefs.accountUpdates
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
              </div>

              {/* Appointment Updates */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    Appointment Updates
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get alerts for modifications made to existing appointments
                    by staff.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.appointmentUpdates}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        appointmentUpdates: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      notificationPrefs.appointmentUpdates
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        notificationPrefs.appointmentUpdates
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}></div>
                  </div>
                </label>
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
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.appointmentCancellations}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        appointmentCancellations: e.target.checked,
                      })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      notificationPrefs.appointmentCancellations
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}>
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                        notificationPrefs.appointmentCancellations
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
                    Receive alerts about system maintenance, downtime, or other
                    technical issues.
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
                        ? "bg-green-500"
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
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleNotificationSave}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
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
                  Configure security and access control
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
                        ? "bg-green-500"
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
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center"
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
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter Password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    placeholder="Enter New Password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                  Update Password
                </button>
              </div>
            </div>

            {/* Save Security Settings Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSecuritySave}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
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
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
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
