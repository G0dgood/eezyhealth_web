"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ExternalLink,
  Calendar,
  User,
  Stethoscope,
  Landmark,
  FileText,
  AlertCircle,
  Eye,
  Receipt,
  RotateCw,
} from "lucide-react";
import Modal from "./Modal";
import Button from "@/components/Button";
import { toast } from "sonner";
import {
  useConfirmPaymentMutation,
  useRejectPaymentMutation,
  useRefundPaymentMutation,
} from "@/store/financeApi";
import { getPaymentStatusBadge, formatDate } from "@/components/Options";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentItem {
  id?: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  amount?: number | string;
  currency?: string;
  bookingDate?: string;
  slot?: string;
  channel?: string;
  reason?: string;
  receiptUrl?: string;
  paymentMethod?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };
  paymentReference?: any;
  transactionId?: any;
  paymentStatus?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  bookingId?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  refundReason?: string;
}

interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentItem | null;
  onSuccess?: () => void;
}

export default function ReceiptViewerModal({
  isOpen,
  onClose,
  payment,
  onSuccess,
}: ReceiptViewerModalProps) {
  const { userInfo } = useAuth();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [imageRotation, setImageRotation] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const [confirmPayment, { isLoading: isConfirming }] =
    useConfirmPaymentMutation();
  const [rejectPayment, { isLoading: isRejecting }] =
    useRejectPaymentMutation();
  const [refundPayment, { isLoading: isRefunding }] =
    useRefundPaymentMutation();

  if (!payment) return null;

  const currentStatus = (payment.paymentStatus || payment.status || "pending").toLowerCase();
  const isPending = currentStatus === "pending" || currentStatus === "reserved";
  const isCompleted = currentStatus === "completed" || currentStatus === "done" || currentStatus === "confirmed";

  const formatAmount = (amt: any) => {
    const num = Number(amt) || 0;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleConfirm = async () => {
    try {
      await confirmPayment({
        paymentId: payment.id || "",
        bookingId: payment.bookingId,
        patientId: payment.patientId,
        doctorId: payment.doctorId,
        patientName: payment.patientName,
        doctorName: payment.doctorName,
        amount: payment.amount,
        verifiedBy: userInfo?.display_name || userInfo?.email || "Finance Admin",
      }).unwrap();

      toast.success("Payment confirmed! The appointment is now scheduled.");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.error || "Failed to confirm payment.");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.warning("Please provide a reason for rejecting this payment");
      return;
    }

    try {
      await rejectPayment({
        paymentId: payment.id || "",
        bookingId: payment.bookingId,
        patientId: payment.patientId,
        reason: rejectReason.trim(),
        verifiedBy: userInfo?.display_name || userInfo?.email || "Finance Admin",
      }).unwrap();

      toast.success("Payment rejected and patient notified.");
      setShowRejectForm(false);
      setRejectReason("");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.error || "Failed to reject payment.");
    }
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      toast.warning("Please provide a reason for the refund");
      return;
    }

    try {
      await refundPayment({
        paymentId: payment.id || "",
        bookingId: payment.bookingId,
        patientId: payment.patientId,
        reason: refundReason.trim(),
        verifiedBy: userInfo?.display_name || userInfo?.email || "Finance Admin",
      }).unwrap();

      toast.success("Payment marked as refunded.");
      setShowRefundForm(false);
      setRefundReason("");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.error || "Failed to refund payment.");
    }
  };

  const rotateImage = () => {
    setImageRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Receipt & Verification"
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Receipt Image Preview */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-gray-700 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-[#44CE2D]" />
              Submitted Transfer Receipt
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={rotateImage}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                title="Rotate image"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              {payment.receiptUrl && (
                <a
                  href={payment.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition flex items-center gap-1 text-[11px]"
                  title="Open full image in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div
            className="w-full h-80 sm:h-96 bg-gray-900/5 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden relative cursor-zoom-in"
            onClick={() => setIsZoomed(!isZoomed)}
          >
            {payment.receiptUrl ? (
              <img
                src={payment.receiptUrl}
                alt="Payment Receipt"
                style={{
                  transform: `rotate(${imageRotation}deg) scale(${isZoomed ? 1.5 : 1})`,
                  transition: "transform 0.25s ease-in-out",
                }}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-center p-6 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No receipt image attached</p>
                <p className="text-xs text-gray-400 mt-1">
                  Reference:{" "}
                  {typeof payment.paymentReference === "object"
                    ? payment.paymentReference?.reference
                    : payment.paymentReference || "N/A"}
                </p>
              </div>
            )}
          </div>
          <span className="text-[10px] text-gray-400 mt-1.5">
            Click image to zoom in/out &bull; Use rotate button to adjust orientation
          </span>
        </div>

        {/* Right Side: Payment Details & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Amount and Status banner */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider block">
                  Amount Transferred
                </span>
                <span className="text-2xl font-extrabold text-gray-900">
                  {formatAmount(payment.amount)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider block mb-1">
                  Status
                </span>
                {getPaymentStatusBadge(payment.paymentStatus || payment.status)}
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-2.5 text-[12px]">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-gray-400" /> Patient
                </span>
                <span className="font-medium text-gray-900">
                  {payment.patientName || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-gray-400" /> Doctor
                </span>
                <span className="font-medium text-gray-900">
                  {payment.doctorName || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" /> Appointment Slot
                </span>
                <span className="font-medium text-gray-900">
                  {payment.bookingDate || "N/A"} &bull; {payment.slot || "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-gray-400" /> Bank Selected
                </span>
                <span className="font-medium text-gray-900 text-right">
                  {payment.bankDetails?.bankName || "Bank Transfer"}
                  {payment.bankDetails?.accountNumber
                    ? ` (${payment.bankDetails.accountNumber})`
                    : ""}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium text-gray-900 capitalize">
                  {payment.paymentMethod || "Bank Transfer"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Submitted At</span>
                <span className="font-medium text-gray-900">
                  {payment.createdAt ? formatDate(payment.createdAt) : "N/A"}
                </span>
              </div>

              {payment.verifiedAt && (
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 text-green-700 bg-green-50/50 px-2 rounded">
                  <span>Verified By {payment.verifiedBy || "Finance"}</span>
                  <span>{formatDate(payment.verifiedAt)}</span>
                </div>
              )}

              {payment.rejectionReason && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                  <p className="font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Rejection Reason:
                  </p>
                  <p className="mt-0.5">{payment.rejectionReason}</p>
                </div>
              )}

              {payment.refundReason && (
                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 text-xs">
                  <p className="font-semibold flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" /> Refund Reason:
                  </p>
                  <p className="mt-0.5">{payment.refundReason}</p>
                </div>
              )}
            </div>

            {/* Reject Form Drawer */}
            {showRejectForm && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                <label className="block text-[11px] font-semibold text-red-900">
                  Reason for Rejecting Payment:
                </label>
                <textarea
                  className="w-full text-[12px] p-2 border border-red-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
                  rows={2}
                  placeholder="e.g. Receipt unreadable / Amount transferred does not match fee / Account name mismatch"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline-neutral"
                    onClick={() => setShowRejectForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleReject}
                    disabled={isRejecting}
                  >
                    {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                  </Button>
                </div>
              </div>
            )}

            {/* Refund Form Drawer */}
            {showRefundForm && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                <label className="block text-[11px] font-semibold text-purple-900">
                  Reason for Refund:
                </label>
                <textarea
                  className="w-full text-[12px] p-2 border border-purple-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                  rows={2}
                  placeholder="e.g. Appointment cancelled by Doctor / Duplicate payment"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline-neutral"
                    onClick={() => setShowRefundForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="!bg-purple-600 !text-white hover:!bg-purple-700"
                    onClick={handleRefund}
                    disabled={isRefunding}
                  >
                    {isRefunding ? "Processing..." : "Process Refund"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline-neutral" onClick={onClose}>
              Close
            </Button>

            {isPending && !showRejectForm && (
              <>
                <Button
                  variant="danger"
                  onClick={() => setShowRejectForm(true)}
                  disabled={isConfirming || isRejecting}
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Reject
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  disabled={isConfirming || isRejecting}
                  className="!bg-[#44CE2D] hover:!bg-[#3bb826]"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {isConfirming ? "Confirming..." : "Confirm Payment"}
                </Button>
              </>
            )}

            {isCompleted && !showRefundForm && (
              <Button
                variant="outline-neutral"
                className="!border-purple-300 !text-purple-700 hover:!bg-purple-50"
                onClick={() => setShowRefundForm(true)}
                disabled={isRefunding}
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Issue Refund
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
