import React, { useMemo, useState } from "react";
import Modal from "./Modal";
import { useGetPatientVitalsHistoryQuery, useSavePatientVitalsMutation } from "@/store/patientApi";
import { ChevronDown, ChevronUp, Loader2, AlertCircle, Plus, Save, X, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Input from "../Input";
import Textarea from "../Textarea";

interface VitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  bookingId?: string;
  bookingDate?: any;
  patientName?: string;
}

interface VitalItem {
  label: string;
  value: string;
  isMissing?: boolean;
}

interface VitalsHistoryEntry {
  date: string;
  vitals: VitalItem[];
  notes: VitalItem[];
}

const normalizeToDateString = (dateInput: any): string => {
  if (!dateInput) return "";
  try {
    let dateObj: Date;
    if (dateInput instanceof Date) {
      dateObj = dateInput;
    } else if (typeof dateInput === "object" && "seconds" in dateInput) {
      dateObj = new Date(dateInput.seconds * 1000);
    } else {
      dateObj = new Date(dateInput);
    }
    if (isNaN(dateObj.getTime())) return "";
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  } catch {
    return "";
  }
};

const initialFormState = {
  temperature: "",
  bloodPressure: "",
  heartRate: "",
  weight: "",
  breathingRate: "",
  comment: "",
  recommendation: "",
};

const VitalsModal: React.FC<VitalsModalProps> = ({ isOpen, onClose, patientId, bookingId, bookingDate, patientName }) => {
  const { user } = useAuth();
  const { data, isLoading, error } = useGetPatientVitalsHistoryQuery(patientId, {
    skip: !patientId || !isOpen,
  });

  const [saveVitals, { isLoading: isSaving }] = useSavePatientVitalsMutation();

  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState(initialFormState);

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save vitals");
      return;
    }

    try {
      await saveVitals({
        userId: patientId,
        doctorId: user.uid,
        bookingId,
        patientName,
        vitals: formData,
      }).unwrap();

      toast.success("Vitals saved successfully");
      setIsAdding(false);
      setFormData(initialFormState);
      // Expand the first item (newly added)
      setExpandedItems((prev) => ({ ...prev, 0: true }));
    } catch (err) {
      console.error("Failed to save vitals:", err);
      toast.error("Failed to save vitals");
    }
  };

  const vitalsData: VitalsHistoryEntry[] = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const filteredData = bookingId
      ? data.filter((entry: any) => {
          if (entry?.bookingId) {
            return String(entry.bookingId).trim() === String(bookingId).trim();
          }
          if (bookingDate) {
            const entryDateStr = normalizeToDateString(entry?.date);
            const bookingDateStr = normalizeToDateString(bookingDate);
            return entryDateStr !== "" && entryDateStr === bookingDateStr;
          }
          return false;
        })
      : data;
    return filteredData
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

        let vitalsArray: any[] = [];
        if (Array.isArray(entry?.vitals)) {
          vitalsArray = entry.vitals;
        } else if (entry?.vitals && typeof entry.vitals === "object") {
          vitalsArray = [entry.vitals];
        } else if (entry && typeof entry === "object") {
          // Fallback for flat structure or legacy data
          const hasVitalFields =
            "heartRate" in entry ||
            "bloodPressure" in entry ||
            "weight" in entry ||
            "temperature" in entry ||
            "breathingRate" in entry ||
            "comment" in entry ||
            "recommendation" in entry;

          if (hasVitalFields) {
            vitalsArray = [entry];
          }
        }

        const vitals: Array<{ label: string; value: string }> = [];
        const notes: Array<VitalItem> = [];
        const collectedComments: string[] = [];
        const collectedRecommendations: string[] = [];

        const pushIfPresent = (
          targetArray: Array<{ label: string; value: string }>,
          label: string,
          raw: any,
          suffix: string = ""
        ) => {
          if (raw !== undefined && raw !== null && String(raw) !== "") {
            targetArray.push({ label, value: `${raw}${suffix}`.trim() });
          }
        };

        vitalsArray.forEach((v: any) => {
          // Known fields with units
          pushIfPresent(vitals, "Temperature", v?.temperature, " °C");
          pushIfPresent(vitals, "Weight", v?.weight, " kg");
          // Prefer heartRate, fallback to pulse
          const heart = v?.heartRate ?? v?.pulse;
          pushIfPresent(vitals, "Heart Rate", heart, " bpm");
          pushIfPresent(vitals, "Blood Pressure", v?.bloodPressure, " mmHg");
          pushIfPresent(vitals, "Breathing Rate", v?.breathingRate, " breaths/min");

          // Collect textual fields
          if (v?.comment) collectedComments.push(v.comment);
          if (v?.recommendation) collectedRecommendations.push(v.recommendation);

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

        // Process collected notes
        if (collectedComments.length > 0) {
          collectedComments.forEach((c) =>
            notes.push({ label: "Comment", value: c, isMissing: false })
          );
        } else {
          notes.push({ label: "Comment", value: "No Comment", isMissing: true });
        }

        if (collectedRecommendations.length > 0) {
          collectedRecommendations.forEach((r) =>
            notes.push({ label: "Recommendation", value: r, isMissing: false })
          );
        } else {
          notes.push({
            label: "Recommendation",
            value: "No Recommendation",
            isMissing: true,
          });
        }

        return { date: displayDate, vitals, notes };
      });
  }, [data, bookingId, bookingDate]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vitals History"
      size="lg"
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto p-1">

        {/* Add Vitals Section */}
        <div className="mb-4">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center space-x-2 text-green-600 font-medium hover:text-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Vitals</span>
            </button>
          ) : (
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-green-900">New Vitals Entry</h3>
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Temperature (°C)"
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  placeholder="e.g. 36.5"
                />
                <Input
                  label="Blood Pressure (mmHg)"
                  type="text"
                  name="bloodPressure"
                  value={formData.bloodPressure}
                  onChange={handleInputChange}
                  placeholder="e.g. 120/80"
                />
                <Input
                  label="Heart Rate (bpm)"
                  type="number"
                  name="heartRate"
                  value={formData.heartRate}
                  onChange={handleInputChange}
                  placeholder="e.g. 72"
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="e.g. 70"
                />
                <Input
                  label="Breathing Rate (breaths/min)"
                  type="number"
                  name="breathingRate"
                  value={formData.breathingRate}
                  onChange={handleInputChange}
                  placeholder="e.g. 16"
                />
              </div>

              <div className="space-y-4 mb-4">
                <Textarea
                  label="Comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Add a comment..."
                />
                <Textarea
                  label="Recommendation"
                  name="recommendation"
                  value={formData.recommendation}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Add recommendation..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Vitals</span>
                </button>
              </div>
            </div>
          )}
        </div>

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
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <Activity className="w-6 h-6 text-green-600 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">No Vitals Recorded</p>
            <p className="text-xs text-gray-500 text-center max-w-[280px] mb-4">
              There are no vitals recorded for this specific booking yet.
            </p>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center space-x-1 text-xs font-semibold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vitals Now</span>
              </button>
            )}
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
                  <div className="p-4 bg-white border-t border-gray-200 space-y-4">
                    {item.vitals.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {item.vitals.map((vital, vIndex) => (
                          <div key={vIndex} className="bg-gray-50 p-3 rounded-md">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                              {vital.label}
                            </div>
                            <div className="text-[10px] md:text-[12px] font-semibold text-gray-900 mt-1">
                              {vital.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {item.notes.length > 0 && (
                      <div className="space-y-3">
                        {item.notes.map((note, nIndex) => (
                          <div
                            key={nIndex}
                            className={`p-3 rounded-md border ${note.isMissing
                                ? "bg-gray-50 border-gray-100"
                                : "bg-blue-50 border-blue-100"
                              }`}
                          >
                            <div
                              className={`text-xs uppercase tracking-wide font-semibold ${note.isMissing ? "text-gray-500" : "text-blue-600"
                                }`}
                            >
                              {note.label}
                            </div>
                            <div
                              className={`text-[10px] md:text-[12px] mt-1 whitespace-pre-wrap ${note.isMissing
                                  ? "text-gray-500 italic"
                                  : "text-gray-800"
                                }`}
                            >
                              {note.value}
                            </div>
                          </div>
                        ))}
                      </div>
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
