"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CircleDollarSign, Check, Info } from "lucide-react";
import { useGetPricingQuery, useSetPricingMutation } from "@/store/pricingApi";
import { SVGLoader } from "@/components/SVGLoader";

export default function AdminPricingPage() {
  const { data, isLoading, refetch } = useGetPricingQuery({});
  const [setPricing, { isLoading: isSaving }] = useSetPricingMutation();

  const [value, setValue] = useState<string>("");

  const currentPrice = Number(data?.pricing) || 0;

  useEffect(() => {
    if (data?.pricing != null) setValue(String(data.pricing));
  }, [data?.pricing]);

  const formatNaira = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n);

  const handleSave = async () => {
    const clean = Number(value.replace(/[,\s]/g, ""));
    if (!value.trim() || isNaN(clean) || clean <= 0) {
      toast.warning("Please enter a valid amount greater than 0.");
      return;
    }
    try {
      const res = await setPricing({ pricing: clean }).unwrap();
      toast.success(
        `Booking price set to ${formatNaira(
          Number(res?.pricing ?? clean)
        )}. It now applies everywhere.`
      );
      refetch();
    } catch (e: any) {
      toast.error(e?.error || "Failed to update price. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Booking Price</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set the consultation price for bookings. This single price applies
          across the whole app.
        </p>
      </div>

      {/* Current price card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#44CE2D]/10 flex items-center justify-center">
            <CircleDollarSign className="w-6 h-6 text-[#44CE2D]" />
          </div>
          <div>
            <p className="text-[12px] text-gray-500">Current booking price</p>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "…" : formatNaira(currentPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Set price card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
          New booking price (₦)
        </label>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              ₦
            </span>
            <input
              type="number"
              min={0}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2.5 text-sm text-gray-900 focus:border-[#44CE2D] focus:outline-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-[#44CE2D] text-white font-medium px-5 py-2.5 hover:bg-[#3bb025] disabled:opacity-50 transition-colors"
          >
            {isSaving ? (
              <>
                <SVGLoader width="16px" height="16px" color="#FFF" />
                Saving…
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Price
              </>
            )}
          </button>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 p-3">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-blue-800">
            This price is used everywhere the app shows a booking amount — the
            doctor profile consultation fee, the booking summary, and the
            Paystack checkout. Enter the amount in naira, without commas.
          </p>
        </div>
      </div>
    </div>
  );
}
