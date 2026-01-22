import React from "react";
import Modal from "@/components/modals/Modal";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";

interface CreateSpecialtyModalProps {
  isOpen: boolean;
  onClose: () => void;
  newSpecialty: {
    name: string;
    description: string;
  };
  setNewSpecialty: (specialty: { name: string; description: string }) => void;
  handleCreateSpecialty: () => void;
  isCreating: boolean;
}

const CreateSpecialtyModal: React.FC<CreateSpecialtyModalProps> = ({
  isOpen,
  onClose,
  newSpecialty,
  setNewSpecialty,
  handleCreateSpecialty,
  isCreating,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Specialty"
      size="md"
    >
      <div className="space-y-6">
        <div>
          <Input
            label="Specialty"
            type="text"
            placeholder="Specialty"
            value={newSpecialty.name}
            onChange={(e) =>
              setNewSpecialty({ ...newSpecialty, name: e.target.value })
            }
            fullWidth
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <Textarea
            placeholder="Specialty Description"
            value={newSpecialty.description}
            onChange={(e) =>
              setNewSpecialty({
                ...newSpecialty,
                description: e.target.value,
              })
            }
            rows={4}
            fullWidth
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleCreateSpecialty}
            disabled={isCreating}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateSpecialtyModal;
