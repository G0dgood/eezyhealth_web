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
	Download,
	Send,
	CheckCircle,
	AlertCircle,
	Eye,
	Trash2,
	RefreshCw,
	Filter,
	Search,
	MoreHorizontal,
	Calendar,
	Clock,
	UserCheck,
	UserX,
	Bell,
	Mail
} from "lucide-react";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Dropdown from "@/components/Dropdown";
import Button from "@/components/Button";
import NotificationSystem from "@/components/notifications/NotificationSystem";
import EmailNotificationSystem from "@/components/notifications/EmailNotificationSystem";

interface DoctorData {
	uid: string;
	email: string;
	display_name?: string;
	first_name?: string;
	last_name?: string;
	specialization?: string;
	hospital?: string;
	isActive?: boolean;
	deactivatedAt?: string;
	deactivationReason?: string;
	reactivatedAt?: string;
	reactivatedBy?: string;
	createdTime?: string;
}

interface AuditLog {
	id: string;
	action: string;
	targetId: string;
	performedBy: string;
	reason?: string;
	timestamp: string;
	details?: any;
}

const DoctorAccountManagementPage = () => {
	const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
	const [showBulkActions, setShowBulkActions] = useState(false);
	const [selectedDoctor, setSelectedDoctor] = useState<DoctorData | null>(null);
	const [showAuditLogs, setShowAuditLogs] = useState(false);
	const [showDataExport, setShowDataExport] = useState(false);
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
	const { data: verificationData, isLoading: verificationLoading, refetch: refetchVerification } = useVerifyDoctorDataQuery(
		selectedDoctor?.uid || "",
		{ skip: !selectedDoctor?.uid }
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

	// Download export data as JSON
	const downloadExportData = () => {
		if (!exportData) return;

		const dataStr = JSON.stringify(exportData, null, 2);
		const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

		const exportFileDefaultName = `doctor_${selectedDoctor?.uid}_export_${new Date().toISOString().split('T')[0]}.json`;

		const linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();
	};

	const getStatusBadge = (isActive?: boolean) => {
		if (isActive) {
			return (
				<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
					<CheckCircle className="w-3 h-3 mr-1" />
					Active
				</span>
			);
		}
		return (
			<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
				<AlertCircle className="w-3 h-3 mr-1" />
				Inactive
			</span>
		);
	};

	const getActionBadge = (action: string) => {
		const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

		switch (action) {
			case "doctor_deactivated":
				return (
					<span className={`${baseClasses} bg-red-100 text-red-800 border border-red-300`}>
						<UserX className="w-3 h-3 mr-1" />
						Deactivated
					</span>
				);
			case "doctor_reactivated":
				return (
					<span className={`${baseClasses} bg-green-100 text-green-800 border border-green-300`}>
						<UserCheck className="w-3 h-3 mr-1" />
						Reactivated
					</span>
				);
			default:
				return (
					<span className={`${baseClasses} bg-gray-100 text-gray-800 border border-gray-300`}>
						{action}
					</span>
				);
		}
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

				{/* Doctors Table */}
				<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
					<div className="px-6 py-4 border-b border-gray-200">
						<h3 className="text-[14px] md:text-[16px] font-medium text-gray-900">Doctor Accounts</h3>
					</div>

					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left">
										<Input
											type="checkbox"
											checked={selectedDoctors.length === filteredDoctors.length && filteredDoctors.length > 0}
											onChange={(e) => {
												if (e.target.checked) {
													setSelectedDoctors(filteredDoctors.map((d: DoctorData) => d.uid));
												} else {
													setSelectedDoctors([]);
												}
											}}
											fullWidth={false}
										/>
									</th>
									<th >
										Doctor
									</th>
									<th >
										Specialization
									</th>
									<th >
										Status
									</th>
									<th >
										Last Updated
									</th>
									<th >
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredDoctors.map((doctor: DoctorData) => (
									<tr key={doctor.uid} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<Input
												type="checkbox"
												checked={selectedDoctors.includes(doctor.uid)}
												onChange={(e) => {
													if (e.target.checked) {
														setSelectedDoctors([...selectedDoctors, doctor.uid]);
													} else {
														setSelectedDoctors(selectedDoctors.filter(id => id !== doctor.uid));
													}
												}}
												fullWidth={false}
											/>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 h-10 w-10">
													<div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
														<span className="text-blue-600 font-medium">
															{doctor.display_name?.charAt(0) || doctor.email?.charAt(0) || "D"}
														</span>
													</div>
												</div>
												<div className="ml-4">
													<div className="text-[10px] md:text-[12px] font-medium text-gray-900">
														{doctor.display_name || `${doctor.first_name} ${doctor.last_name}` || "Unknown"}
													</div>
													<div className="text-[10px] md:text-[12px] text-gray-500">{doctor.email}</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-[10px] md:text-[12px] text-gray-900">{doctor.specialization || "N/A"}</div>
											<div className="text-[10px] md:text-[12px] text-gray-500">{doctor.hospital || "N/A"}</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{getStatusBadge(doctor.isActive)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-gray-500">
											{doctor.reactivatedAt ?
												`Reactivated: ${new Date(doctor.reactivatedAt).toLocaleDateString()}` :
												doctor.deactivatedAt ?
													`Deactivated: ${new Date(doctor.deactivatedAt).toLocaleDateString()}` :
													"Never"
											}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] font-medium">
											<div className="flex items-center space-x-2">
												<Button
													onClick={() => handleDataVerification(doctor.uid)}
													className="text-blue-600 hover:text-blue-900 bg-transparent hover:bg-transparent border-none p-1"
													title="Verify Data"
													icon={<Eye className="h-4 w-4" />}
													iconOnly
												/>
												<Button
													onClick={() => handleDataExport(doctor.uid)}
													className="text-green-600 hover:text-green-900 bg-transparent hover:bg-transparent border-none p-1"
													title="Export Data"
													icon={<Download className="h-4 w-4" />}
													iconOnly
												/>
												<Button
													onClick={() => handleOpenNotificationSystem(doctor.uid)}
													className="text-blue-600 hover:text-blue-900 bg-transparent hover:bg-transparent border-none p-1"
													title="Send Notifications"
													icon={<Bell className="h-4 w-4" />}
													iconOnly
												/>
												<Button
													onClick={() => handleOpenEmailNotification(doctor.uid, doctor.isActive ? "reactivated" : "deactivated")}
													className="text-purple-600 hover:text-purple-900 bg-transparent hover:bg-transparent border-none p-1"
													title="Send Email"
													icon={<Mail className="h-4 w-4" />}
													iconOnly
												/>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Data Verification Modal */}
				{selectedDoctor && verificationData && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-[14px] md:text-[16px] font-medium text-gray-900">
									Data Verification - {selectedDoctor.display_name}
								</h3>
								<Button
									onClick={() => setSelectedDoctor(null)}
									className="text-gray-400 hover:text-gray-600 bg-transparent hover:bg-transparent border-none p-1"
									icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>}
									iconOnly
								>
									<span className="sr-only">Close</span>
								</Button>
							</div>

							<div className="space-y-4">
								{Object.entries(verificationData.verification).map(([key, value]) => (
									<div key={key} className="flex items-center justify-between p-3 border rounded-lg">
										<span className="capitalize text-gray-700">{key.replace(/([A-Z])/g, ' $1')}</span>
										<div className="flex items-center">
											{value ? (
												<CheckCircle className="h-5 w-5 text-green-500 mr-2" />
											) : (
												<AlertCircle className="h-5 w-5 text-red-500 mr-2" />
											)}
											<span className={value ? "text-green-700" : "text-red-700"}>
												{value ? "Accessible" : "Not Accessible"}
											</span>
										</div>
									</div>
								))}

								<div className="mt-4 p-4 bg-gray-50 rounded-lg">
									<div className="flex items-center">
										<span className="font-medium text-gray-700 mr-2">Overall Status:</span>
										{verificationData.isFullyAccessible ? (
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
												<CheckCircle className="w-3 h-3 mr-1" />
												Fully Accessible
											</span>
										) : (
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
												<AlertCircle className="w-3 h-3 mr-1" />
												Issues Found
											</span>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Data Export Modal */}
				{showDataExport && exportData && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-[14px] md:text-[16px] font-medium text-gray-900">
									Data Export - {selectedDoctor?.display_name}
								</h3>
								<Button
									onClick={() => setShowDataExport(false)}
									className="text-gray-400 hover:text-gray-600 bg-transparent hover:bg-transparent border-none p-1"
									icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>}
									iconOnly
								>
									<span className="sr-only">Close</span>
								</Button>
							</div>

							<div className="space-y-4 mb-6">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<div className="bg-blue-50 p-3 rounded-lg">
										<p className="text-[10px] md:text-[12px] text-gray-600">Profile</p>
										<p className="text-[14px] md:text-[16px] font-semibold text-blue-600">
											{exportData.profile ? "1" : "0"}
										</p>
									</div>
									<div className="bg-green-50 p-3 rounded-lg">
										<p className="text-[10px] md:text-[12px] text-gray-600">Appointments</p>
										<p className="text-[14px] md:text-[16px] font-semibold text-green-600">
											{exportData.appointments?.length || 0}
										</p>
									</div>
									<div className="bg-purple-50 p-3 rounded-lg">
										<p className="text-[10px] md:text-[12px] text-gray-600">Documents</p>
										<p className="text-[14px] md:text-[16px] font-semibold text-purple-600">
											{exportData.documents?.length || 0}
										</p>
									</div>
									<div className="bg-orange-50 p-3 rounded-lg">
										<p className="text-[10px] md:text-[12px] text-gray-600">Analytics</p>
										<p className="text-[14px] md:text-[16px] font-semibold text-orange-600">
											{exportData.analytics?.length || 0}
										</p>
									</div>
								</div>
							</div>

							<div className="flex justify-end">
								<Button
									onClick={downloadExportData}
									className="bg-blue-600 text-white hover:bg-blue-700 border-none"
									icon={<Download className="h-4 w-4" />}
								>
									Download JSON
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Audit Logs Panel */}
				{showAuditLogs && (
					<div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-200">
							<h3 className="text-[14px] md:text-[16px] font-medium text-gray-900">Recent Audit Logs</h3>
						</div>

						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th >
											Action
										</th>
										<th >
											Target
										</th>
										<th >
											Performed By
										</th>
										<th >
											Reason
										</th>
										<th >
											Timestamp
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{(auditLogs as unknown as AuditLog[])?.map((log: AuditLog) => (
										<tr key={log.id}>
											<td className="px-6 py-4 whitespace-nowrap">
												{getActionBadge(log.action)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-gray-900">
												{log.targetId}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-gray-900">
												{log.performedBy}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-gray-500">
												{log.reason || "N/A"}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-[10px] md:text-[12px] text-gray-500">
												<div className="flex items-center">
													<Clock className="h-4 w-4 mr-1 text-gray-400" />
													{new Date(log.timestamp).toLocaleString()}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

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
