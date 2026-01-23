import React, { useMemo, useState } from "react";
import Modal from "./Modal";
import { useGetPatientVitalsHistoryQuery } from "@/store/patientApi";
import { ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";

interface VitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

interface VitalItem {
  label: string;
  value: string;
}

interface VitalsHistoryEntry {
  date: string;
  vitals: VitalItem[];
}

const VitalsModal: React.FC<VitalsModalProps> = ({ isOpen, onClose, patientId }) => {
  const { data, isLoading, error } = useGetPatientVitalsHistoryQuery(patientId, {
    skip: !patientId || !isOpen,
  });

  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const vitalsData: VitalsHistoryEntry[] = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .slice()
      .sort((a: any, b: any) => {
        const at = new Date(a?.date || 0).getTime();
        const bt = new Date(b?.date || 0).getTime();
        return bt - at; // newest first
      })
      .map((entry: any) => {
        const displayDate = entry?.date
          ? new Date(entry.date).toLocaleDateString("en-GB")
          : "Unknown Date";

        const vitalsArray = Array.isArray(entry?.vitals) ? entry.vitals : [];
        const vitals: Array<{ label: string; value: string }> = [];

        const pushIfPresent = (
          label: string,
          raw: any,
          suffix: string = ""
        ) => {
          if (raw !== undefined && raw !== null && String(raw) !== "") {
            vitals.push({ label, value: `${raw}${suffix}`.trim() });
          }
        };

        vitalsArray.forEach((v: any) => {
          // Known fields with units
          pushIfPresent("Temperature", v?.temperature, " °C");
          pushIfPresent("Weight", v?.weight, " kg");
          // Prefer heartRate, fallback to pulse
          const heart = v?.heartRate ?? v?.pulse;
          pushIfPresent("Heart Rate", heart, " bpm");
          pushIfPresent("Blood Pressure", v?.bloodPressure, " mmHg");
          pushIfPresent("Breathing Rate", v?.breathingRate, " bpm");
          // Textual fields
          pushIfPresent("Comment", v?.comment);
          pushIfPresent("Recommendation", v?.recommendation);

          // Include any additional keys present in the object that weren't covered above
          if (v && typeof v === "object") {
            Object.keys(v).forEach((key) => {
              if (
                [
                  "temperature",
                  "weight",
                  "heartRate",
                  "pulse",
                  "bloodPressure",
                  "breathingRate",
                  "comment",
                  "recommendation", 
                  "doctorId",
                  "bookingId",
                  "upload",
                  "userId",
                  "name",
                ].includes(key)
              ) {
                return;
              }
              const value = v[key];
              if (
                value !== undefined &&
                value !== null &&
                String(value) !== ""
              ) {
                // Humanize key: camelCase -> Title Case
                const label = key
                  .replace(/([a-z])([A-Z])/g, "$1 $2")
                  .replace(/_/g, " ")
                  .replace(/^./, (s) => s.toUpperCase());
                vitals.push({ label, value: String(value) });
              }
            });
          }
        });

        return { date: displayDate, vitals };
      });
  }, [data]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vitals History"
      size="lg"
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-red-500">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p>Failed to load vitals history</p>
          </div>
        ) : vitalsData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No vitals history found.
          </div>
        ) : (
          <div className="space-y-3">
            {vitalsData.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium text-gray-900">{item.date}</span>
                  {expandedItems[index] ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {expandedItems[index] && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    {item.vitals.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {item.vitals.map((vital, vIndex) => (
                          <div key={vIndex} className="bg-gray-50 p-3 rounded-md">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                              {vital.label}
                            </div>
                            <div className="text-sm font-semibold text-gray-900 mt-1">
                              {vital.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No detailed vitals recorded for this entry.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VitalsModal;
