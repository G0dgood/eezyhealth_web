"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, CheckCircle, Landmark } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import { toast } from "sonner";
import { useCreateDoctorAppointmentMutation } from "@/store/bookingApi";
import { useGetPricingQuery } from "@/store/pricingApi";
import { useGetCompanyBankAccountsQuery } from "@/store/financeApi";
// import axios from "axios";
import { formatTime } from "@/components/Options";
import moment from "moment";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "transfer",
    name: "Bank Transfer",
    icon: <Landmark className="w-6 h-6 text-blue-600" />,
    description:
      "Transfer to a company account. The slot is reserved until Finance verifies the payment.",
  },
  {
    id: "cash",
    name: "Cash Payment",
    icon: <span className="text-green-600 font-bold text-xl">₦</span>,
    description: "Cash collected at the hospital/clinic — books immediately",
  },
];

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // Bank-transfer specifics: which company account the patient paid into, and
  // the transfer reference the nurse read off the receipt.
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [transferReference, setTransferReference] = useState<string>("");

  // Proof of payment. Every payment must carry one before it can be completed:
  // a transfer needs the patient's uploaded receipt, and cash — which leaves no
  // bank trail at all — needs a receipt this app generates and stores.
  const [receiptBlob, setReceiptBlob] = useState<Blob | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState<string>("");
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const receiptInputRef = useRef<HTMLInputElement | null>(null);

  const hasReceipt = !!receiptBlob;

  const { data: bankAccountsData } = useGetCompanyBankAccountsQuery({
    activeOnly: true,
  });
  const bankAccounts = bankAccountsData || [];
  const selectedBank = bankAccounts.find(
    (b) => String(b.id) === selectedBankId
  );

  // RTK hook for creating doctor appointment
  const [createDoctorAppointment, { isLoading: isCreatingBooking }] =
    useCreateDoctorAppointmentMutation();

  // Get booking details from URL parameters
  const doctorId = searchParams.get("doctorId");
  const patientName = searchParams.get("patientName");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const channel = searchParams.get("channel");
  const reason = searchParams.get("reason");
  const patientId = searchParams.get("patientId");

  // Calculate consultation fee (fetched dynamically from Admin pricing)
  const { data: pricingData } = useGetPricingQuery({});
  const consultationPrice = pricingData?.pricing || 0;
  // Naira, NOT kobo. This value is written to the payments doc and read by the
  // Finance dashboard and the mobile app, both of which treat `amount` as naira
  // — the previous *100 (a Paystack requirement) made every nurse-recorded
  // payment show up as 100x its real value.
  const consultationFee = consultationPrice;

  useEffect(() => {
    // Validate required parameters
    if (!doctorId || !patientName || !date || !time || !channel) {
      toast.error("Missing booking information", {
        description: "Please go back and complete your booking",
      });
    }
  }, [doctorId, patientName, date, time, channel]);

  // Default to the first active company account once they load.
  useEffect(() => {
    if (!selectedBankId && bankAccounts.length) {
      setSelectedBankId(String(bankAccounts[0].id));
    }
  }, [bankAccounts, selectedBankId]);

  // Switching method invalidates whatever proof was attached: an uploaded
  // transfer slip isn't proof of a cash payment, and vice versa.
  const clearReceipt = () => {
    setReceiptBlob(null);
    setReceiptName("");
    setReceiptPreview((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
    if (receiptInputRef.current) receiptInputRef.current.value = "";
  };

  const handleSelectMethod = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    clearReceipt();
  };

  const handleReceiptFile = (file?: File | null) => {
    if (!file) return;
    if (!/^image\/(jpe?g|png|webp|heic|heif)$/i.test(file.type)) {
      toast.error("Unsupported file", {
        description: "Upload the receipt as a JPG, PNG or WEBP image.",
      });
      return;
    }
    // 10MB ceiling — receipts are photos/screenshots, anything larger is a
    // mistake and just slows the upload down.
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please upload a receipt image under 10MB.",
      });
      return;
    }
    clearReceipt();
    setReceiptBlob(file);
    setReceiptName(file.name);
    setReceiptPreview(URL.createObjectURL(file));
  };

  // Cash leaves no bank record, so we mint the proof ourselves: a receipt image
  // drawn on a canvas (no extra dependency) that is stored against the payment
  // exactly like an uploaded transfer slip, so Finance reviews both the same way.
  const generateCashReceipt = async () => {
    setIsGeneratingReceipt(true);
    try {
      const receiptNo = `EH-CASH-${Date.now().toString(36).toUpperCase()}`;
      const W = 760;
      const H = 1000;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not supported in this browser");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // Header band
      ctx.fillStyle = "#44CE2D";
      ctx.fillRect(0, 0, W, 110);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px Helvetica, Arial, sans-serif";
      ctx.fillText("EezyHealth", 40, 58);
      ctx.font = "16px Helvetica, Arial, sans-serif";
      ctx.fillText("Official Payment Receipt", 40, 88);

      ctx.fillStyle = "#1f2733";
      ctx.font = "bold 26px Helvetica, Arial, sans-serif";
      ctx.fillText("CASH PAYMENT RECEIVED", 40, 175);

      const rows: [string, string][] = [
        ["Receipt No.", receiptNo],
        ["Issued", new Date().toLocaleString("en-GB")],
        ["Patient", patientName || "—"],
        ["Doctor", searchParams.get("doctorName") || doctorId || "—"],
        ["Appointment", date ? formatDate(date) : "—"],
        ["Time", time ? formatTime(time) : "—"],
        ["Channel", channel || "—"],
        ["Amount", `NGN ${consultationFee.toLocaleString()}`],
        ["Method", "Cash (collected at clinic)"],
        ["Recorded by", "Nurse"],
      ];

      let y = 235;
      rows.forEach(([label, value]) => {
        ctx.fillStyle = "#8a94a6";
        ctx.font = "15px Helvetica, Arial, sans-serif";
        ctx.fillText(label, 40, y);

        ctx.fillStyle = "#1f2733";
        ctx.font = "bold 17px Helvetica, Arial, sans-serif";
        // Long values (names) get clipped rather than overflowing the card.
        const text = String(value);
        const maxWidth = W - 300;
        let shown = text;
        while (ctx.measureText(shown).width > maxWidth && shown.length > 4) {
          shown = shown.slice(0, -2);
        }
        if (shown !== text) shown += "…";
        ctx.fillText(shown, 260, y);

        ctx.strokeStyle = "#eef1f4";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, y + 16);
        ctx.lineTo(W - 40, y + 16);
        ctx.stroke();

        y += 52;
      });

      // Amount callout
      ctx.fillStyle = "#f4fbf2";
      ctx.fillRect(40, y + 14, W - 80, 92);
      ctx.fillStyle = "#1f9d16";
      ctx.font = "bold 40px Helvetica, Arial, sans-serif";
      ctx.fillText(`NGN ${consultationFee.toLocaleString()}`, 64, y + 74);

      ctx.fillStyle = "#8a94a6";
      ctx.font = "13px Helvetica, Arial, sans-serif";
      ctx.fillText(
        "Cash received in full for the consultation above.",
        40,
        y + 142
      );
      ctx.fillText(
        "This receipt was generated by EezyHealth at the point of collection.",
        40,
        y + 166
      );

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("Could not render the receipt image");

      clearReceipt();
      setReceiptBlob(blob);
      setReceiptName(`${receiptNo}.png`);
      setReceiptPreview(URL.createObjectURL(blob));
      toast.success("Receipt generated", {
        description: `${receiptNo} — review it, then confirm the payment.`,
      });
    } catch (err) {
      toast.error("Could not generate receipt", {
        description: extractErrorMessage(err),
      });
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  const uploadReceipt = async (): Promise<string> => {
    if (!receiptBlob) return "";
    const { ref, uploadBytes, getDownloadURL } = await import(
      "firebase/storage"
    );
    const { storage } = await import("@/lib/firebase");

    const isPng = receiptName.toLowerCase().endsWith(".png");
    const ext = isPng ? "png" : "jpg";
    // Same Storage path the mobile patient flow writes to, so Finance's receipt
    // viewer resolves both without special-casing.
    const path = `payment-receipts/${patientId || "nurse"}/${Date.now()}.${ext}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, receiptBlob, {
      contentType: isPng ? "image/png" : "image/jpeg",
    });
    return await getDownloadURL(storageRef);
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (selectedPaymentMethod === "transfer" && !selectedBankId) {
      toast.error("Select the account the patient transferred to");
      return;
    }

    // No proof, no payment — this is the check that used to be missing, which
    // let a booking be completed with nothing to verify it against.
    if (!hasReceipt) {
      toast.error(
        selectedPaymentMethod === "transfer"
          ? "Upload the transfer receipt first"
          : "Generate the cash receipt first",
        {
          description:
            selectedPaymentMethod === "transfer"
              ? "Finance needs the receipt image to verify this transfer."
              : "A receipt has to be issued and stored before cash can be recorded.",
        }
      );
      return;
    }

    handleManualPayment(selectedPaymentMethod);
  };

  // Pull the most specific error message available (cloud function error,
  // RTK error payload, or a JS Error) instead of a generic fallback — otherwise
  // real reasons like "slot already booked" are hidden behind "Booking failed".
  const extractErrorMessage = (error: unknown): string => {
    const e = error as {
      data?: { error?: string; message?: string };
      error?: string;
      message?: string;
    };
    return (
      e?.data?.error ||
      e?.data?.message ||
      e?.error ||
      e?.message ||
      "Please try again or contact support"
    );
  };

  // Cash is money already in hand, so it books immediately. A bank transfer has
  // to be verified by Finance first, so it only RESERVES the slot: the payment
  // is written as pending and the booking as reserved, which is what triggers
  // the Finance alert (onPaymentCreated) and, on confirmation, the promotion to
  // scheduled (onPaymentStatusChanged).
  const handleManualPayment = async (method: string) => {
    const needsVerification = method === "transfer";
    try {
      setIsProcessing(true);

      // Store the proof first — if this fails we must not create a payment
      // record that claims a receipt exists.
      const receiptUrl = await uploadReceipt();
      const paymentId = await createPaymentInFirebase(method, receiptUrl);
      await createBookingWithRTK(needsVerification, paymentId, receiptUrl);

      setIsSuccess(true);
      if (needsVerification) {
        toast.success("Receipt recorded — slot reserved", {
          description:
            "Finance has been notified to verify the transfer. The appointment is confirmed once they approve it.",
        });
      } else {
        toast.success("Cash payment confirmed!", {
          description: "Booking has been successfully created.",
        });
      }
    } catch (error) {
      toast.error("Booking confirmation failed", {
        description: extractErrorMessage(error),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const createPaymentInFirebase = async (method: string, receiptUrl: string) => {
    const { collection, addDoc } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase");

    const needsVerification = method === "transfer";
    const ref = transferReference.trim() || `APPT_MANUAL_${Date.now()}`;

    const paymentData: Record<string, unknown> = {
      doctorId: doctorId || "",
      patientName: patientName || "",
      patientId: patientId || "",
      bookingDate: date || "",
      slot: time || "",
      channel: channel || "",
      reason: reason || "",
      amount: consultationFee,
      currency: "NGN",
      paymentReference: ref,
      // A transfer is only a claim until Finance checks the account, so it stays
      // pending — that's what puts it in the Finance verification queue and
      // fires the alert. Cash is already collected, so it's complete.
      paymentStatus: needsVerification ? "pending" : "completed",
      status: needsVerification ? "pending" : "completed",
      bookingStatus: needsVerification ? "reserved" : "scheduled",
      paymentMethod: needsVerification ? "bank_transfer" : method,
      transactionId: ref,
      recordedBy: "nurse",
      receiptUrl,
      // Distinguishes a receipt we minted for cash from one the patient
      // supplied, so Finance knows what they're looking at.
      receiptSource: needsVerification ? "uploaded" : "system_generated",
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (needsVerification && selectedBank) {
      paymentData.bankDetails = {
        bankName: selectedBank.bankName || "",
        accountNumber: selectedBank.accountNumber || "",
        accountName: selectedBank.accountName || "",
      };
      if (transferReference.trim()) {
        paymentData.transferNotes = transferReference.trim();
      }
    }

    const paymentsRef = collection(db, "payments");
    const paymentDoc = await addDoc(paymentsRef, paymentData);
    return paymentDoc.id;
  };

  const createBookingWithRTK = async (
    needsVerification: boolean,
    paymentId?: string,
    receiptUrl?: string
  ) => {
    try {
      // Prepare the input data for the API. bookingStatus/paymentStatus/paymentId
      // are honoured by bookDoctorAppointment; a transfer is created as
      // "reserved" so the slot is held but not yet confirmed.
      const input = {
        bookingChannel: channel || "",
        bookingDate: moment(date).format("DD-MMM-YY") || "",
        slot: time || "",
        bookingStatus: needsVerification ? "reserved" : "scheduled",
        paymentStatus: needsVerification ? "pending" : "Paid",
        paymentId: paymentId || null,
        receiptUrl: receiptUrl || "",
      };

      // Use RTK mutation to create the booking
      const result = await createDoctorAppointment({
        patientId: patientId || "",
        doctorId: doctorId || "",
        bookingData: input,
      }).unwrap();

      // Redirect to success page or dashboard after a delay
      setTimeout(() => {
        window.location.href = "/nurse/patients";
      }, 3000);
      return result;
    } catch (error) {
      // Don't toast here — the caller (handleManualPayment / handlePaymentSuccess)
      // surfaces the real error message, so toasting here would double-report.
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isSuccess) {
    return (
      <div>
        <div className="text-center">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-[20px] md:text-[24px] font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-[14px] md:text-[16px] text-gray-600 mb-6">
            Your appointment has been confirmed and payment processed.
          </p>
          <p className=" !text-[10px]  !md:text-[12px] text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Nurse Dashboard", href: "/nurse" },
            { label: "Patients", href: "/nurse/patients" },
            { label: "Payment" },
          ]}
        />

        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            href="/nurse/patients"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-[20px] md:text-[24px] font-bold text-gray-900">Payment</h1>
            <p className="text-gray-600">Complete your appointment booking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--card)] rounded-lg shadow-sm border border-[var(--border)] p-6">
              <h2 className="text-[16px] md:text-[18px] font-semibold text-[var(--foreground)] mb-6">
                Select Payment Method
              </h2>

              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedPaymentMethod === method.id
                        ? "border-green-500 bg-green-500/10"
                        : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
                      }`}
                    onClick={() => handleSelectMethod(method.id)}>
                    <div className="flex items-center space-x-4">
                      <div className="text-[var(--muted-foreground)]">{method.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[var(--foreground)]">
                          {method.name}
                        </h3>
                        <p className=" !text-[10px]  !md:text-[12px] text-[var(--muted-foreground)]">
                          {method.description}
                        </p>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--border)] flex items-center justify-center">
                        {selectedPaymentMethod === method.id && (
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Proof of payment — required before the payment can be recorded */}
              {selectedPaymentMethod && (
                <div className="mt-8 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-[14px]">
                      {selectedPaymentMethod === "transfer"
                        ? "Upload transfer receipt"
                        : "Cash receipt"}
                      <span className="text-red-600"> *</span>
                    </h3>
                    {hasReceipt && (
                      <span className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                        Attached
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-gray-600 mb-3">
                    {selectedPaymentMethod === "transfer"
                      ? "Attach the receipt or screenshot of the patient's transfer. Finance verifies this before the appointment is confirmed."
                      : "Cash leaves no bank record, so generate a receipt for the patient. It's stored with the payment as proof of collection."}
                  </p>

                  {selectedPaymentMethod === "transfer" ? (
                    <>
                      <input
                        ref={receiptInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleReceiptFile(e.target.files?.[0] ?? null)
                        }
                        className="block w-full text-[12px] text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[12px] file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-700 file:cursor-pointer cursor-pointer"
                      />
                      <p className="text-[11px] text-gray-500 mt-2">
                        JPG, PNG or WEBP — up to 10MB.
                      </p>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={generateCashReceipt}
                      disabled={isGeneratingReceipt}
                      className={`w-full py-2.5 px-4 rounded-lg text-[13px] font-medium border transition-colors ${
                        isGeneratingReceipt
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-white text-green-700 border-green-600 hover:bg-green-50 cursor-pointer"
                      }`}>
                      {isGeneratingReceipt
                        ? "Generating receipt..."
                        : hasReceipt
                          ? "Regenerate receipt"
                          : `Generate cash receipt — ₦${consultationFee.toLocaleString()}`}
                    </button>
                  )}

                  {receiptPreview && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-[12px] text-gray-700 truncate max-w-[70%]"
                          title={receiptName}>
                          {receiptName}
                        </span>
                        <div className="flex items-center gap-3">
                          <a
                            href={receiptPreview}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[12px] font-medium text-blue-600 hover:underline">
                            View full size
                          </a>
                          <button
                            type="button"
                            onClick={clearReceipt}
                            className="text-[12px] font-medium text-red-600 hover:underline cursor-pointer">
                            Remove
                          </button>
                        </div>
                      </div>
                      {/* A plain <img> on purpose: the src is a local blob:/object
                          URL for the not-yet-uploaded receipt, which next/image
                          cannot optimise. */}
                      <img
                        src={receiptPreview}
                        alt="Payment receipt preview"
                        className="max-h-64 w-auto rounded-md border border-gray-200"
                      />
                    </div>
                  )}

                  {!hasReceipt && (
                    <p className="text-[11px] text-amber-700 mt-3">
                      {selectedPaymentMethod === "transfer"
                        ? "Upload the receipt to enable the confirm button."
                        : "Generate the receipt to enable the confirm button."}
                    </p>
                  )}
                </div>
              )}

              {/* Payment Button */}
              <div className="mt-8">
                <button
                  onClick={handlePayment}
                  disabled={
                    !selectedPaymentMethod ||
                    !hasReceipt ||
                    isProcessing ||
                    isCreatingBooking
                  }
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${selectedPaymentMethod && hasReceipt && !isProcessing
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}>
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing Payment...</span>
                    </div>
                  ) : isCreatingBooking ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating Payment & Booking...</span>
                    </div>
                  ) : selectedPaymentMethod === "transfer" ? (
                    `Record Transfer & Reserve — ₦${consultationFee.toLocaleString()}`
                  ) : (
                    `Confirm Cash Payment ₦${consultationFee.toLocaleString()}`
                  )}
                </button>
              </div>

              {/* Bank transfer: which account was paid, plus the reference */}
              {selectedPaymentMethod === "transfer" && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Landmark className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-[12px] text-blue-800 w-full">
                      <p className="font-medium">Awaiting Finance verification</p>
                      <p className="mt-1">
                        The slot is <b>reserved</b> once you record this. Finance
                        is notified to verify the transfer, and the appointment
                        is confirmed after they approve it. Unverified
                        reservations are released after 24 hours.
                      </p>

                      <label className="block mt-4 mb-1 font-medium text-gray-700">
                        Account transferred to
                      </label>
                      {bankAccounts.length === 0 ? (
                        <p className="text-red-600">
                          No active company bank account is configured. Ask
                          Finance to add one before recording a transfer.
                        </p>
                      ) : (
                        <select
                          value={selectedBankId}
                          onChange={(e) => setSelectedBankId(e.target.value)}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900">
                          {bankAccounts.map((acc) => (
                            <option key={acc.id} value={String(acc.id)}>
                              {acc.bankName} — {acc.accountNumber} (
                              {acc.accountName})
                            </option>
                          ))}
                        </select>
                      )}

                      <label className="block mt-3 mb-1 font-medium text-gray-700">
                        Transfer reference{" "}
                        <span className="font-normal text-gray-500">
                          (optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={transferReference}
                        onChange={(e) => setTransferReference(e.target.value)}
                        placeholder="e.g. session ID or payer name on the receipt"
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-[16px] md:text-[18px] font-semibold text-gray-900 mb-6">
                Booking Summary
              </h2>

              <div className="space-y-4">
                {/* Patient */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Patient:</span>
                  <span className="font-medium text-gray-900">
                    {patientName}
                  </span>
                </div>

                {/* Date */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">
                    {date ? formatDate(date) : "N/A"}
                  </span>
                </div>

                {/* Time */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium text-gray-900">
                    {time ? formatTime(time) : "N/A"}
                  </span>
                </div>

                {/* Channel */}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Channel:</span>
                  <span className="font-medium text-gray-900">{channel}</span>
                </div>

                {/* Reason */}
                <div className="flex justify-between items-start py-2 border-b border-gray-100">
                  <span className="text-gray-600">Reason:</span>
                  <span className="font-medium text-gray-900 text-right min-w-[120px]">
                    {reason || "Not specified"}
                  </span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-4 border-t border-gray-200">
                  <span className="text-[14px] md:text-[16px] font-semibold text-gray-900">
                    Total:
                  </span>
                  <span className="text-[18px] md:text-[20px] font-bold text-green-600">
                    ₦{consultationFee.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Security Note */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className=" !text-[10px]  !md:text-[12px] text-blue-800">
                    <p className="font-medium">Secure Payment</p>
                    <p className="mt-1">
                      Your payment information is encrypted and secure. We never
                      store your card details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
