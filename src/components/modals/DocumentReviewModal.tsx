"use client";

import { useState } from "react";
import { X, FileText } from "lucide-react";

interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
}

interface DoctorUpload {
  id: string;
  doctorName: string;
  specialty: string;
  uploadDate: string;
  status: "pending" | "approved" | "rejected";
  documents: Document[];
}

interface DocumentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  upload: DoctorUpload;
}

export default function DocumentReviewModal({
  isOpen,
  onClose,
  upload,
}: DocumentReviewModalProps) {
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    if (!reviewComment.trim()) {
      alert("Please enter a review comment");
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would typically make an API call to approve the documents
      console.log("Approving documents for:", upload.doctorName);
      console.log("Review comment:", reviewComment);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onClose();
      // You might want to refresh the parent component or show a success message
    } catch (error) {
      console.error("Error approving documents:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reviewComment.trim()) {
      alert("Please enter a review comment");
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would typically make an API call to reject the documents
      console.log("Rejecting documents for:", upload.doctorName);
      console.log("Review comment:", reviewComment);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onClose();
      // You might want to refresh the parent component or show a success message
    } catch (error) {
      console.error("Error rejecting documents:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = upload.status !== "pending";

  return (
    <div className="fixed inset-0 bg-[#00000020]  bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Document Review - {upload.doctorName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Document List */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Documents
            </h4>
            <div className="space-y-3">
              {upload.documents.map((doc, index) => (
                <div key={doc.id}>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-red-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {doc.name}
                      </div>
                      <div className="text-xs text-gray-500">{doc.size}</div>
                    </div>
                  </div>
                  {index < upload.documents.length - 1 && (
                    <div className="border-t border-gray-200 my-3" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Review Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Review Comment {!isReadOnly && "(required)"}
            </label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder={
                isReadOnly
                  ? "No comment provided"
                  : "Enter Review Comment (required)"
              }
              disabled={isReadOnly}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44CE2D] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          {/* Action Buttons - Only show for pending documents */}
          {!isReadOnly && (
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleReject}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isSubmitting ? "Processing..." : "Reject"}
              </button>
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isSubmitting ? "Processing..." : "Approve"}
              </button>
            </div>
          )}

          {/* Read-only view for approved/rejected documents */}
          {isReadOnly && (
            <div className="pt-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      Review Date:
                    </span>
                    <span className="ml-2 text-gray-900">2 February 2025</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Reviewed By:
                    </span>
                    <span className="ml-2 text-gray-900">Nurse Jane</span>
                  </div>
                </div>
                {reviewComment && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">Comment:</span>
                    <p className="mt-1 text-gray-900">{reviewComment}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
