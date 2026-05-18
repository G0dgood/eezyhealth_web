import React, { useState } from "react";
import Modal from "@/components/modals/Modal";
import Button from "@/components/Button";
import { Mail, Phone, Check, Copy, MessageSquare, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface ContactMessage {
  id: string;
  firstname: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
  status: string;
  createdAt: any;
}

interface ContactDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: ContactMessage | null;
}

const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({
  isOpen,
  onClose,
  contact,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!contact) return null;

  // Format date received helper
  const formatContactDate = (dateVal: any): string => {
    if (!dateVal) return "N/A";

    // Firestore timestamp
    if (typeof dateVal === "object") {
      if (dateVal.seconds !== undefined) {
        return new Date(dateVal.seconds * 1000).toLocaleString();
      }
      if (dateVal._seconds !== undefined) {
        return new Date(dateVal._seconds * 1000).toLocaleString();
      }
    }

    // String ISO date
    if (typeof dateVal === "string") {
      if (dateVal.includes(" at ")) {
        return dateVal;
      }
      try {
        const parsedDate = new Date(dateVal);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleString();
        }
      } catch (e) {
        // Ignore parsing error
      }
      return dateVal;
    }

    return String(dateVal);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    const isUnread = !status || status.toLowerCase() === "unread";
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border shadow-sm ${isUnread
            ? "bg-red-600 text-white border-red-700"
            : "bg-[#44CE2D] text-white border-[#38b220]"
          }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full bg-white ${isUnread ? "animate-pulse" : ""}`}
        />
        {isUnread ? "Unread Message" : "Read / Processed"}
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact Submission Details"
      size="md"
    >
      <div className="space-y-6">
        {/* Header info */}
        <div className="flex items-start justify-between bg-[var(--muted)]/30 p-4 rounded-xl border border-[var(--border)]">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-[#44CE2D] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {contact.firstname?.[0]?.toUpperCase() || ""}
              {contact.lastName?.[0]?.toUpperCase() || ""}
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                {contact.firstname || ""} {contact.lastName || ""}
              </h3>
              <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Received: {formatContactDate(contact.createdAt)}
              </div>
            </div>
          </div>
          <div>{getStatusBadge(contact.status)}</div>
        </div>

        {/* Contact Details Card */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Contact Details
          </h4>

          <div className="grid grid-cols-1  gap-4">
            <div className="bg-[var(--card)] p-3 rounded-lg border border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[var(--muted)] rounded-lg">
                  <Mail className="w-4 h-4 text-[#44CE2D]" />
                </div>
                <div className="truncate">
                  <div className="text-[10px] font-medium text-[var(--muted-foreground)]">Email Address</div>
                  <div className="text-sm font-semibold text-[var(--foreground)] truncate max-w-[150px]">
                    {contact.email || "N/A"}
                  </div>
                </div>
              </div>
              {contact.email && (
                <button
                  onClick={() => handleCopy(contact.email, "Email")}
                  className="p-1.5 hover:bg-[var(--muted)] rounded transition-colors text-[var(--muted-foreground)]"
                >
                  {copiedField === "Email" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            <div className="bg-[var(--card)] p-3 rounded-lg border border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-[var(--muted)] rounded-lg">
                  <Phone className="w-4 h-4 text-[#44CE2D]" />
                </div>
                <div>
                  <div className="text-[10px] font-medium text-[var(--muted-foreground)]">Phone Number</div>
                  <div className="text-sm font-semibold text-[var(--foreground)]">
                    {contact.phoneNumber || "N/A"}
                  </div>
                </div>
              </div>
              {contact.phoneNumber && (
                <button
                  onClick={() => handleCopy(contact.phoneNumber, "Phone")}
                  className="p-1.5 hover:bg-[var(--muted)] rounded transition-colors text-[var(--muted-foreground)]"
                >
                  {copiedField === "Phone" ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Message Body */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#44CE2D]" />
            <span>Message</span>
          </h4>
          <div className="bg-[var(--muted)]/20 p-4 rounded-xl border border-[var(--border)] text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-wrap min-h-[120px]">
            {contact.message || "No message content provided."}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={onClose}
            variant="outline-neutral"
            className="flex-1 order-last sm:order-first"
          >
            Close Details
          </Button>

          {contact.email && (
            <a
              href={`mailto:${contact.email}?subject=Response from EezyHealth&body=Hello ${contact.firstname},%0D%0A%0D%0AReferencing your message: "${contact.message}"`}
              className="flex-1 inline-flex"
            >
              <Button
                variant="primary"
                className="w-full inline-flex items-center justify-center gap-1.5"
              >
                <span>Reply via Email</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ContactDetailsModal;
