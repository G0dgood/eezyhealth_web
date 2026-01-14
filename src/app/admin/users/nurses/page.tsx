"use client";

import { useState } from "react";
import {
  Star,
  Mail,
  Phone,
  MapPin,
  User,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import Image from "next/image";
import { useGetFirebaseNurseProfilesQuery } from "@/store/doctorFirebaseApi";
import { NoRecordFound, formatDate, getStatusBadge } from "@/components/Options";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import UserDetailsModal from "@/components/modals/UserDetailsModal";
import UserEditModal from "@/components/modals/UserEditModal";
import DeleteUserModal from "@/components/modals/DeleteUserModal";
import { deleteUser } from "@/hooks/deleteUser";
import { updateUserByUid } from "@/hooks/updateUserByUid";
import Modal from "@/components/modals/Modal";
import FormInput from "@/components/FormInput";
import { useCreateUserMutation, useSendPasswordResetLinkMutation } from "@/store/authApi";

interface UserData {
  uid: string;
  email: string;
  display_name?: string;
  role: "ADMIN" | "DOCTOR" | "NURSE" | "PATIENT";
  phone_number?: string;
  address?: string;
  location?: string;
  date_of_birth?: string;
  isActive?: boolean;
  createdTime?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  deactivatedAt?: string;
  deactivationReason?: string;
}

interface Nurse {
  uid: string;
  id?: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  specialization?: string;
  experience_yrs?: string;
  rating?: number;
  email: string;
  phone_number?: string;
  isTop?: boolean;
  isActive?: boolean;
  isVerify?: boolean;
  address?: string;
  hospital?: string;
  about?: string;
  availability?: {
    [day: string]: {
      [time: string]: string;
    };
  };
  createdTime?: Date | string;
  date_of_birth?: Date | string;
  nurseId?: string;
  photo_url?: string;
  image?: string;
  role: "ADMIN" | "DOCTOR" | "NURSE" | "PATIENT";
  deactivatedAt?: string;
  deactivationReason?: string;
}

interface NurseFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  specialization: string;
  hospital: string;
  experience_yrs: string;
  address: string;
}

export default function AdminNursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState<UserData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<NurseFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    specialization: "",
    hospital: "",
    experience_yrs: "",
    address: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createUser] = useCreateUserMutation();
  const [sendPasswordReset] = useSendPasswordResetLinkMutation();

  const itemsPerPage = 10;

  const {
    data: nursesData = [],
    isLoading,
    error,
    isError,
    refetch,
  } = useGetFirebaseNurseProfilesQuery({});

  const transformedNurses = nursesData.map(
    (nurse: Record<string, unknown>, index: number): Nurse => ({
      uid: (nurse.uid as string) || `nurse-${index}`,
      id: (nurse.id as string) || (nurse.uid as string) || `nurse-${index}`,
      display_name: nurse.display_name as string,
      first_name: nurse.first_name as string,
      last_name: nurse.last_name as string,
      title: nurse.title as string,
      specialization: nurse.specialization as string,
      experience_yrs: nurse.experience_yrs as string,
      rating: typeof nurse.rating === "number" ? nurse.rating : 0,
      email: nurse.email as string,
      phone_number: nurse.phone_number as string,
      isTop: typeof nurse.isTop === "boolean" ? nurse.isTop : false,
      isActive: typeof nurse.isActive === "boolean" ? nurse.isActive : true,
      isVerify: typeof nurse.isVerify === "boolean" ? nurse.isVerify : false,
      address: nurse.address as string,
      hospital: nurse.hospital as string,
      about: nurse.about as string,
      availability: nurse.availability as {
        [day: string]: {
          [time: string]: string;
        };
      },
      createdTime: nurse.createdTime as Date | string,
      date_of_birth: nurse.date_of_birth as Date | string,
      nurseId: nurse.nurseId as string,
      photo_url: nurse.photo_url as string,
      image: nurse.image as string,
      role: (nurse.role as "ADMIN" | "DOCTOR" | "NURSE" | "PATIENT") || "NURSE",
      deactivatedAt: nurse.deactivatedAt as string,
      deactivationReason: nurse.deactivationReason as string,
    })
  );

  const nurses = transformedNurses;

  const filteredNurses = nurses.filter((nurse) => {
    const name =
      nurse.display_name ||
      `${nurse.first_name || ""} ${nurse.last_name || ""}`.trim() ||
      "";
    const specialization = nurse.specialization || nurse.title || "";

    return (
      (typeof name === "string" &&
        name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (typeof specialization === "string" &&
        specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      nurse.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const paginatedNurses = filteredNurses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredNurses.length / itemsPerPage);

  const renderStars = (rating: number = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
        />
      );
    }
    return stars;
  };

  const convertNurseToUserData = (nurse: Nurse): UserData => ({
    uid: nurse.uid,
    email: nurse.email,
    display_name: nurse.display_name,
    role: nurse.role,
    phone_number: nurse.phone_number,
    address: nurse.address,
    location: nurse.address,
    date_of_birth:
      typeof nurse.date_of_birth === "string"
        ? nurse.date_of_birth
        : nurse.date_of_birth?.toString(),
    isActive: nurse.isActive,
    createdTime:
      typeof nurse.createdTime === "string"
        ? nurse.createdTime
        : nurse.createdTime?.toString(),
    first_name: nurse.first_name,
    last_name: nurse.last_name,
    photo_url: nurse.photo_url,
    deactivatedAt: nurse.deactivatedAt,
    deactivationReason: nurse.deactivationReason,
  });

  const handleViewNurse = (nurse: Nurse) => {
    setSelectedNurse(convertNurseToUserData(nurse));
    setIsDetailsModalOpen(true);
  };

  const handleEditNurse = (nurse: Nurse) => {
    setSelectedNurse(convertNurseToUserData(nurse));
    setIsEditModalOpen(true);
  };

  const handleDeleteNurse = (nurse: Nurse) => {
    setSelectedNurse(convertNurseToUserData(nurse));
    setIsDeleteModalOpen(true);
  };

  const handleUpdateNurse = async (updatedData: Partial<UserData>) => {
    if (!selectedNurse) return;
    setIsUpdating(true);
    try {
      await updateUserByUid(selectedNurse.uid, updatedData);
      toast.success("Nurse updated successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to update nurse. Please try again.");
      console.error("Error updating nurse:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedNurse) return;
    setIsDeleting(true);
    try {
      await deleteUser(selectedNurse.uid);
      toast.success("Nurse deleted successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to delete nurse. Please try again.");
      console.error("Error deleting nurse:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormChange = (field: keyof NurseFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      specialization: "",
      hospital: "",
      experience_yrs: "",
      address: "",
    });
  };

  const handleCloseAddModal = () => {
    resetForm();
    setIsAddModalOpen(false);
  };

  const handleSaveNurse = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.phone_number
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const temporaryPassword = `${formData.first_name.toLowerCase() || "nurse"}@123`;

      await createUser({
        email: formData.email,
        password: temporaryPassword,
        role: "NURSE",
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        specialization: formData.specialization || undefined,
        hospital: formData.hospital || undefined,
        experience_yrs: formData.experience_yrs || undefined,
        address: formData.address || undefined,
      }).unwrap();

      await sendPasswordReset({ email: formData.email }).unwrap();

      toast.success("Nurse created and invite email sent");
      handleCloseAddModal();
      refetch();
    } catch (error) {
      console.error("Error creating nurse user:", error);
      toast.error("Failed to create nurse user. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center mb-4">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded w-80 animate-pulse"></div>
        </div>

        <TableSkeleton columns={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Failed to load nurses
        </h2>
        <p className="text-gray-600 mb-6">
          Please try again or contact support if the problem persists.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Breadcrumb
          homeHref="/admin"
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Users", href: "/admin/users" },
            { label: "Nurses", href: "/admin/users/nurses" },
          ]}
        />
      </div>

      <div className="flex flex-row justify-between items-center mb-4">
        <Title title="Nurse Management" />

        <div className="flex items-center gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search nurses by name, specialization, or email..."
            className="max-w-none"
          />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Nurse</span>
          </button>
        </div>
      </div>

      {/* Nurses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nurse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedNurses.length === 0 ? (
                <NoRecordFound colSpan={6} />
              ) : (
                paginatedNurses.map((nurse) => (
                  <tr key={nurse.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <Image
                            className="h-12 w-12 rounded-full object-cover"
                            src={
                              nurse.photo_url ||
                              nurse.image ||
                              "/api/placeholder/120/120"
                            }
                            alt={nurse.display_name || "Nurse"}
                            width={48}
                            height={48}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {nurse.display_name ||
                              `${nurse.first_name || ""} ${nurse.last_name || ""
                                }`.trim() ||
                              "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {nurse.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {nurse.phone_number || "N/A"}
                        </div>
                        {nurse.hospital && (
                          <div className="flex items-center mt-1">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-sm text-gray-600 truncate">
                              {nurse.hospital}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {nurse.specialization || nurse.title || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {nurse.experience_yrs
                          ? `${nurse.experience_yrs} years`
                          : "N/A"}
                      </div>
                      {nurse.rating && nurse.rating > 0 && (
                        <div className="flex items-center mt-1">
                          {renderStars(nurse.rating)}
                          <span className="ml-1 text-xs text-gray-500">
                            ({nurse.rating.toFixed(1)})
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(nurse.isActive ?? true)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewNurse(nurse)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditNurse(nurse)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                          title="Edit Nurse"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNurse(nurse)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                          title="Delete Nurse"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredNurses.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredNurses.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                          ? "z-10 bg-green-50 border-green-500 text-green-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedNurse && (
        <>
          <UserDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            user={selectedNurse}
          />
          <UserEditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            user={selectedNurse}
            onSave={handleUpdateNurse}
            isUpdating={isUpdating}
          />
          <DeleteUserModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            user={selectedNurse}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
          />
        </>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Add New Nurse"
        size="md"
      >
        <div className="space-y-4">
          <FormInput
            label="First Name"
            placeholder="Enter first name"
            value={formData.first_name}
            onChange={(value) => handleFormChange("first_name", value)}
            required
          />
          <FormInput
            label="Last Name"
            placeholder="Enter last name"
            value={formData.last_name}
            onChange={(value) => handleFormChange("last_name", value)}
            required
          />
          <FormInput
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(value) => handleFormChange("email", value)}
            required
          />
          <FormInput
            label="Phone Number"
            type="tel"
            placeholder="Enter phone number"
            value={formData.phone_number}
            onChange={(value) => handleFormChange("phone_number", value)}
            required
          />
          <FormInput
            label="Specialization"
            placeholder="Enter specialization"
            value={formData.specialization}
            onChange={(value) => handleFormChange("specialization", value)}
          />
          <FormInput
            label="Hospital"
            placeholder="Enter hospital"
            value={formData.hospital}
            onChange={(value) => handleFormChange("hospital", value)}
          />
          <FormInput
            label="Years of Experience"
            placeholder="Enter years of experience"
            value={formData.experience_yrs}
            onChange={(value) => handleFormChange("experience_yrs", value)}
          />
          <FormInput
            label="Address"
            placeholder="Enter address"
            value={formData.address}
            onChange={(value) => handleFormChange("address", value)}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleCloseAddModal}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNurse}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
