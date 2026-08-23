"use client";

import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import Button from "@/components/Button";

export interface DataVerificationPayload {
  /** Per-collection accessibility flags, e.g. { profile: true, documents: false }. */
  verification: Record<string, boolean>;
  isFullyAccessible: boolean;
}

interface DataVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  verificationData?: DataVerificationPayload | null;
  /** Shown in the heading, e.g. the doctor's display name. */
  subjectName?: string;
  isLoading?: boolean;
}

/**
 * Reports whether each of a subject's data collections is reachable, plus an
 * overall verdict. Presentational: the caller owns the query, so this works for
 * any subject whose check returns { verification, isFullyAccessible }.
 */
export default function DataVerificationModal({
  isOpen,
  onClose,
  verificationData,
  subjectName,
  isLoading = false,
}: DataVerificationModalProps) {
  if (!isOpen) return null;

  const entries = Object.entries(verificationData?.verification || {});

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Data verification"
    >
      <div className="bg-white rounded-lg p-6 max-w-[800px] w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[14px] md:text-[16px] font-medium text-gray-900">
            Data Verification{subjectName ? ` - ${subjectName}` : ""}
          </h3>
          <Button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-transparent hover:bg-transparent border-none p-1"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            }
            iconOnly
          >
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {isLoading || !verificationData ? (
          <p className="text-[12px] md:text-[14px] text-gray-500 py-8 text-center">
            {isLoading ? "Running verification…" : "No verification data available."}
          </p>
        ) : (
          <div className="space-y-4">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="capitalize text-gray-700">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <div className="flex items-center">
                  {value ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className={value ? "text-green-700" : "text-red-700"}>
                    {value ? "Accessible" : "Not Accessible"}
                  </span>
                </div>
              </div>
            ))}

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 mr-2">
                  Overall Status:
                </span>
                {verificationData.isFullyAccessible ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Fully Accessible
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Issues Found
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
