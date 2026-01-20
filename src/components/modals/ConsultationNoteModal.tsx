import React, { useState } from "react";
import Modal from "./Modal";
import Textarea from "../Textarea";

interface ConsultationNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
  initialNote?: string;
}

const ConsultationNoteModal: React.FC<ConsultationNoteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialNote = "",
}) => {
  const [note, setNote] = useState(initialNote);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(note);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Consultation Note" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textarea
            label="Consultation Note"
            rows={6}
            placeholder="Enter consultation note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors"
          >
            Save Note
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ConsultationNoteModal;
