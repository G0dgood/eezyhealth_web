"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import { toast } from "sonner";
import { useCreateDoctorAppointmentMutation } from "@/store/api";
// import axios from "axios";
import { formatTime } from "@/components/Options";
import moment from "moment";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface PaystackResponse {
  reference: string;
  trxref: string;
  status: string;
  message: string;
  transaction: string;
  amount: number;
  currency: string;
}

interface PaystackHandler {
  openIframe: () => void;
}

interface PaystackPop {
  setup: (options: PaystackOptions) => PaystackHandler;
}

interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency: string;
  reference: string;
  callback_url: string;
  metadata: Record<string, unknown>;
  channels: string[];
  label: string;
  custom_fields: Array<{
    display_name: string;
    variable_name: string;
    value: string;
  }>;
  onClose: () => void;
  onSuccess: (response: PaystackResponse) => void;
}

declare global {
  interface Window {
    PaystackPop: PaystackPop;
  }
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "paystack",
    name: "Paystack",
    icon: <CreditCard className="w-6 h-6" />,
    description: "Pay securely with card, bank transfer, or USSD",
  },
  {
    id: "cash",
    name: "Cash Payment",
    icon: <span className="text-green-600">₦</span>,
    description: "Pay in cash at the hospital/clinic",
  },
];

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPaystackLoaded, setIsPaystackLoaded] = useState(false);

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

  // Calculate consultation fee (you can make this dynamic based on doctor/specialization)
  const consultationFee = 10000; // N10,000 in kobo

  useEffect(() => {
    // Validate required parameters
    if (!doctorId || !patientName || !date || !time || !channel) {
      toast.error("Missing booking information", {
        description: "Please go back and complete your booking",
      });
    }
  }, [doctorId, patientName, date, time, channel]);

  // Initialize Paystack
  useEffect(() => {
    // Load Paystack script
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;

    script.onload = () => {
      setIsPaystackLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load Paystack script");
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (selectedPaymentMethod === "cash") {
      handleCashPayment();
      return;
    }

    if (selectedPaymentMethod === "paystack") {
      handlePaystackPayment();
      return;
    }
  };

  const handleCashPayment = async () => {
    try {
      setIsProcessing(true);

      // Simulate cash payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsSuccess(true);
      toast.success("Cash payment confirmed!", {
        description: "Please bring the exact amount on appointment day",
      });

      // Redirect to success page or dashboard after a delay
      setTimeout(() => {
        window.location.href = "/nurse/patients";
      }, 3000);
    } catch (error) {
      toast.error("Payment confirmation failed", {
        description: "Please try again or contact support",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaystackPayment = async () => {
    try {
      // Check if Paystack is loaded
      if (!isPaystackLoaded) {
        setIsPaystackLoaded(false);
        toast.error("Payment system not ready", {
          description: "Please wait for the payment system to load",
        });
        return;
      }

      setIsProcessing(true);

      // Create payment data
      const paymentData = {
        email: "chinedu.go@gmail.com",
        amount: consultationFee, // Amount in kobo
        currency: "NGN",
        reference: `APPT_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        callback_url: `${window.location.origin}/nurse/patients/payment/success`,
        metadata: {
          doctorId,
          patientName,
          date,
          time,
          channel,
          reason,
          type: "appointment_booking",
        },
        channels: [
          "card",
          "bank",
          "ussd",
          "qr",
          "mobile_money",
          "bank_transfer",
        ],
        label: "Appointment Booking",
        custom_fields: [
          {
            display_name: "Patient Name",
            variable_name: "patient_name",
            value: patientName || "Unknown",
          },
          {
            display_name: "Doctor ID",
            variable_name: "doctor_id",
            value: doctorId || "Unknown",
          },
          {
            display_name: "Appointment Date",
            variable_name: "appointment_date",
            value: date || "Unknown",
          },
        ],
      };

      if (!window.PaystackPop) {
        throw new Error("Paystack script not loaded");
      }
      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: "pk_test_ef4c125c1c19ff96aabef9d613d5b49b1c83718b", // process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!
        ...paymentData,
        //@ts-expect-error - callback is not in the type PaystackOptions
        callback: (response: PaystackResponse) => {
          setIsPaystackLoaded(false);
          setIsProcessing(false);
          toast.success(`Payment successful! Ref: ${response.reference}`);
          // Call your booking function
          handlePaymentSuccess(response);
          // or handlePaymentSuccess(response);
        },
        onClose: () => {
          setIsProcessing(false);
          setIsPaystackLoaded(false);
          toast.error("Payment cancelled", {
            description:
              "You can try again or select a different payment method",
          });
        },
      });

      handler.openIframe();
    } catch (error) {
      setIsProcessing(false);
      toast.error("Payment initialization failed", {
        description: "Please try again or contact support",
      });
    }
  };

  const createPaymentInFirebase = async (paymentResponse: PaystackResponse) => {
    try {
      const { collection, addDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");

      const paymentData = {
        doctorId: doctorId || "",
        patientName: patientName || "",
        patientId: patientId || "",
        bookingDate: date || "",
        slot: time || "",
        channel: channel || "",
        reason: reason || "",
        amount: consultationFee,
        currency: "NGN",
        paymentReference: paymentResponse.reference,
        paymentStatus: "completed",
        paymentMethod: "paystack",
        transactionId: paymentResponse.trxref || paymentResponse.reference,
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const paymentsRef = collection(db, "payments");
      const paymentDoc = await addDoc(paymentsRef, paymentData);
      return paymentDoc.id;
    } catch (error) {
      throw error;
    }
  };

  const handlePaymentSuccess = async (response: PaystackResponse) => {
    setIsPaystackLoaded(true);
    try {
      toast.success("Payment successful!", {
        description: "Your appointment has been confirmed",
      });

      // First, create payment record in Firebase
      await createPaymentInFirebase(response);
      await createBookingWithRTK();

      setIsSuccess(true);
      setIsProcessing(false);
      // Stop the loading state
    } catch (error) {
      setIsProcessing(false); // Stop the loading state on error
    }
  };

  const createBookingWithRTK = async () => {
    setIsPaystackLoaded(false);
    try {
      // Prepare the input data for the API
      const input = {
        bookingChannel: channel || "",
        bookingDate: moment(date).format("DD-MMM-YY") || "",
        slot: time || "",
      };

      // Use RTK mutation to create the booking
      const result = await createDoctorAppointment({
        patientId: patientId || "",
        doctorId: doctorId || "",
        bookingData: input,
      }).unwrap();

      toast.success("Booking created successfully");
      setIsPaystackLoaded(false);
      // Redirect to success page or dashboard after a delay
      setTimeout(() => {
        window.location.href = "/nurse/patients";
      }, 3000);
      return result;
    } catch (error) {
      toast.error(
        (error as { data?: { error?: string } }).data?.error || "Payment failed"
      );
      setIsPaystackLoaded(true);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your appointment has been confirmed and payment processed.
          </p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
            <p className="text-gray-600">Complete your appointment booking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Select Payment Method
              </h2>

              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}>
                    <div className="flex items-center space-x-4">
                      <div className="text-gray-600">{method.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {method.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {method.description}
                        </p>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        {selectedPaymentMethod === method.id && (
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Button */}
              <div className="mt-8">
                <button
                  onClick={handlePayment}
                  disabled={
                    !selectedPaymentMethod || isProcessing || isCreatingBooking
                  }
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    selectedPaymentMethod && !isProcessing
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
                  ) : selectedPaymentMethod === "paystack" ? (
                    `Pay N${(
                      consultationFee / 100
                    ).toLocaleString()} with Paystack`
                  ) : (
                    `Confirm Cash Payment N${(
                      consultationFee / 100
                    ).toLocaleString()}`
                  )}
                </button>
              </div>

              {/* Paystack Info */}
              {selectedPaymentMethod === "paystack" && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">
                        Secure Payment with Paystack
                      </p>
                      <p className="mt-1">
                        Your payment is processed securely by Paystack. We
                        support cards, bank transfers, USSD, and mobile money.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
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
                  <span className="text-lg font-semibold text-gray-900">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    N{(consultationFee / 100).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Security Note */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
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
