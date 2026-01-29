"use client";

import React, { useState, useEffect } from "react";
import { useSendPatientNotificationMutation } from "@/store/notificationApi";
import { useGetFirebaseBookingsQuery } from "@/store/bookingApi";
import { useGetFirebasePatientsQuery } from "@/store/patientApi";
import Textarea from "@/components/Textarea";
import {
	Bell,
	CheckCircle,
	AlertCircle,
	Info,
	X,
	Send,
	Users,
	Calendar,
	CreditCard,
	Plus
} from "lucide-react";
import { toast } from "sonner";
import Dropdown from "@/components/Dropdown";

interface NotificationTemplate {
	id: string;
	title: string;
	message: string;
	type: "info" | "warning" | "success" | "error";
	category: "appointment" | "payment" | "doctor_status" | "general";
}

interface Booking {
	id: string;
	doctorId: string;
	patientId: string;
	appointmentDate?: string;
	appointmentTime?: string;
	status?: string;
	createdAt?: string;
	updatedAt?: string;
	[key: string]: unknown; // Allow for additional Firebase fields
}

interface Patient {
	id: string; // Firebase document ID
	uid?: string; // User UID field (may be present in some documents)
	display_name?: string;
	first_name?: string;
	last_name?: string;
	email: string;
	role?: string;
	phone_number?: string;
	address?: string;
	location?: string;
	date_of_birth?: string;
	isActive?: boolean;
	createdTime?: string;
}

interface NotificationSystemProps {
	doctorId?: string;
	isOpen: boolean;
	onClose: () => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
	doctorId,
	isOpen,
	onClose
}) => {
	const [selectedTemplate, setSelectedTemplate] = useState<string>("");
	const [customMessage, setCustomMessage] = useState("");
	const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
	const [notificationType, setNotificationType] = useState<"template" | "custom">("template");
	const [selectedPatientToAdd, setSelectedPatientToAdd] = useState<string>("");

	const [sendNotification, { isLoading: sendingNotification }] = useSendPatientNotificationMutation();
	const { data: bookingsData } = useGetFirebaseBookingsQuery({});
	const { data: allPatientsData } = useGetFirebasePatientsQuery({});

	// Get affected patients from doctor's appointments
	const affectedPatients = React.useMemo(() => {
		if (!doctorId || !bookingsData) return [];

		const doctorBookings = bookingsData.filter(
			(booking: any) => booking.doctorId === doctorId
		);

		const uniquePatients = new Set<string>();
		doctorBookings.forEach((booking: any) => {
			if (booking.patientId) {
				uniquePatients.add(booking.patientId);
			}
		});

		return Array.from(uniquePatients);
	}, [doctorId, bookingsData]);

	// Get all patients for dropdown
	const allPatients: Patient[] = React.useMemo(() => {
		if (!allPatientsData) return [];

		// Transform Firebase data to match Patient interface
		return allPatientsData.map((patientData: any) => ({
			id: patientData.id,
			uid: patientData.uid || patientData.id, // Use uid if available, fallback to id
			display_name: patientData.display_name,
			first_name: patientData.first_name,
			last_name: patientData.last_name,
			email: patientData.email,
			role: patientData.role,
			phone_number: patientData.phone_number,
			address: patientData.address,
			location: patientData.location,
			date_of_birth: patientData.date_of_birth,
			isActive: patientData.isActive,
			createdTime: patientData.createdTime
		}));
	}, [allPatientsData]);

	// Notification templates
	const notificationTemplates: NotificationTemplate[] = [
		{
			id: "doctor_deactivated",
			title: "Doctor Account Update",
			message: "Your doctor's account has been temporarily deactivated. Your upcoming appointments will be automatically refunded and you'll receive a notification to reschedule.",
			type: "warning",
			category: "doctor_status"
		},
		{
			id: "doctor_reactivated",
			title: "Doctor Account Restored",
			message: "Your doctor's account has been reactivated. You can now book new appointments with them.",
			type: "success",
			category: "doctor_status"
		},
		{
			id: "appointment_refunded",
			title: "Appointment Refunded",
			message: "Your appointment has been cancelled and refunded due to doctor unavailability. Please book a new appointment with another doctor.",
			type: "info",
			category: "appointment"
		},
		{
			id: "appointment_restored",
			title: "Appointment Restored",
			message: "Your previously cancelled appointment has been restored. Please check your appointment details.",
			type: "success",
			category: "appointment"
		},
		{
			id: "payment_refunded",
			title: "Payment Refunded",
			message: "Your payment has been refunded due to appointment cancellation. The refund will be processed within 3-5 business days.",
			type: "info",
			category: "payment"
		},
		{
			id: "general_update",
			title: "System Update",
			message: "We have important updates regarding our services. Please check your account for the latest information.",
			type: "info",
			category: "general"
		}
	];

	// Handle sending notification
	const handleSendNotification = async () => {
		if (selectedPatients.length === 0) {
			toast.error("Please select at least one patient", {
				description: "You need to select patients before sending notifications."
			});
			return;
		}

		let title = "";
		let message = "";
		let type: "info" | "warning" | "success" | "error" = "info";

		if (notificationType === "template") {
			const template = notificationTemplates.find(t => t.id === selectedTemplate);
			if (!template) {
				toast.error("Please select a notification template", {
					description: "Choose a template from the available options."
				});
				return;
			}
			title = template.title;
			message = template.message;
			type = template.type;
		} else {
			if (!customMessage.trim()) {
				toast.error("Please enter a custom message", {
					description: "Write your notification message before sending."
				});
				return;
			}
			title = "Important Notification";
			message = customMessage;
			type = "info";
		}

		try {
			await sendNotification({
				patientIds: selectedPatients,
				title,
				message,
				type,
				relatedData: {
					doctorId,
					templateId: selectedTemplate,
					sentAt: new Date().toISOString(),
					sentBy: "admin" // TODO: Get from auth context
				}
			}).unwrap();

			toast.success("Notifications sent successfully!", {
				description: `Sent to ${selectedPatients.length} patient(s)`,
				duration: 4000
			});

			// Reset form
			setSelectedPatients([]);
			setSelectedTemplate("");
			setCustomMessage("");
			onClose();
		} catch (error) {
			console.error("Failed to send notification:", error);
			toast.error("Failed to send notification", {
				description: error instanceof Error ? error.message : "Please try again.",
				duration: 5000
			});
		}
	};

	// Auto-select affected patients when doctor is provided
	useEffect(() => {
		if (doctorId && affectedPatients.length > 0) {
			setSelectedPatients(affectedPatients);
		}
	}, [doctorId, affectedPatients]);

	// Handle adding patient from dropdown
	const handleAddPatient = () => {
		if (selectedPatientToAdd && !selectedPatients.includes(selectedPatientToAdd)) {
			setSelectedPatients([...selectedPatients, selectedPatientToAdd]);
			setSelectedPatientToAdd(""); // Reset dropdown
		}
	};

	if (!isOpen) return null;

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "success":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "warning":
				return <AlertCircle className="h-4 w-4 text-yellow-500" />;
			case "error":
				return <AlertCircle className="h-4 w-4 text-red-500" />;
			default:
				return <Info className="h-4 w-4 text-blue-500" />;
		}
	};

	const getTypeBadge = (type: string) => {
		const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

		switch (type) {
			case "success":
				return <span className={`${baseClasses} bg-green-100 text-green-800`}>Success</span>;
			case "warning":
				return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Warning</span>;
			case "error":
				return <span className={`${baseClasses} bg-red-100 text-red-800`}>Error</span>;
			default:
				return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Info</span>;
		}
	};

	const getPatientDisplayName = (patientId: string) => {
		const patient = allPatients.find(p => p.id === patientId || p.uid === patientId);
		if (patient) {
			return patient.display_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.email;
		}
		return patientId;
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-[16px] md:text-[18px] font-semibold text-gray-900 flex items-center">
						<Bell className="h-6 w-6 mr-2 text-blue-600" />
						Send Patient Notifications
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<X className="h-6 w-6" />
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Left Column - Notification Setup */}
					<div className="space-y-6">
						{/* Notification Type */}
						<div>
							<label className="block  text-[10px]  md:text-[12px] font-medium text-gray-700 mb-3">
								Notification Type
							</label>
							<div className="flex space-x-4">
								<button
									onClick={() => setNotificationType("template")}
									className={`px-4 py-2 rounded-lg border ${notificationType === "template"
										? "border-blue-500 bg-blue-50 text-blue-700"
										: "border-gray-300 text-gray-700 hover:bg-gray-50"
										}`}
								>
									Use Template
								</button>
								<button
									onClick={() => setNotificationType("custom")}
									className={`px-4 py-2 rounded-lg border ${notificationType === "custom"
										? "border-blue-500 bg-blue-50 text-blue-700"
										: "border-gray-300 text-gray-700 hover:bg-gray-50"
										}`}
								>
									Custom Message
								</button>
							</div>
						</div>

						{/* Template Selection */}
						{notificationType === "template" && (
							<div>
								<label className="block  text-[10px]  md:text-[12px] font-medium text-gray-700 mb-3">
									Select Template
								</label>
								<div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
									{notificationTemplates.map((template) => (
										<div
											key={template.id}
											onClick={() => setSelectedTemplate(template.id)}
											className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedTemplate === template.id
												? "border-blue-500 bg-blue-50"
												: "border-gray-200 hover:bg-gray-50"
												}`}
										>
											<div className="flex items-start justify-between mb-2">
												<div className="flex items-center">
													{getTypeIcon(template.type)}
													<span className="ml-2 font-medium text-gray-900">
														{template.title}
													</span>
												</div>
												{getTypeBadge(template.type)}
											</div>
											<p className=" text-[10px]  md:text-[12px] text-gray-600 line-clamp-2">
												{template.message}
											</p>
											<div className="mt-2">
												<span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
													{template.category}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Custom Message */}
						{notificationType === "custom" && (
							<div>
								<label className="block  text-[10px]  md:text-[12px] font-medium text-gray-700 mb-2">
									Custom Message
								</label>
								<Textarea
									value={customMessage}
									onChange={(e) => setCustomMessage(e.target.value)}
									placeholder="Enter your custom notification message..."
									fullWidth
									rows={4}
								/>
							</div>
						)}

						{/* Patient Selection */}
						<div>
							<label className="block  text-[10px]  md:text-[12px] font-medium text-gray-700 mb-3">
								Select Patients ({selectedPatients.length} selected)
							</label>

							{doctorId && affectedPatients.length > 0 && (
								<div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
									<div className="flex items-center">
										<Users className="h-4 w-4 text-blue-600 mr-2" />
										<span className=" text-[10px]  md:text-[12px] text-blue-800">
											{affectedPatients.length} patients affected by doctor actions
										</span>
										<button
											onClick={() => setSelectedPatients(affectedPatients)}
											className="ml-auto  text-[10px]  md:text-[12px] text-blue-600 hover:text-blue-800"
										>
											Select All Affected
										</button>
									</div>
								</div>
							)}

							{/* Multi-select dropdown */}
							<div className="relative">
								<Dropdown
									multiple
									value={selectedPatients}
									onChange={(value) => setSelectedPatients(value as string[])}
									options={allPatients.length > 0 ? allPatients.map((patient) => ({
										value: patient.id,
										label: `${patient.display_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.email} (${patient.email})`
									})) : []}
									placeholder={allPatients.length > 0 ? "Select patients..." : "Loading patients..."}
									className="w-full"
									variant="default"
									disabled={allPatients.length === 0}
								/>
							</div>

							{/* Add Patient Dropdown */}
							<div className="mt-4">
								<label className="block  text-[10px]  md:text-[12px] font-medium text-gray-700 mb-2">
									Add Patient
								</label>
								<div className="flex gap-2">
									<Dropdown
										value={selectedPatientToAdd}
										onChange={(value) => setSelectedPatientToAdd(value)}
										options={[
											{ value: "", label: "Select a patient to add..." },
											...allPatients
												.filter(patient => !selectedPatients.includes(patient.id))
												.map((patient) => ({
													value: patient.id,
													label: `${patient.display_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.email} (${patient.email})`
												}))
										]}
										placeholder="Select a patient to add..."
										className="flex-1"
										variant="default"
									/>
									<button
										type="button"
										onClick={handleAddPatient}
										disabled={!selectedPatientToAdd}
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
									>
										<Plus className="h-4 w-4 mr-1" />
										Add
									</button>
								</div>
							</div>

							{/* Selected patients display */}
							<div className="mt-3">
								<div className="flex flex-wrap gap-2">
									{selectedPatients.map((patientId) => (
										<span
											key={patientId}
											className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
										>
											{getPatientDisplayName(patientId)}
											<button
												onClick={() => setSelectedPatients(selectedPatients.filter(id => id !== patientId))}
												className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
											>
												<X className="h-3 w-3" />
											</button>
										</span>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Right Column - Preview */}
					<div className="space-y-6">
						<div>
							<h4 className="text-[14px] md:text-[16px] font-medium text-gray-900 mb-4">Preview</h4>

							<div className="bg-gray-50 rounded-lg p-4">
								{notificationType === "template" && selectedTemplate ? (
									(() => {
										const template = notificationTemplates.find(t => t.id === selectedTemplate);
										if (!template) return null;

										return (
											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<h5 className="font-medium text-gray-900">{template.title}</h5>
													{getTypeBadge(template.type)}
												</div>
												<p className=" text-[10px]  md:text-[12px] text-gray-600">{template.message}</p>
												<div className="text-xs text-gray-500">
													Category: {template.category}
												</div>
											</div>
										);
									})()
								) : notificationType === "custom" && customMessage ? (
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<h5 className="font-medium text-gray-900">Important Notification</h5>
											{getTypeBadge("info")}
										</div>
										<p className=" text-[10px]  md:text-[12px] text-gray-600">{customMessage}</p>
									</div>
								) : (
									<div className="text-center py-8 text-gray-500">
										<Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
										<p>Select a template or enter custom message to preview</p>
									</div>
								)}
							</div>
						</div>

						{/* Send Button */}
						<div className="flex justify-end space-x-3">
							<button
								onClick={onClose}
								className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleSendNotification}
								disabled={sendingNotification || selectedPatients.length === 0}
								className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
							>
								{sendingNotification ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Sending...
									</>
								) : (
									<>
										<Send className="h-4 w-4 mr-2" />
										Send to {selectedPatients.length} Patient(s)
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotificationSystem;
