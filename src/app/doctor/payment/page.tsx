"use client";

import { useState } from "react";
import { Download, Eye, Calendar, CreditCard, DollarSign } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Title from "@/components/Title";
import SearchInput from "@/components/SearchInput";
import {
  DoctorPayment,
  PaymentFilterData,
  PaymentMethod,
  DoctorPaymentStatus,
} from "@/types";

export default function DoctorPaymentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedFilters, setSelectedFilters] = useState<PaymentFilterData>({
    dateRange: "",
    paymentStatus: "",
  });

  // Sample payment data for doctors
  const payments: DoctorPayment[] = [
    {
      id: "PAY-001",
      patientName: "John Smith",
      appointmentDate: "2024-01-15",
      serviceType: "Consultation",
      amount: 150.0,
      paymentMethod: "Credit Card",
      status: "Completed",
      transactionId: "TXN-2024-001",
      doctorName: "Dr. Prosper Matt",
      specialization: "Psychologist Specialist",
    },
    {
      id: "PAY-002",
      patientName: "Sarah Johnson",
      appointmentDate: "2024-01-16",
      serviceType: "Therapy Session",
      amount: 200.0,
      paymentMethod: "Bank Transfer",
      status: "Pending",
      transactionId: "TXN-2024-002",
      doctorName: "Dr. Prosper Matt",
      specialization: "Psychologist Specialist",
    },
    {
      id: "PAY-003",
      patientName: "Michael Brown",
      appointmentDate: "2024-01-17",
      serviceType: "Assessment",
      amount: 300.0,
      paymentMethod: "Cash",
      status: "Completed",
      transactionId: "TXN-2024-003",
      doctorName: "Dr. Prosper Matt",
      specialization: "Psychologist Specialist",
    },
    {
      id: "PAY-004",
      patientName: "Emily Davis",
      appointmentDate: "2024-01-18",
      serviceType: "Follow-up",
      amount: 120.0,
      paymentMethod: "Mobile Money",
      status: "Failed",
      transactionId: "TXN-2024-004",
      doctorName: "Dr. Prosper Matt",
      specialization: "Psychologist Specialist",
    },
    {
      id: "PAY-005",
      patientName: "David Wilson",
      appointmentDate: "2024-01-19",
      serviceType: "Consultation",
      amount: 150.0,
      paymentMethod: "Credit Card",
      status: "Completed",
      transactionId: "TXN-2024-005",
      doctorName: "Dr. Prosper Matt",
      specialization: "Psychologist Specialist",
    },
    {
      id: "PAY-006",
      patientName: "Lisa Anderson",
      appointmentDate: "2024-01-20",
      serviceType: "Therapy Session",
      amount: 200.0,
      paymentMethod: "Bank Transfer",
      status: "Pending",
      transactionId: "TXN-2024-006",
      doctorName: "Dr. Prosper Matt",
      specialization: "Psychologist Specialist",
    },
  ];

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      !selectedFilters.paymentStatus ||
      payment.status === selectedFilters.paymentStatus;

    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      Completed: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Failed: "bg-red-100 text-red-800",
      Refunded: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusClasses[status as keyof typeof statusClasses]
        }`}>
        {status}
      </span>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "Credit Card":
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case "Bank Transfer":
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case "Cash":
        return <DollarSign className="w-4 h-4 text-gray-600" />;
      case "Mobile Money":
        return <CreditCard className="w-4 h-4 text-purple-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Breadcrumb
          homeHref="/doctor"
          items={[
            { label: "Doctor", href: "/doctor" },
            { label: "Payment", href: "/doctor/payment" },
          ]}
        />
      </div>

      <Title title="Payment Management" />

      {/* Search and Filters */}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search payments..."
          />
        </div>

        <div className="flex gap-3">
          <select
            value={selectedFilters.paymentStatus}
            onChange={(e) =>
              setSelectedFilters({
                ...selectedFilters,
                paymentStatus: e.target.value as DoctorPaymentStatus | "",
              })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-[#44CE2D]">
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-[var(--card)] rounded-lg shadow-sm border border-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Transaction Id
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Actions
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
              {currentPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-[var(--muted)]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[var(--foreground)]">
                        {payment.patientName}
                      </div>
                      <div className="text-sm text-[var(--muted-foreground)]">
                        ID: {payment.id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-[var(--foreground)]">
                        {payment.serviceType}
                      </div>
                      <div className="text-sm text-[var(--muted-foreground)]">
                        {payment.specialization}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[var(--foreground)]">
                      ${payment.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                      <span className="text-sm text-[var(--foreground)]">
                        {payment.paymentMethod}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[var(--foreground)]">
                      {payment.transactionId}
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="text-[#44CE2D] hover:text-[#3bb025] transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-[var(--card)] px-4 py-3 flex items-center justify-between border-t border-[var(--border)] sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-[var(--border)] text-sm font-medium rounded-md text-[var(--foreground)] bg-[var(--card)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-[var(--border)] text-sm font-medium rounded-md text-[var(--foreground)] bg-[var(--card)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Showing <span className="font-medium">{startIndex + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(endIndex, filteredPayments.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredPayments.length}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "z-10 bg-[#44CE2D] border-[#44CE2D] text-white"
                            : "bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                        }`}>
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
