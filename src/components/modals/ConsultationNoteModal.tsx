import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Textarea from "../Textarea";

interface ConsultationNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    note: string;
    recommendation: string;
    diagnosis: string;
    prescriptions: string;
  }) => void;
  initialData?: {
    note?: string;
    recommendation?: string;
    diagnosis?: string;
    prescriptions?: string[];
  };
  // Backward compatibility props
  initialNote?: string;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

const ConsultationNoteModal: React.FC<ConsultationNoteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialNote = "",
  isSubmitting = false,
  readOnly = false,
}) => {
  const [note, setNote] = useState(initialNote);
  const [recommendation, setRecommendation] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescriptions, setPrescriptions] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNote(initialData?.note || initialNote || "");
      setRecommendation(initialData?.recommendation || "");
      setDiagnosis(initialData?.diagnosis || "");
      setPrescriptions(
        initialData?.prescriptions ? initialData.prescriptions.join("\n") : ""
      );
    }
  }, [isOpen, initialData, initialNote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      note,
      recommendation,
      diagnosis,
      prescriptions,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Consultation Details" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <Textarea
              label="Consultation Note"
              rows={4}
              placeholder="Enter consultation note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              readOnly={readOnly}
            />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <Textarea
              label="Diagnosis"
              rows={2}
              placeholder="Enter diagnosis..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              readOnly={readOnly}
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <Textarea
              label="Recommendation"
              rows={3}
              placeholder="Enter recommendation..."
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              readOnly={readOnly}
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <Textarea
              label="Prescriptions (One per line)"
              rows={4}
              placeholder="Enter prescriptions..."
              value={prescriptions}
              onChange={(e) => setPrescriptions(e.target.value)}
              readOnly={readOnly}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            {readOnly ? "Close" : "Cancel"}
          </button>
          {!readOnly && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Details"
              )}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ConsultationNoteModal;
