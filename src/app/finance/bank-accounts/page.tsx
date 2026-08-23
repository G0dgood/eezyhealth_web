"use client";

import React, { useState } from "react";
import {
  Landmark,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Info,
} from "lucide-react";
import Title from "@/components/Title";
import Button from "@/components/Button";
import BankAccountModal from "@/components/modals/BankAccountModal";
import {
  useGetCompanyBankAccountsQuery,
  useUpdateCompanyBankAccountMutation,
  useDeleteCompanyBankAccountMutation,
} from "@/store/financeApi";
import { BankAccount } from "@/types";
import { toast } from "sonner";

export default function FinanceBankAccountsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<BankAccount | null>(null);

  const { data: bankAccounts, isLoading, refetch } =
    useGetCompanyBankAccountsQuery();
  const [updateBank] = useUpdateCompanyBankAccountMutation();
  const [deleteBank] = useDeleteCompanyBankAccountMutation();

  const handleToggleStatus = async (acc: BankAccount) => {
    if (!acc.id) return;
    try {
      await updateBank({
        id: acc.id,
        data: { isActive: !acc.isActive },
      }).unwrap();
      toast.success(
        `Account ${!acc.isActive ? "activated" : "deactivated"} successfully`
      );
      refetch();
    } catch (e: any) {
      toast.error(e?.error || "Failed to update account status");
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this bank account?")) return;
    try {
      await deleteBank(id).unwrap();
      toast.success("Bank account deleted");
      refetch();
    } catch (e: any) {
      toast.error(e?.error || "Failed to delete account");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Account number copied to clipboard!");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title title="Company Bank Accounts" />
          <p className="text-[12px] text-gray-500 mt-1">
            Configure bank accounts for mobile app checkout. Patients transfer consultation fees directly to active accounts.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setAccountToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 !bg-[#44CE2D] hover:!bg-[#3bb826] self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Bank Account
        </Button>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800 space-y-1">
          <p className="font-semibold">How it works on mobile:</p>
          <p>
            When a patient is booking an appointment, all active bank accounts configured here are displayed in their checkout screen. The patient transfers to one of these accounts, snaps or pastes their receipt, and submits for your review.
          </p>
        </div>
      </div>

      {/* Bank Accounts Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-gray-400 text-sm">
          Loading bank accounts...
        </div>
      ) : !bankAccounts || bankAccounts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
          <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-gray-800">No Bank Accounts Found</p>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Click the button below to add your organization&apos;s first bank account for receiving patient transfers.
          </p>
          <Button
            variant="primary"
            className="mt-4 !bg-[#44CE2D] whitespace-nowrap inline-flex items-center justify-center"
            onClick={() => {
              setAccountToEdit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Bank Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bankAccounts.map((acc) => (
            <div
              key={acc.id}
              className={`p-5 rounded-2xl border bg-white transition-all space-y-3 ${acc.isActive ? "border-green-200" : "border-gray-200 opacity-75"
                }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#44CE2D] bg-[#44CE2D]/10 px-2.5 py-1 rounded-md">
                    {acc.bankName}
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xl font-mono font-extrabold text-gray-900 tracking-wider">
                      {acc.accountNumber}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(acc.accountNumber)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      title="Copy Account Number"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">
                    {acc.accountName}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(acc)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-pointer transition ${acc.isActive
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                  >
                    {acc.isActive ? "Active on App" : "Disabled"}
                  </button>
                </div>
              </div>

              {acc.instructions && (
                <div className="p-2.5 bg-gray-50 rounded-lg text-[11px] text-gray-600 border border-gray-100">
                  <span className="font-semibold text-gray-700">Instructions: </span>
                  {acc.instructions}
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline-neutral"
                  onClick={() => {
                    setAccountToEdit(acc);
                    setIsModalOpen(true);
                  }}
                  className="!text-xs py-1 px-3"
                >
                  <Edit2 className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(acc.id)}
                  className="!text-xs py-1 px-3"
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <BankAccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAccountToEdit(null);
        }}
        accountToEdit={accountToEdit}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
