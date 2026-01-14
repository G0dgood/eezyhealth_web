"use client";

import { useState, useEffect } from "react";
import { Plus, MoreVertical, Shield, X, AlertCircle } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Modal from "@/components/modals/Modal";
import SearchInput from "@/components/SearchInput";
import { TableSkeleton } from "@/components/ui/table-skeleton";
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
        console.error("Error fetching specializations:", err);
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
            <h3 className="text-lg font-semibold text-gray-900">
              {specialization.name}
            </h3>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
              {doctorCount}
            </span>
          </div>
          <div className="relative">
            <button
              className="text-gray-400 hover:text-gray-600 p-1"
              onClick={() => openEditModal(specialization)}>
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed">
          {specialization.description}
        </p>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={() => openEditModal(specialization)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Edit
          </button>
          <button
            onClick={() => handleDeleteSpecialty(specialization.id)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50">
            {isDeleting ? (
              <SVGLoader width={"30px"} height={"40px"} color={"#22c55e"} />
            ) : (
              "Delete"
            )}
          </button>
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
        console.error("Error creating specialization:", error);
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

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Plus className="w-5 h-5" />
              <span>Create New Specialty</span>
            </button>
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
          {!isLoading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}>
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create New Specialty Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Specialty"
        size="md">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialty
            </label>
            <input
              type="text"
              placeholder="Specialty"
              value={newSpecialty.name}
              onChange={(e) =>
                setNewSpecialty({ ...newSpecialty, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Specialty Description"
              value={newSpecialty.description}
              onChange={(e) =>
                setNewSpecialty({
                  ...newSpecialty,
                  description: e.target.value,
                })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCreateSpecialty}
              disabled={isCreating}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Specialization Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Specialization"
        size="md">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialty Name
            </label>
            <input
              type="text"
              placeholder="Specialty Name"
              value={editingSpecialization?.name || ""}
              onChange={(e) =>
                setEditingSpecialization((prev) =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Specialty Description"
              value={editingSpecialization?.description || ""}
              onChange={(e) =>
                setEditingSpecialization((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleEditSpecialty}
              disabled={isUpdating}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isUpdating ? (
                <SVGLoader width={"30px"} height={"40px"} color={"#22c55e"} />
              ) : (
                "Update"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
