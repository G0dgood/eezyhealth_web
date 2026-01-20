"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Bell, Shield, Camera, UserCircle } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Image from "next/image";
import ToggleSwitch from "@/components/ToggleSwitch";
import { Skeleton } from "@/components/ui/skeleton";
import CustomToggle from "@/components/CustomToggle";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import { useUpdateUserMutation } from "@/store/authApi";

export default function DoctorSettings() {
  const { theme, setTheme } = useTheme();
  const { userInfo, setUserInfo } = useAuth();
  const { notificationPrefs, updateNotificationPrefs } = useNotifications();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // RTK Query Mutation
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const handleSettingsClick = () => {
    setLoading(true);
  };

  // Authentication check
  useEffect(() => {
    if (loading && userInfo && userInfo.role?.toLowerCase() === "doctor") {
      router.push("/settings");
      setLoading(false);
    } else if (loading) {
      router.push("/");
      setLoading(false);
    }
  }, [userInfo, router, loading]);

  // Initialize component
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000); // Simulate loading time

    return () => clearTimeout(timer);
  }, []);

  // Handle theme change from security settings
  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
  };

  const [profileImage, setProfileImage] = useState(userInfo?.photo_url || "");

  // Function to check if image URL is valid for Next.js Image component
  const isValidImageUrl = (url: string) => {
    if (!url || url === "/api/placeholder/120/120" || url.includes("placeholder")) return false;
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
    fullName: userInfo?.display_name || "",
    doctorId: userInfo?.uid || "",
    role: userInfo?.role || "",
    email: userInfo?.email || "",
    mobileNumber: userInfo?.phone_number || "",
    department: "n/a", // This seems unused or static for now
    specialization: (userInfo as any)?.specialization || "",
    experience: (userInfo as any)?.experience_yrs || "",
    bio: (userInfo as any)?.about || "",
    firstName: userInfo?.first_name || "",
    lastName: userInfo?.last_name || "",
    address: userInfo?.address || "",
    location: userInfo?.location || "",
    dateOfBirth: userInfo?.date_of_birth || "",
    isActive: userInfo?.isActive || false,
    hospital: (userInfo as any)?.hospital || "",
    license: (userInfo as any)?.license || "", // Medical License
    gender: (userInfo as any)?.gender || "",
    title: (userInfo as any)?.title || "",
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
        specialization: (userInfo as any).specialization || prev.specialization,
        experience: (userInfo as any).experience_yrs || prev.experience,
        bio: (userInfo as any).about || prev.bio,
        hospital: (userInfo as any).hospital || prev.hospital,
        license: (userInfo as any).license || prev.license,
        gender: (userInfo as any).gender || prev.gender,
        title: (userInfo as any).title || prev.title,
      }));
    }
  }, [userInfo]);

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: "15",
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


      // Clean up the temporary URL when component unmounts
      return () => URL.revokeObjectURL(tempUrl);
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
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        phone_number: profileData.mobileNumber,
        address: profileData.address,
        location: profileData.location,
        specialization: profileData.specialization,
        experience_yrs: profileData.experience,
        about: profileData.bio,
        hospital: profileData.hospital,
        license: profileData.license,
        gender: profileData.gender,
        title: profileData.title,
        photo_url: profileImage,
        role: userInfo.role || "doctor",
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
      
      // Update context if possible (optional, but good practice if context doesn't auto-update from localStorage listener)
      if (setUserInfo) {
        setUserInfo(updatedUserInfo as any);
      }

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(`Failed to update profile: ${(error as any)?.data?.error || (error as any)?.message || "Unknown error"}`);
    }
  };

  const handleNotificationSave = async () => {
    try {
      // Simulate API call to update notification preferences
      await new Promise((resolve) => setTimeout(resolve, 1000));


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
  if (!userInfo || userInfo.role?.toLowerCase() !== "doctor") {
    return null;
  }

  // Show skeleton loader while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-6 w-48" />
          </div>

          {/* Title Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-8 w-64" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <Skeleton className="h-6 w-40 mb-6" />

                {/* Profile Section Skeleton */}
                <div className="space-y-6">
                  {/* Profile Picture Skeleton */}
                  <div className="text-center">
                    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </div>

                  {/* Form Fields Skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>

                  {/* Save Button Skeleton */}
                  <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
                <Input
                  label="Title"
                  type="text"
                  value={profileData.title}
                  onChange={(e) =>
                    setProfileData({ ...profileData, title: e.target.value })
                  }
                  fullWidth
                  placeholder="e.g. Dr., Prof."
                />
              </div>

              <div>
                <Input
                  label="First Name"
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      firstName: e.target.value,
                    })
                  }
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Last Name"
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, lastName: e.target.value })
                  }
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Full Name"
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Gender"
                  type="text"
                  value={profileData.gender}
                  onChange={(e) =>
                    setProfileData({ ...profileData, gender: e.target.value })
                  }
                  fullWidth
                  placeholder="e.g. Male, Female"
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
                          : "n/a"
                      : "n/a"
                  }
                  disabled
                  fullWidth
                  className="bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <Input
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Mobile Number"
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
                <Input
                  label="Doctor ID"
                  type="text"
                  value={profileData.doctorId}
                  disabled
                  fullWidth
                  className="bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <Input
                  label="Role"
                  type="text"
                  value={profileData.role}
                  disabled
                  fullWidth
                  className="bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <Input
                  label="Medical License"
                  type="text"
                  value={profileData.license}
                  onChange={(e) =>
                    setProfileData({ ...profileData, license: e.target.value })
                  }
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Specialization"
                  type="text"
                  value={profileData.specialization}
                  onChange={(e) =>
                    setProfileData({ ...profileData, specialization: e.target.value })
                  }
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Experience (Years)"
                  type="text"
                  value={profileData.experience}
                  onChange={(e) =>
                    setProfileData({ ...profileData, experience: e.target.value })
                  }
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Hospital / Clinic"
                  type="text"
                  value={profileData.hospital}
                  onChange={(e) =>
                    setProfileData({ ...profileData, hospital: e.target.value })
                  }
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Address"
                  type="text"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      address: e.target.value,
                    })
                  }
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Location"
                  type="text"
                  value={profileData.location}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      location: e.target.value,
                    })
                  }
                  fullWidth
                />
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Bio / About"
                  rows={4}
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself..."
                  fullWidth
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
                      }`}>
                    {profileData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleProfileSave}
                disabled={isUpdating}
                className={`px-6 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
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
                    onChange={(checked) => {

                      updateNotificationPrefs({
                        newPatientBookings: checked,
                      });
                    }}
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
                      updateNotificationPrefs({
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
                      updateNotificationPrefs({
                        patientMessages: checked,
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
                  <CustomToggle
                    checked={theme === "dark"}
                    onChange={handleThemeToggle}
                  />
                  {/* <ToggleSwitch
                    checked={theme === "dark"}
                    onChange={handleThemeToggle}
                  /> */}
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
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
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
