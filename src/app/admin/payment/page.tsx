"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  CreditCard,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Modal from "@/components/modals/Modal";
import SearchInput from "@/components/SearchInput";
import { NoRecordFound, SVGLoaderFetch } from "@/components/Options";
import {
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
} from "@/store/api";
import { toast } from "sonner";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  paymentMethod: string;
  patientId?: string;
  doctorId?: string;
  bookingId?: string;
  description?: string;
  transactionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Utility function to safely render field values
const safeRenderField = (value: unknown, fallback: string = "N/A") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return fallback;
};

export default function AdminPaymentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    currency: "USD",
    status: "pending" as "pending" | "completed" | "failed" | "cancelled",
    paymentMethod: "",
    patientId: "",
    doctorId: "",
    bookingId: "",
    description: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // RTK hooks
  const {
    data: payments = [],
    isLoading,
    error,
  } = useGetPaymentsQuery({ limit: 50 });
  const [createPayment, { isLoading: isCreating }] = useCreatePaymentMutation();
  const [updatePayment, { isLoading: isUpdating }] = useUpdatePaymentMutation();
  const [deletePayment, { isLoading: isDeleting }] = useDeletePaymentMutation();

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : "Error loading payments. Please try again.";
      toast.error(errorMessage);
    }
  }, [error]);

  // Filter payments based on search query
  const filteredPayments = payments.filter(
    (payment: Record<string, unknown> & { id: string }) =>
      (payment?.description as string)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (payment?.paymentMethod as string)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (payment?.status as string)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (payment?.transactionId as string)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments?.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleCreatePayment = async () => {
    if (newPayment.amount > 0 && newPayment.paymentMethod) {
      try {
        await createPayment(newPayment).unwrap();
        toast.success("Payment created successfully!");
        setNewPayment({
          amount: 0,
          currency: "USD",
          status: "pending",
          paymentMethod: "",
          patientId: "",
          doctorId: "",
          bookingId: "",
          description: "",
        });
        setIsCreateModalOpen(false);
      } catch (error) {
        console.error("Error creating payment:", error);
        toast.error("Failed to create payment. Please try again.");
      }
    }
  };

  const handleEditPayment = async () => {
    if (
      editingPayment &&
      editingPayment.amount > 0 &&
      editingPayment.paymentMethod
    ) {
      try {
        await updatePayment({
          id: editingPayment.id,
          amount: editingPayment.amount,
          currency: editingPayment.currency,
          status: editingPayment.status,
          paymentMethod: editingPayment.paymentMethod,
          patientId: editingPayment.patientId,
          doctorId: editingPayment.doctorId,
          bookingId: editingPayment.bookingId,
          description: editingPayment.description,
        }).unwrap();
        toast.success("Payment updated successfully!");
        setEditingPayment(null);
        setIsEditModalOpen(false);
      } catch (error) {
        console.error("Error updating payment:", error);
        toast.error("Failed to update payment. Please try again.");
      }
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await deletePayment(id).unwrap();
        toast.success("Payment deleted successfully!");
      } catch (error) {
        console.error("Error deleting payment:", error);
        toast.error("Failed to delete payment. Please try again.");
      }
    }
  };

  const openEditModal = (payment: Payment) => {
    setEditingPayment(payment);
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "cancelled":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div>
      <div>
        <div className="flex-1">
          <div className="mb-6">
            <Breadcrumb
              items={[{ label: "Admin", href: "/admin" }, { label: "Payment" }]}
            />
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Management
            </h1>
            <p className="text-gray-600">
              Manage and track all payment transactions
            </p>
          </div>

          {/* Search and Create Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search payments..."
              />
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Plus className="w-5 h-5" />
              <span>Create New Payment</span>
            </button>
          </div>

          {/* Payments Table */}

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th>Transaction</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <SVGLoaderFetch colSpan={7} />
                  ) : paginatedPayments?.length === 0 ||
                    paginatedPayments?.length === undefined ? (
                    <NoRecordFound colSpan={7} />
                  ) : (
                    paginatedPayments?.map(
                      (payment: Record<string, unknown> & { id: string }) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {/* {safeRenderField(payment.transactionId, payment.id.slice(0, 8))} */}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {/* {safeRenderField(payment.description, )} */}
                                  Payment transaction
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(
                                typeof payment.amount === "number"
                                  ? payment.amount
                                  : 0,
                                typeof payment.currency === "string"
                                  ? payment.currency
                                  : "USD"
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {safeRenderField(
                                payment.paymentMethod,
                                "Unknown"
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={getStatusBadge(
                                typeof payment.status === "string"
                                  ? payment.status
                                  : "unknown"
                              )}>
                              {safeRenderField(payment.status, "Unknown")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.createdAt &&
                            typeof payment.createdAt === "string"
                              ? new Date(payment.createdAt).toLocaleDateString()
                              : payment.createdAt &&
                                typeof payment.createdAt === "object"
                              ? new Date(
                                  JSON.stringify(payment.createdAt)
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  openEditModal(payment as unknown as Payment)
                                }
                                className="text-blue-600 hover:text-blue-900">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePayment(payment.id)}
                                disabled={isDeleting}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
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

      {/* Create New Payment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Payment"
        size="lg">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newPayment.amount}
                onChange={(e) =>
                  setNewPayment({
                    ...newPayment,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={newPayment.currency}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, currency: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="NGN">NGN</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <input
                type="text"
                placeholder="Credit Card, Bank Transfer, etc."
                value={newPayment.paymentMethod}
                onChange={(e) =>
                  setNewPayment({
                    ...newPayment,
                    paymentMethod: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={newPayment.status}
                onChange={(e) =>
                  setNewPayment({
                    ...newPayment,
                    status: e.target.value as
                      | "pending"
                      | "completed"
                      | "failed"
                      | "cancelled",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Payment description"
              value={newPayment.description}
              onChange={(e) =>
                setNewPayment({ ...newPayment, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCreatePayment}
              disabled={isCreating}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isCreating ? "Creating..." : "Create Payment"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Payment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Payment"
        size="lg">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={editingPayment?.amount || 0}
                onChange={(e) =>
                  setEditingPayment((prev) =>
                    prev
                      ? { ...prev, amount: parseFloat(e.target.value) || 0 }
                      : null
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={editingPayment?.currency || "USD"}
                onChange={(e) =>
                  setEditingPayment((prev) =>
                    prev ? { ...prev, currency: e.target.value } : null
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="NGN">NGN</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <input
                type="text"
                placeholder="Credit Card, Bank Transfer, etc."
                value={editingPayment?.paymentMethod || ""}
                onChange={(e) =>
                  setEditingPayment((prev) =>
                    prev ? { ...prev, paymentMethod: e.target.value } : null
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={editingPayment?.status || "pending"}
                onChange={(e) =>
                  setEditingPayment((prev) =>
                    prev
                      ? {
                          ...prev,
                          status: e.target.value as
                            | "pending"
                            | "completed"
                            | "failed"
                            | "cancelled",
                        }
                      : null
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Payment description"
              value={editingPayment?.description || ""}
              onChange={(e) =>
                setEditingPayment((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              rows={3}
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
              onClick={handleEditPayment}
              disabled={isUpdating}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isUpdating ? "Updating..." : "Update Payment"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
