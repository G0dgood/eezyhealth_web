"use client";

import { useState, useEffect, useMemo } from "react";
import { useGetFirebaseUsersQuery } from "@/store/patientApi";
import { Mail, Eye, Edit, Trash2 } from "lucide-react";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import Dropdown from "@/components/Dropdown";
import Button from "@/components/Button";
import { toast } from "sonner";
import {
  formatDate,
  getRoleBadge,
  getStatusBadge,
  NoRecordFound,
} from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import UserDetailsModal from "@/components/modals/UserDetailsModal";
import UserEditModal from "@/components/modals/UserEditModal";
import DeleteUserModal from "@/components/modals/DeleteUserModal";
import { deleteUser } from "@/hooks/deleteUser";
import { updateUserByUid } from "@/hooks/updateUserByUid";
import UploadBase from "@/components/UploadBaseEmployee";
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { auth, db, secondaryAuth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { createFirebaseDocument } from "@/lib/firebase-rtk";
import { Download } from "lucide-react";
import Pagination from "@/components/Pagination";

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
  password?: string;
  confirmPassword?: string;
  photo_url?: string;
  deactivatedAt?: string;
  deactivationReason?: string;
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string>("all");

  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const itemsPerPage = 10;

  // Use the correct Firebase query
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useGetFirebaseUsersQuery({});

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error("Failed to load users", {
        description:
          "Please try again or contact support if the problem persists.",
        action: {
          label: "Retry",
          onClick: () => refetch(),
        },
        duration: 8000,
      });
    }
  }, [error, refetch]);



  // Handle Firebase users structure safely
  const dataSource: UserData[] = Array.isArray(usersData)
    ? usersData.map((user: any) => ({
      uid: user.uid || user.id || "",
      email: user.email || "",
      display_name: user.display_name || "",
      role: (user.role || "patient").toLowerCase(),
      phone_number: user?.phone_number || "",
      address: user?.address || "",
      location: user?.location || "",
      date_of_birth: user.date_of_birth || "",
      isActive: user.isActive ?? false,
      createdTime: user.createdTime || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      password: user.password || "",
      confirmPassword: user.confirmPassword || "",
      photo_url: user.photo_url || "",
      deactivatedAt: user.deactivatedAt || "",
      deactivationReason: user.deactivationReason || "",
    }))
    : [];

  // Filter users
  const filteredUsers =
    dataSource?.filter((user: UserData) => {
      const matchesSearch =
        (user.display_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.first_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (user.last_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      const matchesRole = selectedRole === "all" || user.role === selectedRole;

      return matchesSearch && matchesRole;
    }) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Modal handlers
  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "first_name",
      "last_name",
      "email",
      "password",
      "role",
      "phone_number",
      "specialization",
      "hospital",
      "experience_yrs",
      "address",
      "date_of_birth",
      "gender"
    ];
    const sampleRow = [
      "John",
      "Doe",
      "john.doe@example.com",
      "Password123!",
      "nurse",
      "+1234567890",
      "General",
      "General Hospital",
      "5",
      "123 Main St",
      "",
      ""
    ];

    const csvContent = [
      headers.join(","),
      sampleRow.join(",")
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "user_upload_template.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleUploadComplete = async (data: Record<string, string>[]) => {
    setIsUploading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const row of data) {
        try {
          const {
            email,
            password,
            first_name,
            last_name,
            role,
            phone_number,
            specialization,
            hospital,
            experience_yrs,
            address,
            date_of_birth,
            gender
          } = row;

          if (!email || !password || !role) {
            console.warn(`Skipping row with missing required fields: ${email}`);
            failCount++;
            continue;
          }

          const display_name = `${first_name} ${last_name}`.trim();

          // 1. Create Auth User using Secondary Auth (to keep admin logged in)
          const userCredential = await createUserWithEmailAndPassword(
            secondaryAuth,
            email,
            password
          );
          const user = userCredential.user;
          const uid = user.uid;

          // 2. Update Profile
          await updateProfile(user, {
            displayName: display_name,
          });

          // Immediately sign out the secondary user to prevent auth state pollution
          await signOut(secondaryAuth);

          // 3. Create User Document in 'users' collection
          await setDoc(doc(db, "users", uid), {
            uid,
            email,
            display_name,
            first_name,
            last_name,
            role: role.toLowerCase(),
            phone_number,
            address,
            photo_url: "",
            isActive: true,
            createdTime: new Date().toISOString(),
          });

          // 4. Create Role Specific Profile
          const roleLower = role.toLowerCase();

          if (roleLower === "nurse") {
            await createFirebaseDocument("nurseProfiles", {
              nurseId: uid,
              display_name,
              first_name,
              last_name,
              email,
              phone_number,
              specialization,
              hospital,
              experience_yrs,
              address,
              about: "",
              isActive: true,
              isVerify: false,
              isTop: false,
              rating: 0,
              role: "nurse",
              photo_url: "",
              createdTime: new Date().toISOString(),
            });
          } else if (roleLower === "doctor") {
            await createFirebaseDocument("doctorProfiles", {
              doctorId: uid,
              display_name,
              first_name,
              last_name,
              email,
              phone_number,
              specialization,
              hospital,
              experience_yrs,
              address,
              about: "",
              isActive: true,
              isVerify: false,
              isTop: false,
              rating: 0,
              role: "doctor",
              photo_url: "",
              createdTime: new Date().toISOString(),
              availability: {}
            });
          } else if (roleLower === "patient") {
            // Patients usually just exist in 'users' or 'patients' collection
            // Depending on schema. AdminPatientsPage uses 'users' collection with role='patient' usually?
            // Let's check AdminPatientsPage... it uses useGetFirebasePatientsQuery.
            // Usually patients are just in users, but let's check if there is a patientProfiles.
            // Assuming just users collection is enough for patient based on typical patterns, 
            // but if needed we can add to 'patients' collection if it exists.
            // Based on AdminPatientsPage, it seems to query users.
          }

          successCount++;
        } catch (err) {
          console.error(`Error creating user ${row.email}:`, err);
          failCount++;
        }
      }

      toast.success(`Upload complete. Created: ${successCount}, Failed: ${failCount}`);
      refetch();
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error("Global upload error:", error);
      toast.error("An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateUser = async (updatedData: Partial<UserData>) => {
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      await updateUserByUid(selectedUser.uid, updatedData);
      toast.success("User updated successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to update user. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    try {
      await deleteUser(selectedUser.uid);
      toast.success("User deleted successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <Title title="User Management" />

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 w-full">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search users by name or email..."
            className="w-full max-w-none lg:max-w-md"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Dropdown
            value={selectedRole}
            onChange={(value) => setSelectedRole(value)}
            options={[
              { value: "all", label: "All Roles" },
              { value: "admin", label: "Admin" },
              { value: "doctor", label: "Doctor" },
              { value: "nurse", label: "Nurse" },
              { value: "patient", label: "Patient" },
            ]}
            placeholder="Select Role"
            className="w-full sm:w-40"
            variant="default"
          />
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="primary"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex-1 sm:flex-none"
            >
              Upload User
            </Button>
            <Button
              variant="neutral"
              onClick={handleDownloadTemplate}
              icon={<Download className="w-4 h-4" />}
              className="flex-1 sm:flex-none"
            >
              Template
            </Button>
            <Button
              variant="soft-green"
              onClick={() => {
                toast.info("Refreshing users...");
                refetch();
              }}
              className="flex-1 sm:flex-none"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <TableSkeleton
          columns={6}
          rows={5}
          headerLabels={[
            "USER",
            "ROLE",
            "CONTACT",
            "STATUS",
            "JOINED",
            "ACTIONS",
          ]}
        />
      ) : (
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="overflow-x-auto">
            <table
              className="w-full"
              style={{
                color: "var(--card-foreground)",
              }}
            >
              <thead
                style={{
                  backgroundColor: "var(--muted)",
                  borderBottomColor: "var(--border)",
                }}
              >
                <tr>
                  {[
                    "USER",
                    "ROLE",
                    "CONTACT",
                    "STATUS",
                    "JOINED",
                    "ACTIONS",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {paginatedUsers.length === 0 ? (
                  <NoRecordFound colSpan={6} />
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-[var(--muted)]">
                      {/* USER */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.photo_url ? (
                              <img
                                src={user.photo_url}
                                alt={user.display_name || "User"}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="avatar-green h-10 w-10 rounded-full flex items-center justify-center">
                                <span className="text-[10px] md:text-[12px] font-medium">
                                  {(
                                    user.display_name ||
                                    user.first_name ||
                                    user.last_name ||
                                    "U"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-[10px] md:text-[12px] font-medium">
                              {user.display_name ||
                                `${user.first_name || ""} ${user.last_name || ""
                                  }`.trim() ||
                                "N/A"}
                            </div>
                            <div className="text-[10px] md:text-[12px] text-gray-500">
                              ID: {user.uid?.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ROLE */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getRoleBadge(user.role || "patient")}>
                          {(user.role || "patient").toUpperCase()}
                        </span>
                      </td>

                      {/* CONTACT */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[10px] md:text-[12px] flex flex-col">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            {user.email}
                          </div>
                          {user.phone_number && (
                            <div className="text-[10px] md:text-[12px] text-gray-500 mt-1">
                              {user.phone_number}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={getStatusBadge(user.isActive || false)}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* JOINED */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[10px] md:text-[12px] text-gray-500">
                          {formatDate(user.createdTime)}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost-neutral"
                            size="sm"
                            icon={<Eye className="h-4 w-4" />}
                            iconOnly
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          />
                          <Button
                            variant="ghost-primary"
                            size="sm"
                            icon={<Edit className="h-4 w-4" />}
                            iconOnly
                            onClick={() => handleEditUser(user)}
                          />
                          <Button
                            variant="ghost-danger"
                            size="sm"
                            icon={<Trash2 className="h-4 w-4" />}
                            iconOnly
                            onClick={() => handleDeleteUser(user)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalCount={filteredUsers.length}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
            itemLabel="users"
            className="mt-4"
          />
        </div>
      )}


      {/* Modals */}
      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleUpdateUser}
        isUpdating={isUpdating}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <UploadBase
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        showButton={false}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
}
