"use client";

import { useState, useMemo } from "react";
import { useGetFirebaseFinanceUsersQuery } from "@/store/doctorFirebaseApi";
import { Mail, Eye, Edit, Trash2, Plus, RefreshCw, ShieldCheck } from "lucide-react";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
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
import AddFinanceModal from "@/components/modals/AddFinanceModal";
import { deleteUser } from "@/hooks/deleteUser";
import { updateUserByUid } from "@/hooks/updateUserByUid";
import { useApiError } from "@/hooks/useApiError";
import Pagination from "@/components/Pagination";

interface UserData {
  uid: string;
  email: string;
  display_name?: string;
  role: "admin" | "doctor" | "nurse" | "patient" | "finance";
  phone_number?: string;
  address?: string;
  location?: string;
  date_of_birth?: string;
  gender?: string;
  isActive?: boolean;
  createdTime?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  deactivatedAt?: string;
  deactivationReason?: string;
}

export default function AdminFinanceUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: financeUsersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetFirebaseFinanceUsersQuery({});

  useApiError(isError, error, "Failed to load finance officers");

  const dataSource: UserData[] = useMemo(() => {
    const rawData = Array.isArray(financeUsersData) ? financeUsersData : [];
    return rawData.map((user: any) => ({
      uid: user.uid || user.id || "",
      email: user.email || "",
      display_name: user.display_name || user.displayName || user.name || "",
      first_name: user.first_name || user.firstName || "",
      last_name: user.last_name || user.lastName || "",
      role: "finance",
      phone_number: user.phone_number || user.phoneNumber || user.phone || "",
      address: user.address || "",
      location: user.location || "",
      date_of_birth: user.date_of_birth || user.dob || "",
      isActive: user.isActive !== undefined ? user.isActive : true,
      createdTime: user.createdTime || user.createdAt || "",
      photo_url: user.photo_url || user.photoURL || user.avatar || "",
      deactivatedAt: user.deactivatedAt,
      deactivationReason: user.deactivationReason,
    }));
  }, [financeUsersData]);

  // Filter based on search
  const filteredUsers = useMemo(() => {
    return dataSource.filter((user) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const name = `${user.first_name || ""} ${user.last_name || ""} ${user.display_name || ""}`.toLowerCase();
      const email = (user.email || "").toLowerCase();
      const phone = (user.phone_number || "").toLowerCase();
      return name.includes(term) || email.includes(term) || phone.includes(term);
    });
  }, [dataSource, searchTerm]);

  // Pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleEdit = (user: UserData) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDetails = (user: UserData) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateUser = async (updatedData: Partial<UserData>): Promise<void> => {
    if (!selectedUser?.uid) return;
    setIsUpdating(true);
    try {
      await updateUserByUid(selectedUser.uid, updatedData);
      toast.success("Finance officer updated successfully!");
      setIsEditModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update finance user");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!selectedUser?.uid) return;
    setIsDeleting(true);
    try {
      await deleteUser(selectedUser.uid);
      toast.success("Finance user deleted successfully");
      setIsDeleteModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Title title="Finance Team Management" />
          <p className="text-[12px] text-gray-500 mt-1">
            Manage Finance Officers who verify bank transfer receipts, confirm payments, and issue refunds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline-neutral"
            onClick={() => refetch()}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="!bg-[#44CE2D] hover:!bg-[#3bb826] flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Finance User
          </Button>
        </div>
      </div>

      {/* Search & Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <SearchInput
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
            placeholder="Search finance officer..."
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Finance role grants access to payment verification and company bank account management.</span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th>Officer Name &amp; Email</th>
                  <th>Phone Number</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Date Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUsers.length === 0 ? (
                  <NoRecordFound colSpan={6} />
                ) : (
                  paginatedUsers.map((user) => {
                    const displayName =
                      user.display_name ||
                      `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                      "Finance Officer";

                    return (
                      <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs uppercase border border-amber-200">
                              {displayName.substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-[13px]">{displayName}</p>
                              <p className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3" /> {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {user.phone_number || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span className={getRoleBadge("finance")}>
                            FINANCE
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className={getStatusBadge(user.isActive !== false)}>
                            {user.isActive !== false ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-gray-500">
                          {user.createdTime ? formatDate(user.createdTime) : "—"}
                        </td>

                        <td className="space-x-1.5">
                          <Button
                            variant="ghost-neutral"
                            size="sm"
                            icon={<Eye className="h-4 w-4" />}
                            iconOnly
                            onClick={() => handleDetails(user)}
                          />
                          <Button
                            variant="ghost-primary"
                            size="sm"
                            icon={<Edit className="h-4 w-4" />}
                            iconOnly
                            onClick={() => handleEdit(user)}
                          />
                          <Button
                            variant="ghost-danger"
                            size="sm"
                            icon={<Trash2 className="h-4 w-4" />}
                            iconOnly
                            onClick={() => handleDeleteClick(user)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredUsers.length > itemsPerPage && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <Pagination
              currentPage={currentPage}
              totalCount={filteredUsers.length}
              pageSize={itemsPerPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setItemsPerPage(size);
                setCurrentPage(1);
              }}
              itemLabel="finance users"
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {isDetailsModalOpen && selectedUser && (
        <UserDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}

      {isEditModalOpen && selectedUser && (
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
      )}

      {isDeleteModalOpen && selectedUser && (
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
      )}

      {isAddModalOpen && (
        <AddFinanceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            refetch();
            setIsAddModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
