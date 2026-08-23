"use client";

import React from "react";
import { Clock, UserCheck, UserX } from "lucide-react";

export interface AuditLogEntry {
  id: string;
  action: string;
  targetId: string;
  performedBy: string;
  reason?: string;
  timestamp: string;
  details?: unknown;
}

interface AuditLogsPanelProps {
  isOpen: boolean;
  logs?: AuditLogEntry[] | null;
  isLoading?: boolean;
  /** Heading text — defaults to "Recent Audit Logs". */
  title?: string;
}

/** Coloured pill for the known audit actions, falling back to the raw action. */
const getActionBadge = (action: string) => {
  const baseClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  switch (action) {
    case "doctor_deactivated":
      return (
        <span
          className={`${baseClasses} bg-red-100 text-red-800 border border-red-300`}
        >
          <UserX className="w-3 h-3 mr-1" />
          Deactivated
        </span>
      );
    case "doctor_reactivated":
      return (
        <span
          className={`${baseClasses} bg-green-100 text-green-800 border border-green-300`}
        >
          <UserCheck className="w-3 h-3 mr-1" />
          Reactivated
        </span>
      );
    default:
      return (
        <span
          className={`${baseClasses} bg-gray-100 text-gray-800 border border-gray-300`}
        >
          {action}
        </span>
      );
  }
};

const HEADERS = ["Action", "Target", "Performed By", "Reason", "Timestamp"];

/**
 * Collapsible table of recent audit-trail entries. Renders nothing when closed,
 * so the caller only needs to toggle `isOpen`.
 */
export default function AuditLogsPanel({
  isOpen,
  logs,
  isLoading = false,
  title = "Recent Audit Logs",
}: AuditLogsPanelProps) {
  if (!isOpen) return null;

  const rows = logs || [];

  return (
    <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-[14px] md:text-[16px] font-medium text-gray-900">
          {title}
        </h3>
      </div>

      {isLoading ? (
        <p className="px-6 py-8 text-center text-[12px] md:text-[14px] text-gray-500">
          Loading audit logs…
        </p>
      ) : rows.length === 0 ? (
        <p className="px-6 py-8 text-center text-[12px] md:text-[14px] text-gray-500">
          No audit activity recorded yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {HEADERS.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left text-[10px] md:text-[12px] font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-gray-900">
                    {log.targetId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-gray-900">
                    {log.performedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-gray-500">
                    {log.reason || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * Audit timestamps arrive as ISO strings, but a Firestore Timestamp object or a
 * malformed value would render as "Invalid Date" — show the raw value instead of
 * lying about it.
 */
function formatTimestamp(value: unknown): string {
  if (!value) return "—";
  if (typeof value === "object") {
    const ts = value as { seconds?: number; _seconds?: number };
    const seconds = ts.seconds ?? ts._seconds;
    if (typeof seconds === "number") {
      return new Date(seconds * 1000).toLocaleString();
    }
    return "—";
  }
  const date = new Date(String(value));
  return isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}
