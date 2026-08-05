"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Bell, Shield } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import ToggleSwitch from "@/components/ToggleSwitch";
import { Skeleton } from "@/components/ui/skeleton";
import CustomToggle from "@/components/CustomToggle";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import { useUpdateUserMutation } from "@/store/authApi";
import Dropdown from "@/components/Dropdown";
import ProfilePictureSection from "@/components/ProfilePictureSection";
import { motion } from "framer-motion";
import PillTabs from "@/components/Tabs/PillTabs";

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

  const handleProfileUrlChange = async (url: string) => {
    setProfileImage(url);

    // Auto-save the profile image
    if (userInfo?.uid) {
      try {
        await updateUser({
          userId: userInfo.uid,
          photo_url: url,
          role: userInfo.role || "doctor",
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
      <div>
        {/* Breadcrumb Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-5 w-56" />
        </div>

        {/* Card mirrors the real settings card */}
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
          {/* Tabs Skeleton (horizontal pills) */}
          <div className="border-b border-[var(--border)] p-4">
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-10 w-44 rounded-full" />
              <Skeleton className="h-10 w-52 rounded-full" />
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
          </div>

          {/* Tab Content Skeleton (Profile) */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Profile Picture Skeleton */}
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="w-24 h-24 rounded-full" />
                <Skeleton className="h-9 w-40 rounded-md" />
              </div>

              {/* Form Fields Skeleton (2-col grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                ))}
                {/* Full-width field */}
                <div className="md:col-span-2 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>

              {/* Save Button Skeleton */}
              <div className="flex justify-end">
                <Skeleton className="h-10 w-28 rounded-md" />
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
            <ProfilePictureSection
              profileImage={profileImage}
              onImageChange={handleProfileUrlChange}
              buttonClassName="bg-[#44CE2D] hover:bg-[#3bb025]"
              textClassName="text-[#44CE2D]"
            />
            {/* Profile Form */}

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="input-label mb-1.5 block text-xs md:text-sm font-medium text-[var(--foreground)]">
                  Title
                </label>
                <Dropdown
                  value={profileData.title}
                  onChange={(val) =>
                    setProfileData({ ...profileData, title: val })
                  }
                  options={[
                    { value: "Dr.", label: "Dr." },
                    { value: "Prof.", label: "Prof." },
                    { value: "Mr.", label: "Mr." },
                    { value: "Mrs.", label: "Mrs." },
                    { value: "Ms.", label: "Ms." },
                  ]}
                  placeholder="Select Title"
                  className="w-full"
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
                <label className="input-label mb-1.5 block text-xs md:text-sm font-medium text-[var(--foreground)]">
                  Gender
                </label>
                <Dropdown
                  value={profileData.gender}
                  onChange={(val) =>
                    setProfileData({ ...profileData, gender: val })
                  }
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ]}
                  placeholder="Select Gender"
                  className="w-full"
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
                <label className="block  !text-[10px]  !md:text-[12px] font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center">
                  <span
                    className={`px-3 py-2 rounded-lg  !text-[10px]  !md:text-[12px] font-medium ${profileData.isActive
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
              <h3 className="text-[14px] md:text-[16px] font-semibold text-gray-900 mb-2">
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
                  <p className=" !text-[10px]  !md:text-[12px] text-gray-600">
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
                  <p className=" !text-[10px]  !md:text-[12px] text-gray-600">
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
                  <p className=" !text-[10px]  !md:text-[12px] text-gray-600">
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
              <h3 className="text-[14px] md:text-[16px] font-semibold text-gray-900 mb-2">
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
                  <p className=" !text-[10px]  !md:text-[12px] text-gray-600">
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
                <h3 className="text-[14px] md:text-[16px] font-semibold text-gray-900 mb-2">
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

      <div className="bg-white rounded-lg border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200 p-4">
          <PillTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            layoutId="doctor-settings-active-tab"
          />
        </div>

        {/* Tab Content */}
        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  );
}
