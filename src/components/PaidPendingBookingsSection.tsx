"use client";

import { AlertTriangle } from "lucide-react";
import { useGetPaidPendingBookingsQuery } from "@/store/bookingApi";

const formatChannel = (channel: string): string => {
  const c = (channel || "").toLowerCase();
  if (c === "video" || c === "videocall") return "Video";
  if (c === "chat") return "Chat";
  if (c === "voice" || c === "voicecall") return "Voice";
  if (c === "in-person" || c === "physical") return "In-Person";
  return channel || "—";
};

const formatWhen = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Shows appointments a patient paid for but whose booking creation failed
 * (network/availability/server issue). Surfaces them to staff so they can
 * follow up or reconcile. Renders nothing when there are none.
 */
export default function PaidPendingBookingsSection({
  doctorId,
}: {
  /** When set (doctor view), only that doctor's pending bookings are shown. */
  doctorId?: string | null;
}) {
  const { data, isLoading } = useGetPaidPendingBookingsQuery({});
  const all = (Array.isArray(data) ? data : []) as any[];
  const items = doctorId
    ? all.filter((p) => (p.doctorId || p.bookingInput?.doctorId) === doctorId)
    : all;

  if (isLoading || items.length === 0) return null;

  return (
    <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            Paid but unconfirmed appointments ({items.length})
          </p>
          <p className="text-xs text-amber-700">
            These patients completed payment but the appointment could not be
            created. The patient can retry from their app; please follow up.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-amber-200 text-[12px]">
          <thead className="bg-amber-100/60">
            <tr className="text-left text-amber-800">
              <th className="px-4 py-2 font-semibold">Patient</th>
              <th className="px-4 py-2 font-semibold">Doctor</th>
              <th className="px-4 py-2 font-semibold">Date</th>
              <th className="px-4 py-2 font-semibold">Time</th>
              <th className="px-4 py-2 font-semibold">Channel</th>
              <th className="px-4 py-2 font-semibold">Amount</th>
              <th className="px-4 py-2 font-semibold">Payment Ref</th>
              <th className="px-4 py-2 font-semibold">Paid At</th>
              <th className="px-4 py-2 font-semibold">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100 bg-white">
            {items.map((p) => (
              <tr key={p.id} className="text-gray-800">
                <td className="px-4 py-2 whitespace-nowrap font-medium">
                  {p.patientName || "—"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {p.doctorName || "—"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {p.appointmentDate || p.bookingInput?.bookingDate || "—"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap capitalize">
                  {(p.appointmentTime || p.bookingInput?.slot || "—")
                    .toString()
                    .replace(/_/g, " ")}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {formatChannel(p.bookingInput?.bookingChannel || "")}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {p.amount ? `₦${p.amount}` : "—"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap font-mono text-[11px]">
                  {p.paymentReference || "—"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {formatWhen(p.createdAt)}
                </td>
                <td className="px-4 py-2 max-w-[220px] truncate text-red-600">
                  {p.failureReason || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
