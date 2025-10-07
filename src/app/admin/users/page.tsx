"use client";

import { useState, useEffect, useMemo } from "react";
import { useGetFirebaseUsersQuery } from "@/store/api";
import { Mail, Eye, Edit, Trash2 } from "lucide-react";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
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
  password?: string;
  confirmPassword?: string;
  photo_url?: string;
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string>("all");

  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 10;

  // ✅ Use the correct Firebase query
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

  // ✅ Handle Firebase users structure safely
  const dataSource: UserData[] = Array.isArray(usersData)
    ? usersData.map((user: any) => ({
        uid: user.uid || user.id || "",
        email: user.email || "",
        display_name: user.display_name || "",
        role: (user.role || "PATIENT").toUpperCase(),
        phone_number: user.phone_number || "",
        address: user.address || "",
        location: user.location || "",
        date_of_birth: user.date_of_birth || "",
        isActive: user.isActive ?? false,
        createdTime: user.createdTime || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        password: user.password || "",
        confirmPassword: user.confirmPassword || "",
        photo_url: user.photo_url || "",
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

  const handleUpdateUser = async (updatedData: Partial<UserData>) => {
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      await updateUserByUid(selectedUser.uid, updatedData);
      toast.success("User updated successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to update user. Please try again.");
      console.error("Error updating user:", error);
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
      console.error("Error deleting user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <Title title="User Management" />

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search users by name or email..."
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D] transition-colors duration-200"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--card-foreground)",
            }}
          >
            <option value="all">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="DOCTOR">Doctor</option>
            <option value="NURSE">Nurse</option>
            <option value="PATIENT">Patient</option>
          </select>
          <button
            onClick={() => {
              toast.info("Refreshing users...");
              refetch();
            }}
            className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors duration-200"
          >
            Refresh
          </button>
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
                                <span className="text-sm font-medium">
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
                            <div className="text-sm font-medium">
                              {user.display_name ||
                                `${user.first_name || ""} ${
                                  user.last_name || ""
                                }`.trim() ||
                                "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.uid?.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ROLE */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={getRoleBadge(user.role?.toUpperCase())}
                        >
                          {user.role?.toUpperCase() || "N/A"}
                        </span>
                      </td>

                      {/* CONTACT */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm flex flex-col">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            {user.email}
                          </div>
                          {user.phone_number && (
                            <div className="text-sm text-gray-500 mt-1">
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
                        <div className="text-sm text-gray-500">
                          {formatDate(user.createdTime)}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages} • {filteredUsers.length} users
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
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
    </div>
  );
}
