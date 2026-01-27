"use client";

import { useState, useEffect } from "react";
import { Plus, MoreVertical, Shield, X, AlertCircle } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Modal from "@/components/modals/Modal";
import SearchInput from "@/components/SearchInput";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import Button from "@/components/Button";
import {
  getSpecializationCollection,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
} from "@/lib/specialization";
import { toast } from "sonner";
import { SVGLoader } from "@/components/SVGLoader";
import { SpecializationSkeleton } from "@/components/ui/specialization-skeleton";
import { useGetDoctorsBySpecializationCountQuery } from "@/store/doctorApi";
import Pagination from "@/components/Pagination";
import CreateSpecialtyModal from "@/components/modals/CreateSpecialtyModal";

interface Specialization {
  id: string;
  name: string;
  description: string;
  doctorCount?: number;
  borderColor?: string;
}

export default function AdminSpecializationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSpecialization, setEditingSpecialization] =
    useState<Specialization | null>(null);
  const [newSpecialty, setNewSpecialty] = useState({
    name: "",
    description: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for specializations
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter specializations based on search query
  const filteredSpecializations = specializations.filter(
    (specialization) =>
      specialization.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialization.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredSpecializations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSpecializations = filteredSpecializations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Generate border colors for specializations
  const getBorderColor = (index: number) => {
    const colors = [
      "border-blue-300",
      "border-pink-300",
      "border-green-300",
      "border-purple-300",
      "border-yellow-300",
      "border-red-300",
    ];
    return colors[index % colors.length];
  };

  // Fetch specializations on component mount
  useEffect(() => {
    const fetchSpecializations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSpecializationCollection();
        setSpecializations(data);
      } catch (err) {
        setError("Failed to load specializations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpecializations();
  }, []);

  // Component for individual specialization card with doctor count
  const SpecializationCard = ({
    specialization,
    index,
  }: {
    specialization: Specialization;
    index: number;
  }) => {
    const { data: countData } = useGetDoctorsBySpecializationCountQuery({
      specializationId: specialization.id,
    });

    const doctorCount = countData?.count || 0;

    return (
      <div
        className={`bg-white rounded-lg border-2 ${getBorderColor(
          index
        )} p-6 shadow-sm relative`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-[14px] md:text-[16px] font-semibold text-gray-900">
              {specialization.name}
            </h3>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
              {doctorCount}
            </span>
          </div>
          <div className="relative">
            <Button
              variant="ghost-neutral"
              size="sm"
              icon={<Shield className="w-4 h-4" />}
              iconOnly
              onClick={() => openEditModal(specialization)}
              className="text-gray-400 hover:text-gray-600 h-auto p-1"
            />
          </div>
        </div>

        <p className="text-gray-600 text-[10px] md:text-[12px] leading-relaxed">
          {specialization.description}
        </p>

        <div className="flex justify-end mt-4 space-x-2">
          <Button
            variant="ghost-neutral"
            size="sm"
            onClick={() => openEditModal(specialization)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2"
          >
            Edit
          </Button>
          <Button
            variant="ghost-danger"
            size="sm"
            onClick={() => handleDeleteSpecialty(specialization.id)}
            disabled={isDeleting}
            loading={isDeleting}
            className="px-2"
          >
            Delete
          </Button>
        </div>
      </div>
    );
  };

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCreateSpecialty = async () => {
    if (newSpecialty.name && newSpecialty.description) {
      setIsCreating(true);
      try {
        const newSpecialization = await createSpecialization({
          name: newSpecialty?.name,
          description: newSpecialty?.description,
        });

        setSpecializations((prev) => [...prev, newSpecialization]);
        setNewSpecialty({ name: "", description: "" });
        setIsCreateModalOpen(false);
        setError(null);
        toast.success("Specialization created successfully!");
      } catch (error) {
        setError("Failed to create specialization");
        toast.error("Failed to create specialization. Please try again.");
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleEditSpecialty = async () => {
    if (
      editingSpecialization &&
      editingSpecialization?.name &&
      editingSpecialization?.description
    ) {
      setIsUpdating(true);
      try {
        await updateSpecialization(editingSpecialization?.id, {
          name: editingSpecialization?.name,
          description: editingSpecialization?.description,
        });

        // Update local state
        setSpecializations((prev) =>
          prev?.map((spec) =>
            spec?.id === editingSpecialization?.id
              ? {
                ...spec,
                name: editingSpecialization?.name,
                description: editingSpecialization?.description,
              }
              : spec
          )
        );

        setEditingSpecialization(null);
        setIsEditModalOpen(false);
        setError(null);
        toast.success("Specialization updated successfully!");
      } catch (error) {
        console.error("Error updating specialization:", error);
        setError("Failed to update specialization");
        toast.error("Failed to update specialization. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDeleteSpecialty = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this specialization?")
    ) {
      setIsDeleting(true);
      try {
        await deleteSpecialization(id);

        // Update local state
        setSpecializations((prev) => prev.filter((spec) => spec.id !== id));
        setError(null);
        toast.success("Specialization deleted successfully!");
      } catch (error) {
        console.error("Error deleting specialization:", error);
        setError("Failed to delete specialization");
        toast.error("Failed to delete specialization. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const openEditModal = (specialization: Specialization) => {
    setEditingSpecialization(specialization);
    setIsEditModalOpen(true);
  };

  return (
    <div>
      <div>
        <div className="flex-1">
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: "Admin", href: "/admin" },
                { label: "Specialization" },
              ]}
            />
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Specialization
            </h1>
          </div>

          {/* Search and Create Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search specialization..."
              />
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
              icon={<Plus className="w-5 h-5" />}
            >
              Create New Specialty
            </Button>
          </div>

          {/* Specialization Cards */}

          {isLoading ? (
            <SpecializationSkeleton cards={6} className="mb-8" />
          ) : paginatedSpecializations?.length === 0 ||
            paginatedSpecializations?.length === undefined ? (
            <div className="col-span-full flex flex-col justify-center items-center h-64 text-center">
              <AlertCircle size={75} color="#a4a9b2" />
              <p className="mt-3 text-gray-500">No specializations found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedSpecializations?.map((specialization, index) => (
                <SpecializationCard
                  key={specialization.id}
                  specialization={specialization}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Pagination  */}
          {!isLoading && !error && (
            <Pagination
              currentPage={currentPage}
              totalCount={filteredSpecializations.length}
              pageSize={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="specializations"
            />
          )}
        </div>
      </div>

      {/* Create New Specialty Modal */}
      <CreateSpecialtyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        newSpecialty={newSpecialty}
        setNewSpecialty={setNewSpecialty}
        handleCreateSpecialty={handleCreateSpecialty}
        isCreating={isCreating}
      />

      {/* Edit Specialization Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Specialization"
        size="md">
        <div className="space-y-6">
          <div>
            <Input
              label="Specialty Name"
              type="text"
              placeholder="Specialty Name"
              value={editingSpecialization?.name || ""}
              onChange={(e) =>
                setEditingSpecialization((prev) =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
              fullWidth
            />
          </div>

          <div>
            <label className="block text-[10px] md:text-[12px] font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              placeholder="Specialty Description"
              value={editingSpecialization?.description || ""}
              onChange={(e) =>
                setEditingSpecialization((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              rows={4}
              fullWidth
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setIsEditModalOpen(false)}
              variant="outline-neutral"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSpecialty}
              disabled={isUpdating}
              loading={isUpdating}
              variant="primary"
            >
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
