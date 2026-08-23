"use client";

import React, { useState, useEffect } from "react";
import {
	useGetFirebaseDoctorProfilesQuery,
	useGetAuditLogsQuery,
	useBulkUpdateDoctorStatusMutation,
	useExportDoctorDataQuery,
	useVerifyDoctorDataQuery,
} from "@/store/doctorFirebaseApi";
import { useSendPatientNotificationMutation } from "@/store/notificationApi";
import {
	Shield,
	Users,
	Activity,
	CheckCircle,
	AlertCircle,
	Filter,
	Search,
	UserCheck,
	UserX,
} from "lucide-react";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Dropdown from "@/components/Dropdown";
import Button from "@/components/Button";
import { DataExportModal, DataVerificationModal } from "@/components/modals";
import AuditLogsPanel, { AuditLogEntry } from "@/components/AuditLogsPanel";
import DoctorAccountsTable, { DoctorAccount as DoctorData } from "@/components/DoctorAccountsTable";
import NotificationSystem from "@/components/notifications/NotificationSystem";
import EmailNotificationSystem from "@/components/notifications/EmailNotificationSystem";

const DoctorAccountManagementPage = () => {
	const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
	const [showBulkActions, setShowBulkActions] = useState(false);
	const [selectedDoctor, setSelectedDoctor] = useState<DoctorData | null>(null);
	const [showAuditLogs, setShowAuditLogs] = useState(false);
	const [showDataExport, setShowDataExport] = useState(false);
	const [showDataVerification, setShowDataVerification] = useState(false);
	const [bulkActionReason, setBulkActionReason] = useState("");
	const [showNotificationSystem, setShowNotificationSystem] = useState(false);
	const [showEmailNotification, setShowEmailNotification] = useState(false);
	const [selectedDoctorForNotification, setSelectedDoctorForNotification] = useState<DoctorData | null>(null);

	// API hooks
	const { data: doctorsData, isLoading: doctorsLoading, error: doctorsError } = useGetFirebaseDoctorProfilesQuery({});
	const { data: auditLogs, isLoading: auditLogsLoading } = useGetAuditLogsQuery({ limit: 100 });
	const [bulkUpdateStatus, { isLoading: bulkUpdateLoading }] = useBulkUpdateDoctorStatusMutation();
	const [sendNotification, { isLoading: notificationLoading }] = useSendPatientNotificationMutation();
	const { data: exportData, isLoading: exportLoading, refetch: refetchExport } = useExportDoctorDataQuery(
		selectedDoctor?.uid || "",
		{ skip: !selectedDoctor?.uid || !showDataExport }
	);
	// Gated on showDataVerification, not just on a selected doctor: the export
	// action selects a doctor too, so an ungated query used to resolve and pop
	// the verification modal open on top of the export one.
	const { data: verificationData, isLoading: verificationLoading, refetch: refetchVerification } = useVerifyDoctorDataQuery(
		selectedDoctor?.uid || "",
		{ skip: !selectedDoctor?.uid || !showDataVerification }
	);

	// Filter doctors based on search and status
	const filteredDoctors = React.useMemo(() => {
		if (!doctorsData) return [];

		return (doctorsData as unknown as DoctorData[]).filter((doctor: DoctorData) => {
			const matchesSearch = !searchTerm ||
				doctor.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus = statusFilter === "all" ||
				(statusFilter === "active" && doctor.isActive) ||
				(statusFilter === "inactive" && !doctor.isActive);

			return matchesSearch && matchesStatus;
		});
	}, [doctorsData, searchTerm, statusFilter]);

	// Handle bulk operations
	const handleBulkStatusUpdate = async (status: "active" | "inactive") => {
		if (selectedDoctors.length === 0) return;

		try {
			await bulkUpdateStatus({
				doctorIds: selectedDoctors,
				status,
				reason: bulkActionReason,
				performedBy: "admin", // TODO: Get from auth context
			}).unwrap();

			// Send notifications to affected patients
			if (status === "inactive") {
				// Get patient IDs from appointments of deactivated doctors
				// This would need to be implemented based on your appointment structure
				const patientIds: string[] = []; // TODO: Fetch actual patient IDs

				if (patientIds.length > 0) {
					await sendNotification({
						patientIds,
						title: "Doctor Account Update",
						message: `Your doctor's account has been deactivated. Your appointments will be refunded.`,
						type: "warning",
						relatedData: { action: "doctor_deactivated", doctorIds: selectedDoctors }
					}).unwrap();
				}
			}

			setSelectedDoctors([]);
			setBulkActionReason("");
			setShowBulkActions(false);
		} catch (error) {
			console.error("Bulk update failed:", error);
		}
	};

	// Handle data export
	const handleDataExport = async (doctorId: string) => {
		setSelectedDoctor((doctorsData as unknown as DoctorData[])?.find((d: DoctorData) => d.uid === doctorId) || null);
		setShowDataExport(true);
		await refetchExport();
	};

	// Handle data verification
	const handleDataVerification = async (doctorId: string) => {
		setSelectedDoctor((doctorsData as unknown as DoctorData[])?.find((d: DoctorData) => d.uid === doctorId) || null);
		setShowDataVerification(true);
		await refetchVerification();
	};

	// Handle notification system
	const handleOpenNotificationSystem = (doctorId: string) => {
		const doctor = (doctorsData as unknown as DoctorData[])?.find((d: DoctorData) => d.uid === doctorId);
		setSelectedDoctorForNotification(doctor || null);
		setShowNotificationSystem(true);
	};

	// Handle email notification
	const handleOpenEmailNotification = (doctorId: string, actionType?: "deactivated" | "reactivated") => {
		const doctor = (doctorsData as unknown as DoctorData[])?.find((d: DoctorData) => d.uid === doctorId);
		setSelectedDoctorForNotification(doctor || null);
		setShowEmailNotification(true);
	};

	if (doctorsLoading) {
		return (
			<div className="min-h-screen bg-gray-50 p-6">
				<div className="max-w-7xl mx-auto">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
						<div className="bg-white rounded-lg shadow p-6">
							<div className="space-y-4">
								{[...Array(5)].map((_, i) => (
									<div key={i} className="h-16 bg-gray-200 rounded"></div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-[20px] md:text-[24px] font-bold text-gray-900 flex items-center">
						<Shield className="h-8 w-8 mr-3 text-blue-600" />
						Doctor Account Management
					</h1>
					<p className="text-gray-600 mt-2">
						Manage doctor account status, audit logs, and data operations
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<Users className="h-8 w-8 text-blue-600" />
							<div className="ml-4">
								<p className="text-[10px] md:text-[12px] font-medium text-gray-600">Total Doctors</p>
								<p className="text-[18px] md:text-[20px] font-bold text-gray-900">{doctorsData?.length || 0}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<CheckCircle className="h-8 w-8 text-green-600" />
							<div className="ml-4">
								<p className="text-[10px] md:text-[12px] font-medium text-gray-600">Active Doctors</p>
								<p className="text-[18px] md:text-[20px] font-bold text-gray-900">
									{(doctorsData as unknown as DoctorData[])?.filter((d: DoctorData) => d.isActive).length || 0}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<AlertCircle className="h-8 w-8 text-red-600" />
							<div className="ml-4">
								<p className="text-[10px] md:text-[12px] font-medium text-gray-600">Inactive Doctors</p>
								<p className="text-[18px] md:text-[20px] font-bold text-gray-900">
									{(doctorsData as unknown as DoctorData[])?.filter((d: DoctorData) => !d.isActive).length || 0}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center">
							<Activity className="h-8 w-8 text-purple-600" />
							<div className="ml-4">
								<p className="text-[10px] md:text-[12px] font-medium text-gray-600">Recent Actions</p>
								<p className="text-[18px] md:text-[20px] font-bold text-gray-900">{auditLogs?.length || 0}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Filters and Search */}
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1">
							<div className="relative">
								<Input
									type="text"
									placeholder="Search doctors by name, email, or specialization..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									icon={<Search className="text-gray-400 h-4 w-4" />}
									fullWidth
								/>
							</div>
						</div>

						<div className="flex gap-2">
							<Dropdown
								value={statusFilter}
								onChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}
								options={[
									{ value: "all", label: "All Status" },
									{ value: "active", label: "Active Only" },
									{ value: "inactive", label: "Inactive Only" },
								]}
								placeholder="All Status"
								className="w-40"
								variant="default"
							/>

							<Button
								onClick={() => setShowAuditLogs(!showAuditLogs)}
								className="bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
								icon={<Filter className="h-4 w-4" />}
							>
								Audit Logs
							</Button>
						</div>
					</div>
				</div>

				{/* Bulk Actions */}
				{selectedDoctors.length > 0 && (
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
						<div className="flex items-center justify-between">
							<p className="text-blue-800">
								{selectedDoctors.length} doctor(s) selected
							</p>
							<div className="flex gap-2">
								<Button
									onClick={() => setShowBulkActions(!showBulkActions)}
									className="bg-blue-600 text-white hover:bg-blue-700 border-none"
								>
									Bulk Actions
								</Button>
								<Button
									onClick={() => setSelectedDoctors([])}
									className="bg-gray-200 text-gray-700 hover:bg-gray-300 border-none"
								>
									Clear Selection
								</Button>
							</div>
						</div>

						{showBulkActions && (
							<div className="mt-4 p-4 bg-white rounded-lg border">
								<div className="mb-4">
									<label className="block text-[10px] md:text-[12px] font-medium text-gray-700 mb-2">
										Reason for action (required)
									</label>
									<Textarea
										value={bulkActionReason}
										onChange={(e) => setBulkActionReason(e.target.value)}
										placeholder="Enter reason for bulk action..."
										rows={2}
									/>
								</div>

								<div className="flex gap-2">
									<Button
										onClick={() => handleBulkStatusUpdate("inactive")}
										disabled={!bulkActionReason || bulkUpdateLoading}
										className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 border-none"
										icon={<UserX className="h-4 w-4" />}
									>
										Deactivate Selected
									</Button>
									<Button
										onClick={() => handleBulkStatusUpdate("active")}
										disabled={!bulkActionReason || bulkUpdateLoading}
										className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 border-none"
										icon={<UserCheck className="h-4 w-4" />}
									>
										Reactivate Selected
									</Button>
								</div>
							</div>
						)}
					</div>
				)}

				<DoctorAccountsTable
					doctors={filteredDoctors}
					selectedDoctors={selectedDoctors}
					onSelectionChange={setSelectedDoctors}
					onVerifyData={handleDataVerification}
					onExportData={handleDataExport}
					onSendNotification={handleOpenNotificationSystem}
					onSendEmail={handleOpenEmailNotification}
					isLoading={doctorsLoading}
				/>

				<DataVerificationModal
					isOpen={showDataVerification}
					onClose={() => setShowDataVerification(false)}
					verificationData={verificationData}
					subjectName={selectedDoctor?.display_name}
					isLoading={verificationLoading}
				/>

				<DataExportModal
					isOpen={showDataExport}
					onClose={() => setShowDataExport(false)}
					exportData={exportData}
					subjectName={selectedDoctor?.display_name}
					subjectId={selectedDoctor?.uid}
					isLoading={exportLoading}
				/>

				<AuditLogsPanel
					isOpen={showAuditLogs}
					logs={auditLogs as unknown as AuditLogEntry[]}
					isLoading={auditLogsLoading}
				/>

				{/* Notification System */}
				<NotificationSystem
					doctorId={selectedDoctorForNotification?.uid}
					isOpen={showNotificationSystem}
					onClose={() => {
						setShowNotificationSystem(false);
						setSelectedDoctorForNotification(null);
					}}
				/>

				{/* Email Notification System */}
				<EmailNotificationSystem
					doctorId={selectedDoctorForNotification?.uid}
					doctorName={selectedDoctorForNotification?.display_name}
					doctorEmail={selectedDoctorForNotification?.email}
					isOpen={showEmailNotification}
					onClose={() => {
						setShowEmailNotification(false);
						setSelectedDoctorForNotification(null);
					}}
					actionType={selectedDoctorForNotification?.isActive ? "reactivated" : "deactivated"}
				/>
			</div>
		</div>
	);
};

export default DoctorAccountManagementPage;
