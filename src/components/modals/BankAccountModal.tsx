"use client";

import React, { useState, useEffect } from "react";
import { Landmark, Check, X } from "lucide-react";
import Modal from "./Modal";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Button from "@/components/Button";
import { BankAccount } from "@/types";
import { toast } from "sonner";
import {
  useCreateCompanyBankAccountMutation,
  useUpdateCompanyBankAccountMutation,
} from "@/store/financeApi";

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: BankAccount | null;
  onSuccess?: () => void;
}

export default function BankAccountModal({
  isOpen,
  onClose,
  accountToEdit,
  onSuccess,
}: BankAccountModalProps) {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [createAccount, { isLoading: isCreating }] =
    useCreateCompanyBankAccountMutation();
  const [updateAccount, { isLoading: isUpdating }] =
    useUpdateCompanyBankAccountMutation();

  useEffect(() => {
    if (accountToEdit) {
      setBankName(accountToEdit.bankName || "");
      setAccountNumber(accountToEdit.accountNumber || "");
      setAccountName(accountToEdit.accountName || "");
      setInstructions(accountToEdit.instructions || "");
      setIsActive(accountToEdit.isActive ?? true);
    } else {
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setInstructions("");
      setIsActive(true);
    }
  }, [accountToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankName.trim()) {
      toast.warning("Please enter bank name");
      return;
    }
    if (!accountNumber.trim()) {
      toast.warning("Please enter 10-digit account number");
      return;
    }
    if (!accountName.trim()) {
      toast.warning("Please enter account name");
      return;
    }

    try {
      if (accountToEdit?.id) {
        await updateAccount({
          id: accountToEdit.id,
          data: {
            bankName: bankName.trim(),
            accountNumber: accountNumber.trim(),
            accountName: accountName.trim(),
            instructions: instructions.trim(),
            isActive,
          },
        }).unwrap();
        toast.success("Bank account updated successfully!");
      } else {
        await createAccount({
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
          instructions: instructions.trim(),
          isActive,
        }).unwrap();
        toast.success("Bank account created! It will now show on mobile app checkout.");
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.error || "Failed to save bank account.");
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={accountToEdit ? "Edit Company Bank Account" : "Add Company Bank Account"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[11px] md:text-[12px] text-blue-800 flex items-start gap-2">
          <Landmark className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <span>
            This bank account will be displayed to patients in the mobile app
            checkout to make transfer payments.
          </span>
        </div>

        <div>
          <label className="block text-[11px] md:text-[12px] font-medium text-gray-700 mb-1">
            Bank Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Guaranty Trust Bank (GTBank), Zenith Bank, Access Bank"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            fullWidth
            required
          />
        </div>

        <div>
          <label className="block text-[11px] md:text-[12px] font-medium text-gray-700 mb-1">
            Account Number (NUBAN) <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. 0123456789"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            maxLength={10}
            fullWidth
            required
          />
        </div>

        <div>
          <label className="block text-[11px] md:text-[12px] font-medium text-gray-700 mb-1">
            Account Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. EezyHealth Limited"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            fullWidth
            required
          />
        </div>

        <div>
          <label className="block text-[11px] md:text-[12px] font-medium text-gray-700 mb-1">
            Payment Instructions (Optional)
          </label>
          <Textarea
            placeholder="e.g. Use your full name or phone number as transfer description/narration."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            fullWidth
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <span className="text-[12px] font-medium text-gray-800 block">
              Active Account
            </span>
            <span className="text-[10px] text-gray-500">
              Only active bank accounts are shown to patients during checkout.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
              isActive ? "bg-[#44CE2D]" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                isActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline-neutral"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Saving..." : accountToEdit ? "Update Account" : "Add Account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
