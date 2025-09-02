"use client";

import { useState, useEffect, useMemo } from "react";
import { useGetUsersQuery, useUpdateUserMutation } from "@/store/api";
import { User, Mail, Eye, Edit, Trash2 } from "lucide-react";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import { toast } from "sonner";
import {
  formatDate,
  getRoleBadge,
  getStatusBadge,
  NoRecordFound,
  SVGLoaderFetch,
} from "@/components/Options";
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

  // Fetch all users using RTK Query
  const { data: users, isLoading, error, refetch } = useGetUsersQuery({});

  // Handle errors and success with Sonner toast
  useEffect(() => {
    if (error) {
      toast.error("Failed to load users", {
        description:
          "Please try again or contact support if the problem persists.",
        action: {
          label: "Retry",
          onClick: () => refetch(),
        },
      });
    }
  }, [error, users, isLoading, refetch]);

  // Handle different possible data structures
  const usersData = users?.users || (Array.isArray(users) ? users : []);

  const filteredUsers = usersData.filter((user: UserData) => {
    const matchesSearch =
      user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === "all" || user?.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers?.length / itemsPerPage);
  const paginatedUsers = filteredUsers?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      refetch(); // Refresh the data
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
      refetch(); // Refresh the data
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

      {/* Search and Filter Bar */}
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
            }}>
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
            className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors duration-200">
            Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div
        className="rounded-lg  border overflow-hidden"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}>
        <div className="overflow-x-auto">
          <table
            className="w-full"
            style={{
              color: "var(--card-foreground)",
            }}>
            <thead
              style={{
                backgroundColor: "var(--muted)",
                borderBottomColor: "var(--border)",
              }}>
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{
                    color: "var(--muted-foreground)",
                  }}>
                  USER
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{
                    color: "var(--muted-foreground)",
                  }}>
                  ROLE
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{
                    color: "var(--muted-foreground)",
                  }}>
                  CONTACT
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{
                    color: "var(--muted-foreground)",
                  }}>
                  STATUS
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{
                    color: "var(--muted-foreground)",
                  }}>
                  JOINED
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{
                    color: "var(--muted-foreground)",
                  }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y divide-[var(--border)]"
              style={{
                backgroundColor: "var(--card)",
                borderTopColor: "var(--border)",
              }}>
              {isLoading ? (
                <SVGLoaderFetch colSpan={6} />
              ) : paginatedUsers?.length === 0 ||
                paginatedUsers?.length === undefined ? (
                <NoRecordFound colSpan={6} />
              ) : (
                paginatedUsers?.map((user: UserData) => (
                  <tr
                    key={user.uid}
                    className="transition-colors duration-200"
                    style={{
                      backgroundColor: "var(--card)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--muted)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--card)";
                    }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div
                            className="text-sm font-medium"
                            style={{
                              color: "var(--card-foreground)",
                            }}>
                            {user?.display_name ||
                              `${user?.first_name || ""} ${
                                user?.last_name || ""
                              }`.trim() ||
                              "N/A"}
                          </div>
                          <div
                            className="text-sm"
                            style={{
                              color: "var(--muted-foreground)",
                            }}>
                            ID: {user?.uid?.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getRoleBadge(user?.role)}>
                        {user?.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="text-sm"
                        style={{
                          color: "var(--card-foreground)",
                        }}>
                        <div className="flex items-center">
                          <Mail
                            className="h-4 w-4 mr-2"
                            style={{
                              color: "var(--muted-foreground)",
                            }}
                          />
                          {user?.email}
                        </div>
                        {user?.phone_number && (
                          <div
                            className="text-sm mt-1"
                            style={{
                              color: "var(--muted-foreground)",
                            }}>
                            {user?.phone_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(user?.isActive || false)}>
                        {user?.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className="text-sm"
                        style={{
                          color: "var(--muted-foreground)",
                        }}>
                        {formatDate(user?.createdTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div
            className="text-sm"
            style={{
              color: "var(--muted-foreground)",
            }}>
            Page {currentPage} of {totalPages} • {filteredUsers.length} users
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                color: "var(--card-foreground)",
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = "var(--muted)";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = "var(--card)";
                }
              }}>
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = "#3bb025";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = "var(--primary)";
                }
              }}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      {/* User Edit Modal */}
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

      {/* Delete User Confirmation Modal */}
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
