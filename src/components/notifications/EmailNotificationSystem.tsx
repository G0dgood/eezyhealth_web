"use client";

import React, { useState } from "react";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import {
	Mail,
	Send,
	CheckCircle,
	AlertCircle,
	Info,
	X,
	User,
	Calendar,
	Shield,
	Clock
} from "lucide-react";

interface EmailTemplate {
	id: string;
	subject: string;
	template: string;
	type: "deactivation" | "reactivation" | "status_change" | "security_alert";
	variables: string[];
}

interface EmailNotificationSystemProps {
	doctorId?: string;
	doctorName?: string;
	doctorEmail?: string;
	isOpen: boolean;
	onClose: () => void;
	actionType?: "deactivated" | "reactivated";
}

const EmailNotificationSystem: React.FC<EmailNotificationSystemProps> = ({
	doctorId,
	doctorName,
	doctorEmail,
	isOpen,
	onClose,
	actionType
}) => {
	const [selectedTemplate, setSelectedTemplate] = useState<string>("");
	const [customSubject, setCustomSubject] = useState("");
	const [customContent, setCustomContent] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	// Email templates
	const emailTemplates: EmailTemplate[] = [
		{
			id: "doctor_deactivated",
			subject: "Account Deactivation Notice - EezyHealth",
			template: `
Dear Dr. {{doctorName}},

We are writing to inform you that your EezyHealth account has been temporarily deactivated.

**Account Details:**
- Doctor ID: {{doctorId}}
- Email: {{doctorEmail}}
- Deactivation Date: {{deactivationDate}}
- Reason: {{deactivationReason}}

**What this means:**
- Your profile is temporarily unavailable to patients
- All pending appointments have been cancelled and refunded
- You will not receive new appointment bookings
- Your account data remains secure and intact

**Next Steps:**
If you believe this deactivation was made in error, please contact our support team immediately at support@eezyhealth.com or call +1-800-EEZY-HELP.

**Support Information:**
- Email: support@eezyhealth.com
- Phone: +1-800-EEZY-HELP
- Hours: Monday-Friday, 9 AM - 6 PM EST

We appreciate your understanding and look forward to resolving this matter promptly.

Best regards,
EezyHealth Support Team
      `,
			type: "deactivation",
			variables: ["doctorName", "doctorId", "doctorEmail", "deactivationDate", "deactivationReason"]
		},
		{
			id: "doctor_reactivated",
			subject: "Account Reactivated - Welcome Back to EezyHealth",
			template: `
Dear Dr. {{doctorName}},

Great news! Your EezyHealth account has been successfully reactivated.

**Account Details:**
- Doctor ID: {{doctorId}}
- Email: {{doctorEmail}}
- Reactivation Date: {{reactivationDate}}

**Your account is now fully operational:**
✅ Your profile is visible to patients
✅ You can receive new appointment bookings
✅ All your previous appointments have been restored
✅ Your availability schedule is active

**Important Notes:**
- Please verify your availability schedule is up to date
- Review any new appointment requests in your dashboard
- Update your profile information if needed

**Need Help?**
If you have any questions or need assistance getting back up to speed, our support team is here to help:
- Email: support@eezyhealth.com
- Phone: +1-800-EEZY-HELP

Welcome back to the EezyHealth community!

Best regards,
EezyHealth Support Team
      `,
			type: "reactivation",
			variables: ["doctorName", "doctorId", "doctorEmail", "reactivationDate"]
		},
		{
			id: "status_change",
			subject: "Account Status Update - EezyHealth",
			template: `
Dear Dr. {{doctorName}},

This is to inform you of a recent change to your EezyHealth account status.

**Account Details:**
- Doctor ID: {{doctorId}}
- Email: {{doctorEmail}}
- Status Change Date: {{changeDate}}
- Previous Status: {{previousStatus}}
- New Status: {{newStatus}}

**What this means:**
{{statusExplanation}}

**Next Steps:**
{{nextSteps}}

If you have any questions about this change, please contact our support team:
- Email: support@eezyhealth.com
- Phone: +1-800-EEZY-HELP

Best regards,
EezyHealth Support Team
      `,
			type: "status_change",
			variables: ["doctorName", "doctorId", "doctorEmail", "changeDate", "previousStatus", "newStatus", "statusExplanation", "nextSteps"]
		},
		{
			id: "security_alert",
			subject: "Security Alert - EezyHealth Account",
			template: `
Dear Dr. {{doctorName}},

We are writing to inform you of a security-related action taken on your EezyHealth account.

**Account Details:**
- Doctor ID: {{doctorId}}
- Email: {{doctorEmail}}
- Alert Date: {{alertDate}}
- Action Taken: {{securityAction}}

**Security Information:**
{{securityDetails}}

**Important Security Reminders:**
- Never share your login credentials
- Use strong, unique passwords
- Enable two-factor authentication if available
- Log out from shared computers
- Report any suspicious activity immediately

**If you did not authorize this action:**
Please contact our security team immediately at security@eezyhealth.com or call our emergency line at +1-800-SECURITY.

**Support Contacts:**
- General Support: support@eezyhealth.com
- Security Team: security@eezyhealth.com
- Emergency Line: +1-800-SECURITY

Best regards,
EezyHealth Security Team
      `,
			type: "security_alert",
			variables: ["doctorName", "doctorId", "doctorEmail", "alertDate", "securityAction", "securityDetails"]
		}
	];

	// Auto-select template based on action type
	React.useEffect(() => {
		if (actionType === "deactivated") {
			setSelectedTemplate("doctor_deactivated");
		} else if (actionType === "reactivated") {
			setSelectedTemplate("doctor_reactivated");
		}
	}, [actionType]);

	// Process template with variables
	const processTemplate = (template: string, variables: Record<string, string>) => {
		let processedTemplate = template;
		Object.entries(variables).forEach(([key, value]) => {
			const regex = new RegExp(`{{${key}}}`, 'g');
			processedTemplate = processedTemplate.replace(regex, value);
		});
		return processedTemplate.trim();
	};

	// Handle sending email
	const handleSendEmail = async () => {
		if (!doctorEmail) {
			alert("Doctor email is required");
			return;
		}

		setIsSending(true);

		try {
			// Simulate email sending - in real implementation, this would call an API
			await new Promise(resolve => setTimeout(resolve, 2000));

			let emailData;

			if (selectedTemplate) {
				const template = emailTemplates.find(t => t.id === selectedTemplate);
				if (!template) throw new Error("Template not found");

				const variables: Record<string, string> = {
					doctorName: doctorName || "Doctor",
					doctorId: doctorId || "N/A",
					doctorEmail: doctorEmail,
					deactivationDate: new Date().toLocaleDateString(),
					reactivationDate: new Date().toLocaleDateString(),
					changeDate: new Date().toLocaleDateString(),
					alertDate: new Date().toLocaleDateString(),
					deactivationReason: "Administrative action",
					previousStatus: "Active",
					newStatus: actionType === "deactivated" ? "Inactive" : "Active",
					statusExplanation: actionType === "deactivated"
						? "Your account has been temporarily deactivated and is not accessible to patients."
						: "Your account has been reactivated and is now fully operational.",
					nextSteps: actionType === "deactivated"
						? "Please contact support if you believe this was an error."
						: "Please verify your profile and availability settings.",
					securityAction: "Account status change",
					securityDetails: "Your account status has been modified by an administrator."
				};

				emailData = {
					to: doctorEmail,
					subject: template.subject,
					content: processTemplate(template.template, variables),
					template: template.id,
					variables
				};
			} else {
				emailData = {
					to: doctorEmail,
					subject: customSubject,
					content: customContent,
					template: "custom"
				};
			}

			// TODO: Implement actual email sending API call


			setEmailSent(true);
			setTimeout(() => {
				setEmailSent(false);
				onClose();
			}, 2000);

		} catch (error) {
			console.error("Failed to send email:", error);
			alert("Failed to send email. Please try again.");
		} finally {
			setIsSending(false);
		}
	};

	if (!isOpen) return null;

	const selectedTemplateData = emailTemplates.find(t => t.id === selectedTemplate);

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "deactivation":
				return <AlertCircle className="h-5 w-5 text-red-500" />;
			case "reactivation":
				return <CheckCircle className="h-5 w-5 text-green-500" />;
			case "status_change":
				return <Info className="h-5 w-5 text-blue-500" />;
			case "security_alert":
				return <Shield className="h-5 w-5 text-orange-500" />;
			default:
				return <Mail className="h-5 w-5 text-gray-500" />;
		}
	};

	const getTypeBadge = (type: string) => {
		const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

		switch (type) {
			case "deactivation":
				return <span className={`${baseClasses} bg-red-100 text-red-800`}>Deactivation</span>;
			case "reactivation":
				return <span className={`${baseClasses} bg-green-100 text-green-800`}>Reactivation</span>;
			case "status_change":
				return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Status Change</span>;
			case "security_alert":
				return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>Security Alert</span>;
			default:
				return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>General</span>;
		}
	};

	if (emailSent) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
					<CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
					<h3 className="text-[16px] md:text-[18px] font-semibold text-gray-900 mb-2">Email Sent Successfully!</h3>
					<p className="text-gray-600 mb-4">
						The notification email has been sent to {doctorEmail}
					</p>
					<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-[16px] md:text-[18px] font-semibold text-gray-900 flex items-center">
						<Mail className="h-6 w-6 mr-2 text-blue-600" />
						Send Email Notification
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<X className="h-6 w-6" />
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Left Column - Email Setup */}
					<div className="space-y-6">
						{/* Doctor Information */}
						<div className="bg-gray-50 rounded-lg p-4">
							<h4 className="font-medium text-gray-900 mb-3 flex items-center">
								<User className="h-4 w-4 mr-2" />
								Doctor Information
							</h4>
							<div className="space-y-2 text-sm">
								<div>
									<span className="font-medium text-gray-600">Name:</span> {doctorName || "N/A"}
								</div>
								<div>
									<span className="font-medium text-gray-600">Email:</span> {doctorEmail || "N/A"}
								</div>
								<div>
									<span className="font-medium text-gray-600">ID:</span> {doctorId || "N/A"}
								</div>
							</div>
						</div>

						{/* Template Selection */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-3">
								Email Template
							</label>
							<div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
								{emailTemplates.map((template) => (
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
													{template.subject}
												</span>
											</div>
											{getTypeBadge(template.type)}
										</div>
										<p className="text-sm text-gray-600 line-clamp-2">
											{template.template.substring(0, 100)}...
										</p>
									</div>
								))}
							</div>
						</div>

						{/* Custom Email Fields */}
						<div className="space-y-4">
							<div>
								<Input
									label="Custom Subject (if not using template)"
									type="text"
									value={customSubject}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomSubject(e.target.value)}
									placeholder="Enter email subject..."
									fullWidth
								/>
							</div>

							<div>
								<Textarea
									label="Custom Content (if not using template)"
									value={customContent}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomContent(e.target.value)}
									placeholder="Enter email content..."
									rows={8}
									fullWidth
								/>
							</div>
						</div>
					</div>

					{/* Right Column - Preview */}
					<div className="space-y-6">
						<div>
							<h4 className="text-[14px] md:text-[16px] font-medium text-gray-900 mb-4">Email Preview</h4>

							<div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
								{selectedTemplateData ? (
									<div className="space-y-4">
										<div className="border-b pb-2">
											<div className="flex items-center justify-between mb-2">
												<span className="text-sm font-medium text-gray-600">Subject:</span>
												{getTypeBadge(selectedTemplateData.type)}
											</div>
											<p className="font-medium text-gray-900">{selectedTemplateData.subject}</p>
										</div>

										<div>
											<span className="text-sm font-medium text-gray-600 mb-2 block">Content:</span>
											<div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-line">
												{processTemplate(selectedTemplateData.template, {
													doctorName: doctorName || "Dr. [Name]",
													doctorId: doctorId || "[ID]",
													doctorEmail: doctorEmail || "[Email]",
													deactivationDate: new Date().toLocaleDateString(),
													reactivationDate: new Date().toLocaleDateString(),
													changeDate: new Date().toLocaleDateString(),
													alertDate: new Date().toLocaleDateString(),
													deactivationReason: "Administrative action",
													previousStatus: "Active",
													newStatus: actionType === "deactivated" ? "Inactive" : "Active",
													statusExplanation: actionType === "deactivated"
														? "Your account has been temporarily deactivated."
														: "Your account has been reactivated.",
													nextSteps: actionType === "deactivated"
														? "Please contact support if you believe this was an error."
														: "Please verify your profile settings.",
													securityAction: "Account status change",
													securityDetails: "Your account status has been modified."
												})}
											</div>
										</div>
									</div>
								) : customSubject && customContent ? (
									<div className="space-y-4">
										<div className="border-b pb-2">
											<span className="text-sm font-medium text-gray-600">Subject:</span>
											<p className="font-medium text-gray-900 mt-1">{customSubject}</p>
										</div>
										<div>
											<span className="text-sm font-medium text-gray-600 mb-2 block">Content:</span>
											<div className="bg-gray-50 p-3 rounded text-sm text-gray-700 whitespace-pre-line">
												{customContent}
											</div>
										</div>
									</div>
								) : (
									<div className="text-center py-8 text-gray-500">
										<Mail className="h-8 w-8 mx-auto mb-2 text-gray-400" />
										<p>Select a template or enter custom content to preview</p>
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
								onClick={handleSendEmail}
								disabled={isSending || (!selectedTemplate && (!customSubject || !customContent))}
								className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
							>
								{isSending ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Sending...
									</>
								) : (
									<>
										<Send className="h-4 w-4 mr-2" />
										Send Email
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

export default EmailNotificationSystem;
