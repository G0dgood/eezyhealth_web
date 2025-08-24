"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Eye } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Modal from "@/components/modals/Modal";
import SearchInput from "@/components/SearchInput";
import { useGetPaymentsQuery } from "@/store/api";
import { toast } from "sonner";
import { NoRecordFound, SVGLoaderFetch } from "@/components/Options";

export default function AdminPaymentPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  type Payment = {
    id: string;
    patientName: string;
    doctorName: string;
    appointmentDate: string;
    amount: number;
    paymentMethod: string;
    status: "completed" | "pending" | "failed";
    createdAt: string;
    updatedAt: string;
  };

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Fetch payments from API
  const { data: payments, isLoading, error, refetch } = useGetPaymentsQuery({});

  // Filter and paginate payments
  const filteredPayments = useMemo(() => {
    if (!payments) return [];

    return payments.filter(
      (payment: Payment) =>
        payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [payments, searchTerm]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle API responses
  useEffect(() => {
    if (error) {
      toast.error("Failed to load payments. Please try again.", {
        action: {
          label: "Retry",
          onClick: () => refetch(),
        },
      });
    }
  }, [error, refetch]);

  useEffect(() => {
    if (payments && payments.length > 0) {
      toast.success(`Successfully loaded ${payments.length} payments`);
    }
  }, [payments]);

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        homeHref="/admin"
        items={[{ label: "Admin", href: "/admin" }, { label: "Payment" }]}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          Payment
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Manage patient payments
        </p>
      </div>

      {/* Search and Actions */}
      <div className=" mb-6">
        <div className="flex items-center justify-between">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search payments..."
          />

          <div className="flex space-x-2">
            <button
              onClick={() => {
                toast.info("Refreshing payments...");
                refetch();
              }}
              className="px-4 py-2 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-lg hover:bg-[var(--accent)] transition-colors flex items-center space-x-2 cursor-pointer">
              <span>Refresh</span>
            </button>
            <button className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary)]/90 transition-colors flex items-center space-x-2 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Add Payment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payments Summary */}
      {payments && payments.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
            <div className="text-sm text-[var(--muted-foreground)]">
              Total Payments
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {payments.length}
            </div>
          </div>
          <div className="bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
            <div className="text-sm text-[var(--muted-foreground)]">
              Completed
            </div>
            <div className="text-2xl font-bold text-green-600">
              {payments.filter((p: Payment) => p.status === "completed").length}
            </div>
          </div>
          <div className="bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
            <div className="text-sm text-[var(--muted-foreground)]">
              Pending
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {payments.filter((p: Payment) => p.status === "pending").length}
            </div>
          </div>
          <div className="bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
            <div className="text-sm text-[var(--muted-foreground)]">
              Total Amount
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)]">
              ₦
              {payments
                .reduce((sum: number, p: Payment) => sum + p.amount, 0)
                .toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Payments Table */}

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  PATIENT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  DOCTOR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  DATE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  AMOUNT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  PAYMENT METHOD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
              {isLoading ? (
                <SVGLoaderFetch colSpan={7} text="Loading users..." />
              ) : paginatedPayments?.length === 0 ||
                paginatedPayments?.length === undefined ? (
                <NoRecordFound colSpan={7} />
              ) : (
                paginatedPayments?.map((payment: Payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-[var(--muted)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[var(--foreground)]">
                        {payment.patientName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--muted-foreground)]">
                        {payment.doctorName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--muted-foreground)]">
                        {payment.appointmentDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-[var(--foreground)]">
                        ₦{payment.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--muted-foreground)]">
                        {payment.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          payment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setIsPaymentModalOpen(true);
                        }}
                        className="text-[var(--primary)] hover:text-[var(--primary)]/80 font-medium text-sm cursor-pointer flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
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
          <div className="text-sm text-[var(--muted-foreground)]">
            Page {currentPage} of {totalPages} • {filteredPayments.length}{" "}
            payments
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] bg-[var(--primary)] rounded-lg hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Payment Details"
        size="md">
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  Patient Name
                </label>
                <p className="text-[var(--foreground)]">
                  {selectedPayment.patientName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  Doctor
                </label>
                <p className="text-[var(--foreground)]">
                  {selectedPayment.doctorName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  Date
                </label>
                <p className="text-[var(--foreground)]">
                  {selectedPayment.appointmentDate}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  Amount
                </label>
                <p className="text-[var(--foreground)] font-semibold">
                  ₦{selectedPayment.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  Payment Method
                </label>
                <p className="text-[var(--foreground)]">
                  {selectedPayment.paymentMethod}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  Status
                </label>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    selectedPayment.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : selectedPayment.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                  {selectedPayment.status.charAt(0).toUpperCase() +
                    selectedPayment.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)]">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-[var(--border)] text-[var(--muted-foreground)] rounded-lg hover:bg-[var(--muted)] transition-colors cursor-pointer">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
