"use client";

import React, { useState } from "react";
import Modal from "@/components/modals/Modal";
import Input from "@/components/Input";
import Dropdown from "@/components/Dropdown";
import Button from "@/components/Button";
import { toast } from "sonner";
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, secondaryAuth } from "@/lib/firebase";

interface AddFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export default function AddFinanceModal({
  isOpen,
  onClose,
  onSuccess,
}: AddFinanceModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim() || "Finance Officer";

      // 1. Create auth user with secondary auth to avoid overriding admin's session
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email.trim(),
        password
      );

      const user = userCredential.user;
      const uid = user.uid;

      await updateProfile(user, {
        displayName,
      });

      await signOut(secondaryAuth);

      // 2. Save user document in Firestore 'users' collection
      await setDoc(doc(db, "users", uid), {
        uid,
        email: email.trim(),
        display_name: displayName,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        gender: gender || null,
        date_of_birth: dateOfBirth || null,
        role: "finance",
        phone_number: phoneNumber.trim(),
        isActive: true,
        createdTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast.success("Finance officer account created successfully!");
      // Reset form
      setFirstName("");
      setLastName("");
      setGender("");
      setDateOfBirth("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setConfirmPassword("");
      onSuccess();
    } catch (error: any) {
      console.error("Error creating finance user:", error);
      toast.error(error?.message || "Failed to create finance account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Finance Officer">
      <form onSubmit={handleCreate} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              First Name
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Samuel"
              required
              fullWidth
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Last Name
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Okafor"
              required
              fullWidth
            />
          </div>
        </div>

        {/* Gender & Date of Birth */}
        <div className="grid  gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Gender
            </label>
            <Dropdown
              value={gender}
              onChange={(value) => setGender(value)}
              options={genderOptions}
              placeholder="Select Gender"
              className="w-full"
              variant="default"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Date of Birth
            </label>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              placeholder="YYYY-MM-DD"
              fullWidth
            />
          </div>
        </div>

        {/* Email Address & Phone Number */}
        <div className="grid  gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="finance@eezyhealth.com"
              required
              fullWidth
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Phone Number
            </label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+234..."
              fullWidth
            />
          </div>
        </div>

        {/* Passwords */}
        <div className="grid gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              fullWidth
              showPasswordToggle
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Confirm Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              fullWidth
              showPasswordToggle
            />
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
          This user will be assigned the <strong>Finance</strong> role and can verify patient transfer receipts, manage company accounts, and issue refunds.
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button
            type="button"
            variant="outline-neutral"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="!bg-[#44CE2D] hover:!bg-[#3bb826]"
          >
            {isSubmitting ? "Creating..." : "Create Finance User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
