"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { User, Shield, Bell, Save } from "lucide-react";
import Title from "@/components/Title";
import Input from "@/components/Input";
import Button from "@/components/Button";
import ToggleSwitch from "@/components/ToggleSwitch";
import { toast } from "sonner";
import { useUpdateUserMutation } from "@/store/authApi";

export default function FinanceSettingsPage() {
  const { userInfo, setUserInfo } = useAuth();
  const { theme, setTheme } = useTheme();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (userInfo) {
      setDisplayName(userInfo.display_name || userInfo.displayName || "");
      setPhoneNumber(userInfo.phone_number || userInfo.phone || "");
    }
  }, [userInfo]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo?.uid) return;

    try {
      await updateUser({
        uid: userInfo.uid,
        display_name: displayName,
        phone_number: phoneNumber,
      }).unwrap();

      if (userInfo) {
        setUserInfo({
          ...userInfo,
          display_name: displayName,
          displayName,
          phone_number: phoneNumber,
          phone: phoneNumber,
        });
      }

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error?.error || "Failed to update profile");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Title title="Finance Account Settings" />
        <p className="text-[12px] text-gray-500 mt-1">
          Manage your account profile and display preferences.
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
        <h2 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
          <User className="w-4 h-4 text-[#44CE2D]" />
          Personal Profile
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                fullWidth
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                value={userInfo?.email || ""}
                disabled
                placeholder="email@example.com"
                fullWidth
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+234..."
                fullWidth
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">
                Role
              </label>
              <Input
                value="Finance Officer"
                disabled
                fullWidth
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isUpdating}
              className="!bg-[#44CE2D] hover:!bg-[#3bb826] flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>

      {/* Preferences Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#44CE2D]" />
          Preferences &amp; Display
        </h2>

        <div className="space-y-4 divide-y divide-gray-100">
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-semibold text-gray-800">
                Payment Verification Alerts
              </p>
              <p className="text-[11px] text-gray-500">
                Receive notifications when patients submit new payment receipts.
              </p>
            </div>
            <ToggleSwitch
              checked={notificationsEnabled}
              onChange={setNotificationsEnabled}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-xs font-semibold text-gray-800">
                Dark Mode
              </p>
              <p className="text-[11px] text-gray-500">
                Switch between light and dark theme.
              </p>
            </div>
            <ToggleSwitch
              checked={theme === "dark"}
              onChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
