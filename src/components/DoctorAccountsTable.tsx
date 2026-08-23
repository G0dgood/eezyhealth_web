"use client";

import React from "react";
import {
  Eye,
  Download,
  Bell,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Input from "@/components/Input";
import Button from "@/components/Button";

export interface DoctorAccount {
  uid: string;
  email: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  specialization?: string;
  hospital?: string;
  isActive?: boolean;
  deactivatedAt?: string;
  deactivationReason?: string;
  reactivatedAt?: string;
  reactivatedBy?: string;
  createdTime?: string;
}

interface DoctorAccountsTableProps {
  doctors: DoctorAccount[];
  /** uids of the currently ticked rows. */
  selectedDoctors: string[];
  onSelectionChange: (uids: string[]) => void;
  onVerifyData: (uid: string) => void;
  onExportData: (uid: string) => void;
  onSendNotification: (uid: string) => void;
  onSendEmail: (
    uid: string,
    actionType: "deactivated" | "reactivated"
  ) => void;
  isLoading?: boolean;
  /** Heading text — defaults to "Doctor Accounts". */
  title?: string;
}

const statusBadge = (isActive?: boolean) =>
  isActive ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
      <CheckCircle className="w-3 h-3 mr-1" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
      <AlertCircle className="w-3 h-3 mr-1" />
      Inactive
    </span>
  );

const displayName = (doctor: DoctorAccount) => {
  if (doctor.display_name) return doctor.display_name;
  const full = [doctor.first_name, doctor.last_name].filter(Boolean).join(" ");
  return full || "Unknown";
};

const lastUpdated = (doctor: DoctorAccount) => {
  const asDate = (value?: string) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toLocaleDateString();
  };
  const reactivated = asDate(doctor.reactivatedAt);
  if (reactivated) return `Reactivated: ${reactivated}`;
  const deactivated = asDate(doctor.deactivatedAt);
  if (deactivated) return `Deactivated: ${deactivated}`;
  return "Never";
};

const CELL = "px-6 py-4 whitespace-nowrap";
const TEXT = "text-[10px] md:text-[12px]";
const TH =
  "px-6 py-3 text-left text-[10px] md:text-[12px] font-medium text-gray-500 uppercase tracking-wider";

/**
 * Selectable table of doctor accounts with the per-row admin actions. Purely
 * presentational: selection state and every action are owned by the caller.
 */
export default function DoctorAccountsTable({
  doctors,
  selectedDoctors,
  onSelectionChange,
  onVerifyData,
  onExportData,
  onSendNotification,
  onSendEmail,
  isLoading = false,
  title = "Doctor Accounts",
}: DoctorAccountsTableProps) {
  const allSelected =
    doctors.length > 0 && selectedDoctors.length === doctors.length;

  const toggleAll = (checked: boolean) =>
    onSelectionChange(checked ? doctors.map((d) => d.uid) : []);

  const toggleOne = (uid: string, checked: boolean) =>
    onSelectionChange(
      checked
        ? [...selectedDoctors, uid]
        : selectedDoctors.filter((id) => id !== uid)
    );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-[14px] md:text-[16px] font-medium text-gray-900">
          {title}
        </h3>
      </div>

      {isLoading ? (
        <p className={`px-6 py-8 text-center ${TEXT} text-gray-500`}>
          Loading doctor accounts…
        </p>
      ) : doctors.length === 0 ? (
        <p className={`px-6 py-8 text-center ${TEXT} text-gray-500`}>
          No doctors match the current filters.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <Input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => toggleAll(e.target.checked)}
                    fullWidth={false}
                  />
                </th>
                <th scope="col" className={TH}>
                  Doctor
                </th>
                <th scope="col" className={TH}>
                  Specialization
                </th>
                <th scope="col" className={TH}>
                  Status
                </th>
                <th scope="col" className={TH}>
                  Last Updated
                </th>
                <th scope="col" className={TH}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctors.map((doctor) => (
                <tr key={doctor.uid} className="hover:bg-gray-50">
                  <td className={CELL}>
                    <Input
                      type="checkbox"
                      checked={selectedDoctors.includes(doctor.uid)}
                      onChange={(e) => toggleOne(doctor.uid, e.target.checked)}
                      fullWidth={false}
                    />
                  </td>
                  <td className={CELL}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {doctor.display_name?.charAt(0) ||
                              doctor.email?.charAt(0) ||
                              "D"}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className={`${TEXT} font-medium text-gray-900`}>
                          {displayName(doctor)}
                        </div>
                        <div className={`${TEXT} text-gray-500`}>
                          {doctor.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={CELL}>
                    <div className={`${TEXT} text-gray-900`}>
                      {doctor.specialization || "N/A"}
                    </div>
                    <div className={`${TEXT} text-gray-500`}>
                      {doctor.hospital || "N/A"}
                    </div>
                  </td>
                  <td className={CELL}>{statusBadge(doctor.isActive)}</td>
                  <td className={`${CELL} ${TEXT} text-gray-500`}>
                    {lastUpdated(doctor)}
                  </td>
                  <td className={`${CELL} ${TEXT} font-medium`}>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => onVerifyData(doctor.uid)}
                        className="text-blue-600 hover:text-blue-900 bg-transparent hover:bg-transparent border-none p-1"
                        title="Verify Data"
                        icon={<Eye className="h-4 w-4" />}
                        iconOnly
                      />
                      <Button
                        onClick={() => onExportData(doctor.uid)}
                        className="text-green-600 hover:text-green-900 bg-transparent hover:bg-transparent border-none p-1"
                        title="Export Data"
                        icon={<Download className="h-4 w-4" />}
                        iconOnly
                      />
                      <Button
                        onClick={() => onSendNotification(doctor.uid)}
                        className="text-blue-600 hover:text-blue-900 bg-transparent hover:bg-transparent border-none p-1"
                        title="Send Notifications"
                        icon={<Bell className="h-4 w-4" />}
                        iconOnly
                      />
                      <Button
                        onClick={() =>
                          onSendEmail(
                            doctor.uid,
                            doctor.isActive ? "reactivated" : "deactivated"
                          )
                        }
                        className="text-purple-600 hover:text-purple-900 bg-transparent hover:bg-transparent border-none p-1"
                        title="Send Email"
                        icon={<Mail className="h-4 w-4" />}
                        iconOnly
                      />
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
