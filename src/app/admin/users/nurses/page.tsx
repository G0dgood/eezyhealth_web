"use client";

import { useState } from "react";
import {
  Star,
  Phone,
  User,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import Button from "@/components/Button";
import Image from "next/image";
import { useGetFirebaseNurseProfilesQuery } from "@/store/doctorFirebaseApi";
import { NoRecordFound, getStatusBadge } from "@/components/Options";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import UserDetailsModal from "@/components/modals/UserDetailsModal";
import UserEditModal from "@/components/modals/UserEditModal";
import DeleteUserModal from "@/components/modals/DeleteUserModal";
import { deleteUser } from "@/hooks/deleteUser";
import { updateUserByUid } from "@/hooks/updateUserByUid";
import { createFirebaseDocument } from "@/lib/firebase-rtk";
import Pagination from "@/components/Pagination";
import AddNurseModalComponent, { NurseFormData as NurseFormDataType } from "@/components/modals/AddNurseModal";
import { auth, secondaryAuth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";

interface UserData {
  uid: string;
  email: string;
  display_name?: string;
  role: "admin" | "doctor" | "nurse" | "patient";
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
  role: "admin" | "doctor" | "nurse" | "patient";
  deactivatedAt?: string;
  deactivationReason?: string;
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
  const [formData, setFormData] = useState<NurseFormDataType>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    specialization: "",
    hospital: "",
    experience_yrs: "",
    address: "",
    password: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;

  const {
    data: nursesData = [],
    isLoading,

    isError,
    refetch,
  } = useGetFirebaseNurseProfilesQuery({});

  const transformedNurses = nursesData.map(
    (nurse: Record<string, unknown>, index: number): Nurse => ({
      uid: (nurse.uid as string) || (nurse.id as string) || `nurse-${index}`,
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
      role: (nurse.role as "admin" | "doctor" | "nurse" | "patient") || "nurse",
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
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormChange = (field: keyof NurseFormDataType, value: string) => {
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
      password: "",
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
      !formData.phone_number ||
      !formData.specialization ||
      !formData.hospital ||
      !formData.experience_yrs ||
      !formData.address ||
      !formData.password
    ) {
      toast.error("Please fill in all fields before saving");
      return;
    }

    setIsCreating(true);
    try {
      const display_name = `${formData.first_name} ${formData.last_name}`.trim();

      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email,
        formData.password
      );

      const nurseUid = userCredential.user.uid;

      // Immediately sign out the secondary user to prevent auth state pollution
      // This ensures the admin remains logged in with the primary auth instance
      await signOut(secondaryAuth);

      await createFirebaseDocument("users", {
        uid: nurseUid,
        email: formData.email,
        display_name,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: "nurse",
        phone_number: formData.phone_number,
        address: formData.address,
        location: formData.address,
        isActive: true,
        status: "ACTIVE",
        createdTime: new Date().toISOString(),
      });

      await createFirebaseDocument("nurseProfiles", {
        nurseId: nurseUid,
        display_name,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
        specialization: formData.specialization,
        hospital: formData.hospital,
        experience_yrs: formData.experience_yrs,
        address: formData.address,
        about: "",
        isActive: true,
        isVerify: false,
        isTop: false,
        rating: 0,
        role: "nurse",
        photo_url: "",
        createdTime: new Date().toISOString(),
      });

      await sendPasswordResetEmail(auth, formData.email);

      toast.success("Nurse created and invite email sent");
      handleCloseAddModal();
      refetch();
    } catch (error) {
      console.error("Error creating nurse user:", error);

      const backendError =
        typeof error === "object" && error !== null
          ? // RTK Query style error shapes
          // @ts-expect-error runtime error shape
          error.data?.error ||
          // @ts-expect-error runtime error shape
          error.data?.message ||
          // @ts-expect-error runtime error shape
          error.error ||
          // @ts-expect-error runtime error shape
          error.message
          : undefined;

      toast.error(backendError || "Failed to create nurse user. Please try again.");
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
        <Button
          onClick={() => window.location.reload()}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          Retry
        </Button>
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Title title="Nurse Management" />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search nurses..."
            className="w-full sm:w-64 max-w-none"
          />
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Add Nurse
          </Button>
        </div>
      </div>

      {/* Nurses Table */}
      <div className="bg-white rounded-lg  border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th>Nurse</th>
                <th>Contact</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedNurses.length === 0 ? (
                <NoRecordFound colSpan={6} />
              ) : (
                paginatedNurses.map((nurse) => {
                  const displayName =
                    nurse.display_name ||
                    `${nurse.first_name || ""} ${nurse.last_name || ""}`.trim() ||
                    "Nurse";

                  const initials = displayName
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase();

                  const hasImage = Boolean(nurse.photo_url || nurse.image);

                  return (
                    <tr key={nurse.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {hasImage ? (
                              <Image
                                className="h-12 w-12 rounded-full object-cover"
                                src={
                                  nurse.photo_url ||
                                  nurse.image ||
                                  "/api/placeholder/120/120"
                                }
                                alt={displayName}
                                width={48}
                                height={48}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-[10px] md:text-[12px] font-semibold text-green-700">
                                {initials}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-[10px] md:text-[12px] font-medium text-gray-900">
                              {displayName}
                            </div>
                            <div className="text-[10px] md:text-[12px] text-gray-500">
                              {nurse.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[10px] md:text-[12px] text-gray-900">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {nurse.phone_number || "N/A"}
                          </div>
                          {nurse.hospital && (
                            <div className="flex items-center mt-1">
                              <User className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="text-[10px] md:text-[12px] text-gray-600 truncate">
                                {nurse.hospital}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[10px] md:text-[12px] text-gray-900">
                          {nurse.specialization || nurse.title || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[10px] md:text-[12px] text-gray-900">
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
                        <span className={getStatusBadge(nurse.isActive ?? true)}>
                          {nurse.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost-neutral"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                            iconOnly
                            onClick={() => handleViewNurse(nurse)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                            title="View Details"
                          />
                          <Button
                            variant="ghost-primary"
                            size="sm"
                            icon={<Edit className="w-4 h-4" />}
                            iconOnly
                            onClick={() => handleEditNurse(nurse)}
                            title="Edit Nurse"
                          />
                          <Button
                            variant="ghost-danger"
                            size="sm"
                            icon={<Trash2 className="w-4 h-4" />}
                            iconOnly
                            onClick={() => handleDeleteNurse(nurse)}
                            title="Delete Nurse"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalCount={filteredNurses.length}
          pageSize={itemsPerPage}
          onPageChange={setCurrentPage}
          itemLabel="nurses"
          className="mt-4"
        />
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

      <AddNurseModalComponent
        isOpen={isAddModalOpen}
        isCreating={isCreating}
        formData={formData}
        onChange={handleFormChange}
        onClose={handleCloseAddModal}
        onSave={handleSaveNurse}
      />
    </div>
  );
}
