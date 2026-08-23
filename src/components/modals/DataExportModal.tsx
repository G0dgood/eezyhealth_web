"use client";

import React from "react";
import { Download } from "lucide-react";
import Button from "@/components/Button";

export interface DataExportPayload {
  profile?: unknown;
  appointments?: unknown[];
  documents?: unknown[];
  analytics?: unknown[];
  [key: string]: unknown;
}

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The exported record set. The modal renders nothing until this is present. */
  exportData?: DataExportPayload | null;
  /** Shown in the heading, e.g. the doctor's display name. */
  subjectName?: string;
  /** Used to build the download filename. */
  subjectId?: string;
  /** Filename prefix — defaults to "doctor" to match the original export. */
  filePrefix?: string;
  isLoading?: boolean;
}

/**
 * Summarises an exported data set (counts per collection) and hands it over as a
 * JSON download. Kept presentational: the caller owns fetching, so the same
 * modal works for any subject whose export follows the profile/appointments/
 * documents/analytics shape.
 */
export default function DataExportModal({
  isOpen,
  onClose,
  exportData,
  subjectName,
  subjectId,
  filePrefix = "doctor",
  isLoading = false,
}: DataExportModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (!exportData) return;

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const fileName = `${filePrefix}_${subjectId || "export"}_export_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", fileName);
    linkElement.click();
  };

  const countOf = (value: unknown) =>
    Array.isArray(value) ? value.length : 0;

  const tiles = [
    {
      label: "Profile",
      value: exportData?.profile ? "1" : "0",
      bg: "bg-blue-50",
      fg: "text-blue-600",
    },
    {
      label: "Appointments",
      value: String(countOf(exportData?.appointments)),
      bg: "bg-green-50",
      fg: "text-green-600",
    },
    {
      label: "Documents",
      value: String(countOf(exportData?.documents)),
      bg: "bg-purple-50",
      fg: "text-purple-600",
    },
    {
      label: "Analytics",
      value: String(countOf(exportData?.analytics)),
      bg: "bg-orange-50",
      fg: "text-orange-600",
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Data export"
    >
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[14px] md:text-[16px] font-medium text-gray-900">
            Data Export{subjectName ? ` - ${subjectName}` : ""}
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

        {isLoading || !exportData ? (
          <p className="text-[12px] md:text-[14px] text-gray-500 py-8 text-center">
            {isLoading ? "Preparing export…" : "No export data available."}
          </p>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tiles.map((tile) => (
                  <div key={tile.label} className={`${tile.bg} p-3 rounded-lg`}>
                    <p className="text-[10px] md:text-[12px] text-gray-600">
                      {tile.label}
                    </p>
                    <p
                      className={`text-[14px] md:text-[16px] font-semibold ${tile.fg}`}
                    >
                      {tile.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleDownload}
                className="bg-blue-600 text-white hover:bg-blue-700 border-none"
                icon={<Download className="h-4 w-4" />}
              >
                Download JSON
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
