"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  Landmark,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  Eye,
  Check,
  X,
  Trash2,
  Edit2,
  RotateCw,
  FileText,
  User,
} from "lucide-react";
import Title from "@/components/Title";
import Button from "@/components/Button";
import { useGetPaymentsQuery } from "@/store/paymentApi";
import { useGetRefundsQuery } from "@/store/refundApi";
import {
  useGetCompanyBankAccountsQuery,
  useUpdateCompanyBankAccountMutation,
  useDeleteCompanyBankAccountMutation,
} from "@/store/financeApi";
import BankAccountModal from "@/components/modals/BankAccountModal";
import ReceiptViewerModal from "@/components/modals/ReceiptViewerModal";
import {
  formatDate,
  getPaymentStatusBadge,
  NoRecordFound,
  SVGLoaderFetch,
} from "@/components/Options";
import { BankAccount } from "@/types";
import { toast } from "sonner";
import Link from "next/link";

export default function FinanceDashboardPage() {
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<BankAccount | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // RTK queries
  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
    refetch: refetchPayments,
  } = useGetPaymentsQuery({});

  const {
    data: bankAccountsData,
    isLoading: isBanksLoading,
    refetch: refetchBanks,
  } = useGetCompanyBankAccountsQuery();

  // Refunds are their own collection, not a payment status.
  const { data: refundsData } = useGetRefundsQuery({});

  const [updateBank] = useUpdateCompanyBankAccountMutation();
  const [deleteBank] = useDeleteCompanyBankAccountMutation();

  const paymentsList = useMemo(() => {
    return Array.isArray(paymentsData) ? paymentsData : [];
  }, [paymentsData]);

  const refundsList = useMemo(() => {
    return Array.isArray(refundsData) ? refundsData : [];
  }, [refundsData]);

  // Compute stats
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let pendingCount = 0;
    let completedCount = 0;
    let failedCount = 0;
    let refundedPaymentBookings = new Set<string>();
    let refundedPaymentsWithoutRequest = 0;

    paymentsList.forEach((p: any) => {
      const status = (p.paymentStatus || p.status || "").toLowerCase();
      const amt = Number(p.amount) || 0;

      if (status === "completed" || status === "done" || status === "confirmed" || status === "successful") {
        totalRevenue += amt;
        completedCount++;
      } else if (status === "pending" || status === "reserved") {
        pendingCount++;
      } else if (status === "failed" || status === "rejected") {
        failedCount++;
      } else if (status === "refunded" || status === "refund") {
        refundedPaymentBookings.add(String(p.bookingId || `payment:${p.id}`));
      }
    });

    // Refunds live in the `refunds` collection, so counting only payments marked
    // "refunded" reported 0. Count refund requests, plus refunded payments that
    // have no matching refund doc, deduped on bookingId.
    const requestBookings = new Set(
      refundsList.map((r: any) => String(r.bookingId || "")).filter(Boolean)
    );
    refundedPaymentBookings.forEach((key) => {
      if (!requestBookings.has(key)) refundedPaymentsWithoutRequest++;
    });

    return {
      totalRevenue,
      pendingCount,
      completedCount,
      failedCount,
      refundCount: refundsList.length + refundedPaymentsWithoutRequest,
      totalTransactions: paymentsList.length,
    };
  }, [paymentsList, refundsList]);

  // Pending payments list
  const pendingPayments = useMemo(() => {
    return paymentsList.filter((p: any) => {
      const status = (p.paymentStatus || p.status || "pending").toLowerCase();
      return status === "pending" || status === "reserved";
    });
  }, [paymentsList]);

  const formatNaira = (amt: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const handleToggleBankStatus = async (account: BankAccount) => {
    if (!account.id) return;
    try {
      await updateBank({
        id: account.id,
        data: { isActive: !account.isActive },
      }).unwrap();
      toast.success(
        `Bank account ${!account.isActive ? "activated" : "deactivated"}!`
      );
      refetchBanks();
    } catch (e: any) {
      toast.error(e?.error || "Failed to update status");
    }
  };

  const handleDeleteBank = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this bank account?")) return;

    try {
      await deleteBank(id).unwrap();
      toast.success("Bank account deleted");
      refetchBanks();
    } catch (e: any) {
      toast.error(e?.error || "Failed to delete account");
    }
  };

  const handleViewReceipt = (payment: any) => {
    setSelectedPayment(payment);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title title="Finance & Payments Dashboard" />
          <p className="text-[12px] text-gray-500 mt-1">
            Manage company bank accounts, review payment receipts, and verify patient transfers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline-neutral"
            onClick={() => {
              refetchPayments();
              refetchBanks();
            }}
            className="flex items-center gap-1.5"
          >
            <RotateCw className="w-4 h-4" /> Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setAccountToEdit(null);
              setIsBankModalOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 !bg-[#44CE2D] hover:!bg-[#3bb826] whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Bank Account
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-medium text-gray-500">
              Total Verified Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#44CE2D]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNaira(stats.totalRevenue)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            From {stats.completedCount} confirmed payments
          </p>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-medium text-amber-700 font-semibold">
              Pending Verification
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-900">
            {stats.pendingCount}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[11px] text-amber-600">Awaiting receipt review</p>
            <Link
              href="/finance/payments?tab=pending"
              className="text-[11px] font-medium text-amber-700 hover:underline"
            >
              Review all &rarr;
            </Link>
          </div>
          {stats.pendingCount > 0 && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full m-2 animate-ping" />
          )}
        </div>

        {/* Confirmed Transactions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-medium text-gray-500">
              Confirmed Appointments
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.completedCount}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Successfully scheduled</p>
        </div>

        {/* Failed / Refunds */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-medium text-gray-500">
              Failed &amp; Refunds
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.failedCount + stats.refundCount}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {stats.failedCount} failed &bull; {stats.refundCount} refunded
          </p>
        </div>
      </div>

      {/* Section 1: Company Bank Accounts Management */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[#44CE2D]" />
              Active Company Bank Accounts
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              These account numbers appear directly in the mobile app for patient transfers.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline-neutral"
            onClick={() => {
              setAccountToEdit(null);
              setIsBankModalOpen(true);
            }}
            className="flex items-center gap-1 text-[11px]"
          >
            <Plus className="w-3.5 h-3.5" /> Add New
          </Button>
        </div>

        {isBanksLoading ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            Loading bank accounts...
          </div>
        ) : !bankAccountsData || bankAccountsData.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50/50">
            <Landmark className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">No bank accounts configured</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Add at least one bank account so patients on the mobile app can transfer consultation fees.
            </p>
            <Button
              size="sm"
              variant="primary"
              className="mt-3 !bg-[#44CE2D]"
              onClick={() => setIsBankModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Account Now
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccountsData.map((acc) => (
              <div
                key={acc.id}
                className={`p-4 rounded-xl border transition-all ${acc.isActive
                  ? "border-green-200 bg-green-50/20"
                  : "border-gray-200 bg-gray-50 opacity-75"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#44CE2D] bg-[#44CE2D]/10 px-2 py-0.5 rounded">
                      {acc.bankName}
                    </span>
                    <p className="text-lg font-mono font-extrabold text-gray-900 tracking-wider pt-1">
                      {acc.accountNumber}
                    </p>
                    <p className="text-xs font-medium text-gray-700">
                      {acc.accountName}
                    </p>
                    {acc.instructions && (
                      <p className="text-[10px] text-gray-500 italic pt-1">
                        &quot;{acc.instructions}&quot;
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleBankStatus(acc)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition ${acc.isActive
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                    >
                      {acc.isActive ? "Active (In App)" : "Disabled"}
                    </button>
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountToEdit(acc);
                          setIsBankModalOpen(true);
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-900 rounded hover:bg-gray-100"
                        title="Edit Account"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBank(acc.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Recent Pending Receipts (Action Required) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Receipts Awaiting Confirmation
              {pendingPayments.length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
                  {pendingPayments.length} Pending
                </span>
              )}
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Review receipts submitted by patients to confirm payment and transition bookings from Reserved to Scheduled.
            </p>
          </div>
          <Link
            href="/finance/payments?tab=pending"
            className="text-[12px] font-semibold text-[#44CE2D] hover:underline flex items-center gap-1"
          >
            View All Payments &rarr;
          </Link>
        </div>

        {isPaymentsLoading ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            Loading payments...
          </div>
        ) : pendingPayments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-gray-100">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-gray-800">All caught up!</p>
            <p className="text-xs text-gray-500 mt-1">
              No pending payment receipts currently waiting for verification.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th>Patient</th>
                  <th>Doctor / Slot</th>
                  <th>Amount</th>
                  <th>Bank</th>
                  <th>Receipt</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {pendingPayments.slice(0, 5).map((payment: any) => (
                  <tr key={payment.id || Math.random()} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                          {payment.patientName?.charAt(0) || <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">
                            {payment.patientName || "Anonymous"}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            ID: {payment.patientId?.slice(0, 8) || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-medium text-gray-800">
                        {payment.doctorName || "General Consultation"}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {payment.bookingDate || "N/A"} ({payment.slot || "Slot"})
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-bold text-gray-900">
                        {formatNaira(payment.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-gray-700">
                        {payment.bankDetails?.bankName || "Transfer"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {payment.receiptUrl ? (
                        <button
                          type="button"
                          onClick={() => handleViewReceipt(payment)}
                          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <img
                            src={payment.receiptUrl}
                            alt="thumb"
                            className="w-6 h-6 object-cover rounded border border-gray-200"
                          />
                          View Receipt
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> No photo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {payment.createdAt ? formatDate(payment.createdAt) : "N/A"}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleViewReceipt(payment)}
                        className="!bg-[#44CE2D] !text-[11px] py-1 px-3"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Verify
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <BankAccountModal
        isOpen={isBankModalOpen}
        onClose={() => {
          setIsBankModalOpen(false);
          setAccountToEdit(null);
        }}
        accountToEdit={accountToEdit}
        onSuccess={() => refetchBanks()}
      />

      <ReceiptViewerModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
        onSuccess={() => {
          refetchPayments();
        }}
      />
    </div>
  );
}
