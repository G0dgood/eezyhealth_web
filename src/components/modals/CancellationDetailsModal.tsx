"use client";

import { FirebaseBookingCancellation } from "@/types";

interface CancellationDetailsModalProps {
	booking: FirebaseBookingCancellation | null;
	isResponding: boolean;
	onApprove: (bookingId: string) => void;
	onReject: (bookingId: string) => void;
	showActions?: boolean;
}

export default function CancellationDetailsModal({
	booking,
	isResponding,
	onApprove,
	onReject,
	showActions = false,
}: CancellationDetailsModalProps) {
	if (!booking) return null;

	return (
		<div>
			<div className="space-y-4">
				<div>
					<label className="block  text-[10px]  md:text-[12px] font-medium text-[var(--foreground)] mb-1">
						Doctor
					</label>
					<p className="text-[var(--foreground)]">
						{booking.doctorName || "N/A"}
					</p>
				</div>
				<div>
					<label className="block  text-[10px]  md:text-[12px] font-medium text-[var(--foreground)] mb-1">
						Patient Name
					</label>
					<p className="text-[var(--foreground)]">
						{booking.patientName || "N/A"}
					</p>
				</div>
				<div>
					<label className="block  text-[10px]  md:text-[12px] font-medium text-[var(--foreground)] mb-1">
						User ID
					</label>
					<p className="text-[var(--foreground)]">
						{booking.userId || "N/A"}
					</p>
				</div>
				<div>
					<label className="block  text-[10px]  md:text-[12px] font-medium text-[var(--foreground)] mb-1">
						Booking Date
					</label>
					<p className="text-[var(--foreground)]">
						{booking?.bookingDate
							? typeof booking.bookingDate === 'object' && 'seconds' in booking.bookingDate
								? new Date(booking.bookingDate.seconds * 1000).toLocaleDateString()
								: new Date(booking.bookingDate as string | number | Date).toLocaleDateString()
							: "N/A"}
					</p>
				</div>
				<div>
					<label className="block  text-[10px]  md:text-[12px] font-medium text-[var(--foreground)] mb-1">
						Cancellation Status
					</label>
					<span
						className={`inline-block px-2 py-1 text-xs rounded-full ${(booking.bookingStatus as string)?.toLowerCase() === "cancelled"
							? "bg-[var(--destructive)]/10 text-[var(--destructive)] border border-[var(--destructive)]/20"
							: (booking.bookingStatus as string)?.toLowerCase() === "approved"
								? "bg-green-100 text-green-800"
								: (booking.bookingStatus as string)?.toLowerCase() === "pending"
									? "bg-yellow-100 text-yellow-800"
									: "bg-[var(--muted)] text-[var(--muted-foreground)]"
							}`}>
						{(booking.bookingStatus as string) || "-"}
					</span>
				</div>
				<div>
					<label className="block  text-[10px]  md:text-[12px] font-medium text-[var(--foreground)] mb-1">
						Hospital
					</label>
					<p className="text-[var(--foreground)]">
						{booking.hospital || "N/A"}
					</p>
				</div>
				<div>
					<label className="block  text-[10px]  md:text-[12px] font-medium text-[var(--foreground)] mb-1">
						Specialization
					</label>
					<p className="text-[var(--foreground)]">
						{booking.specialization || "N/A"}
					</p>
				</div>
			</div>

			{/* Action buttons - only show for admin */}
			{showActions && (
				<div className="flex justify-between pt-4 border-t border-[var(--border)]">
					<button
						onClick={() => booking?.id && onApprove(booking.id)}
						disabled={isResponding || !booking?.id}
						className="px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
						{isResponding ? "Approving..." : "Approve"}
					</button>
					<button
						onClick={() => booking?.id && onReject(booking.id)}
						disabled={isResponding || !booking?.id}
						className="px-6 py-2 bg-[var(--destructive)] text-[var(--destructive-foreground)] rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
						{isResponding ? "Rejecting..." : "Reject"}
					</button>
				</div>
			)}
		</div>
	);
}
