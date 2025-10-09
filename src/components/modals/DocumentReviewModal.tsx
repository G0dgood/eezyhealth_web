"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import FormattedDate from "@/utils/FormattedDate";
import Modal from "./Modal";
import { SVGLoader } from "../SVGLoader";
import { useUpdateUploadStatusMutation } from "@/store/api";

interface Upload {
  id: string;
  doctorId: string;
  name: string;
  description: string;
  specialization: string;
  downloadUrl: string;
  uploadDate: any;
  status: "pending" | "approved" | "rejected";
  comment?: string;
  reviewedBy?: string;
  reviewedAt?: any;
}

interface DocumentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  upload: Upload;
  currentReviewer?: string;
}

export default function DocumentReviewModal({
  isOpen,
  onClose,
  upload,
  currentReviewer = "Admin",
}: DocumentReviewModalProps) {
  const [reviewComment, setReviewComment] = useState(upload.comment || "");
  const [actionType, setActionType] = useState<"approved" | "rejected" | null>(null);
  const [updateUploadStatus, { isLoading: isSubmitting }] = useUpdateUploadStatusMutation();

  // Reset comment when upload changes
  useEffect(() => {
    setReviewComment(upload.comment || "");
    setActionType(null);
  }, [upload]);

  /** ─── Update document status ─── */
  const updateStatus = async (newStatus: "approved" | "rejected") => {
    if (!reviewComment.trim()) {
      toast.warning("Please enter a review comment.");
      return;
    }

    // Prevent updating to the same status
    if (upload.status === newStatus) {
      toast.info(`Document is already ${newStatus}.`);
      return;
    }

    setActionType(newStatus);

    try {
      const result = await updateUploadStatus({
        uploadId: upload.id,
        doctorId: upload.doctorId,
        name: upload.name,
        downloadUrl: upload.downloadUrl,
        status: newStatus,
        comment: reviewComment,
        reviewedBy: currentReviewer,
      }).unwrap();

      toast.success(result?.message || `Document ${newStatus} successfully.`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onClose();
    } catch (error: any) {
      console.error("Error updating document status:", error);

      // More specific error messages
      if (error?.status === "NOT_FOUND") {
        toast.error("Document not found. It may have been deleted.");
      } else if (error?.status === "permission-denied") {
        toast.error("Permission denied. You don't have access to update this document.");
      } else {
        toast.error(error?.error || "Failed to update document. Please try again.");
      }
    } finally {
      setActionType(null);
    }
  };

  const handleApprove = () => updateStatus("approved");
  const handleReject = () => updateStatus("rejected");

  const isReadOnly = upload.status !== "pending";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Document Review - ${upload.name}`}
    >
      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Upload Info */}
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Description:</strong> {upload.description || "N/A"}
          </p>
          {/* <p>
            <strong>Specialization:</strong> {upload.specialization || "N/A"}
          </p> */}
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`px-2 py-1 rounded text-white text-xs ${upload.status === "approved"
                ? "bg-green-600"
                : upload.status === "rejected"
                  ? "bg-red-600"
                  : "bg-yellow-500"
                }`}
            >
              {upload.status.toUpperCase()}
            </span>
          </p>
          <p>
            <strong>Upload Date:</strong>{" "}
            <FormattedDate timestamp={upload?.uploadDate} />
          </p>
        </div>

        {/* Document Preview */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Document Preview
          </h4>
          <a
            href={upload.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-blue-600 hover:underline mb-2"
          >
            <Eye className="w-4 h-4 mr-1" /> View in new tab
          </a>
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
                ? upload.comment || "No comment provided"
                : "Enter your review comment"
            }
            disabled={isReadOnly || isSubmitting}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>



        {/* Read-only details */}
        {isReadOnly && (
          <div className="pt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Review Date:
                  </span>
                  <span className="ml-2 text-gray-900">
                    <FormattedDate timestamp={upload?.reviewedAt} />
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Reviewed By:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {upload?.reviewedBy || "N/A"}
                  </span>
                </div>
              </div>
              {upload.comment && (
                <div className="mt-3">
                  <span className="font-medium text-gray-700">Comment:</span>
                  <p className="mt-1 text-gray-900">{upload.comment}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {/* {!isReadOnly && ( */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
          >
            {isSubmitting && actionType === "rejected" ? (
              <SVGLoader width={"25px"} height={"25px"} color={"#FFF"} />
            ) : (
              "Reject"
            )}
          </button>
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
          >
            {isSubmitting && actionType === "approved" ? (
              <SVGLoader width={"25px"} height={"25px"} color={"#FFF"} />
            ) : (
              "Approve"
            )}
          </button>
        </div>
        {/* )} */}
      </div>
    </Modal>
  );
}
