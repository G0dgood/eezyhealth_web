"use client";

import { useState, useEffect } from "react";
import { Eye, X, Check } from "lucide-react";
import { toast } from "sonner";
import FormattedDate from "@/utils/FormattedDate";
import Modal from "./Modal";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import { SVGLoader } from "../SVGLoader";
import { useUpdateUploadStatusMutation } from "@/store/uploadApi";

type DocStatus = "pending" | "approved" | "rejected";

interface DocItem {
  id: string;
  fileName?: string;
  name?: string;
  doctorName?: string;
  description?: string;
  specialization?: string;
  mimeType?: string;
  downloadUrl?: string;
  uploadDate?: string;
  status?: DocStatus;
  comment?: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

interface AggregateUpload {
  id?: string;
  doctorId: string;
  specialization?: string;
  createdAt?: string;
  updatedAt?: string;
  documents: DocItem[];
}

interface DocumentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  upload: DocItem | AggregateUpload;
  currentReviewer?: string;
}

export default function DocumentReviewModal({
  isOpen,
  onClose,
  upload,
  currentReviewer = "Admin",
}: DocumentReviewModalProps) {
  const [reviewComment, setReviewComment] = useState<string>(
    (upload as DocItem).comment || ""
  );
  const [actionType, setActionType] = useState<"approved" | "rejected" | null>(
    null
  );
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [docComments, setDocComments] = useState<Record<string, string>>({}); // Individual comments per document
  const [showGeneralInput, setShowGeneralInput] = useState<boolean>(false);
  const [updateUploadStatus, { isLoading: isSubmitting }] =
    useUpdateUploadStatusMutation();

  // Support aggregated payloads that contain a documents array
  const root = upload as Partial<AggregateUpload> & Partial<DocItem>;
  const documents: DocItem[] = Array.isArray(root?.documents)
    ? root.documents
    : [upload as DocItem];
  const doctorIdForDocs: string | undefined = root?.doctorId;

  // Get pending documents that can be selected
  const pendingDocs = documents.filter((doc) => doc.status === "pending");

  // Reset comment when upload changes
  useEffect(() => {
    setReviewComment((upload as DocItem)?.comment || "");
    setActionType(null);
  }, [upload]);

  /** ─── Update document status ─── */
  const updateStatusFor = async (doc: DocItem, newStatus: DocStatus) => {
    // Get comment from individual doc comment or general comment
    const docComment = docComments[doc.id] || reviewComment;

    if (!docComment.trim()) {
      toast.warning("Please enter a review comment for this document.");
      return;
    }

    // Prevent updating to the same status
    if (doc?.status === newStatus) {
      toast.info(`Document is already ${newStatus}.`);
      return;
    }

    setActionType(newStatus as "approved" | "rejected");

    try {
      const result = await updateUploadStatus({
        uploadId: doc.id,
        doctorId: (doctorIdForDocs as string) || "",
        name: (doc.name ?? doc.fileName) || "Document",
        downloadUrl: doc.downloadUrl || "",
        status: newStatus,
        comment: docComment,
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
        toast.error(
          "Permission denied. You don't have access to update this document."
        );
      } else {
        toast.error(
          error?.error || "Failed to update document. Please try again."
        );
      }
    } finally {
      setActionType(null);
    }
  };

  const handleApprove = (doc: DocItem) => updateStatusFor(doc, "approved");
  const handleReject = (doc: DocItem) => updateStatusFor(doc, "rejected");

  const isReadOnly = (doc?: DocItem) =>
    (doc?.status ?? (root as DocItem)?.status) !== "pending";

  // Toggle selection of a document
  const toggleSelection = (docId: string) => {
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);

    // Show general input automatically when any checkbox is selected
    if (newSelected.size > 0 && !showGeneralInput) {
      setShowGeneralInput(true);
    }
  };

  // Select/deselect all pending documents
  const toggleSelectAll = () => {
    if (selectedDocs.size === pendingDocs.length) {
      setSelectedDocs(new Set());
      setShowGeneralInput(false);
    } else {
      setSelectedDocs(new Set(pendingDocs.map((doc) => doc.id)));
      setShowGeneralInput(true);
    }
  };

  // Update individual document comment
  const updateDocComment = (docId: string, comment: string) => {
    setDocComments((prev) => ({
      ...prev,
      [docId]: comment,
    }));
  };

  // Approve all selected documents
  const handleApproveAll = async () => {
    if (!reviewComment.trim()) {
      toast.warning("Please enter a review comment.");
      return;
    }

    if (selectedDocs.size === 0) {
      toast.warning("Please select at least one document to approve.");
      return;
    }

    setActionType("approved");

    try {
      const selectedDocuments = documents.filter((doc) =>
        selectedDocs.has(doc.id)
      );

      // Approve each selected document
      for (const doc of selectedDocuments) {
        if (doc.status === "pending") {
          const docComment = docComments[doc.id] || reviewComment;
          await updateUploadStatus({
            uploadId: doc.id,
            doctorId: (doctorIdForDocs as string) || "",
            name: (doc.name ?? doc.fileName) || "Document",
            downloadUrl: doc.downloadUrl || "",
            status: "approved",
            comment: docComment,
            reviewedBy: currentReviewer,
          }).unwrap();
        }
      }

      toast.success(
        `${selectedDocuments.length} document(s) approved successfully.`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSelectedDocs(new Set());
      onClose();
    } catch (error: any) {
      console.error("Error approving documents:", error);
      toast.error(
        error?.error || "Failed to approve documents. Please try again."
      );
    } finally {
      setActionType(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Documents (${documents.length}) for ${root.doctorName}`}
      size="xl"
    >
      {/* Scrollable Body with max height */}
      <div className="max-h-[60vh] overflow-y-auto">
        <div className="px-6 py-4 space-y-4">
          {/* Select All Header for pending docs */}
          {pendingDocs.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Input
                  type="checkbox"
                  checked={
                    selectedDocs.size === pendingDocs.length &&
                    pendingDocs.length > 0
                  }
                  onChange={toggleSelectAll}
                  fullWidth={false}
                />
                <span className=" text-[10px]  md:text-[12px] font-medium text-[var(--foreground)]">
                  Select All ({pendingDocs.length} pending)
                </span>
              </label>
              {selectedDocs.size > 0 && (
                <button
                  onClick={handleApproveAll}
                  disabled={isSubmitting}
                  className="px-4 py-1.5  text-[10px]  md:text-[12px] bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <SVGLoader width="14px" height="14px" color="#FFF" />
                      Approving...
                    </span>
                  ) : (
                    `Approve Selected (${selectedDocs.size})`
                  )}
                </button>
              )}
            </div>
          )}

          {documents.map((doc, index) => (
            <div
              key={doc.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Checkbox for selection (only for pending docs) */}
                    {doc.status === "pending" && (
                      <Input
                        type="checkbox"
                        checked={selectedDocs.has(doc.id)}
                        onChange={() => toggleSelection(doc.id)}
                        fullWidth={false}
                      />
                    )}
                    <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                      <span className="text-[var(--primary)] font-semibold text-[14px] md:text-[16px]">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--foreground)]">
                        {doc.name || doc.fileName || "Unknown Document"}
                      </h4>
                      <p className=" text-[10px]  md:text-[12px] text-[var(--muted-foreground)]">
                        {doc.description || "No description"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3 ml-13">
                    <div className=" text-[10px]  md:text-[12px]">
                      <span className="text-[var(--muted-foreground)]">
                        Upload Date:
                      </span>
                      <span className="text-[var(--foreground)] ml-2">
                        <FormattedDate timestamp={doc?.uploadDate} />
                      </span>
                    </div>
                    {doc.mimeType && (
                      <div className=" text-[10px]  md:text-[12px]">
                        <span className="text-[var(--muted-foreground)]">
                          Type:
                        </span>
                        <span className="text-[var(--foreground)] ml-2">
                          {doc.mimeType}
                        </span>
                      </div>
                    )}
                  </div>

                  {doc.downloadUrl && (
                    <div className="mt-3 ml-13">
                      <a
                        href={doc.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2  text-[10px]  md:text-[12px] bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <Eye className="w-4 h-4" />
                        View Document
                      </a>
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${doc.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : doc.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {(doc.status ?? "PENDING").toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Individual Comment Input for Pending Docs */}
              {!isReadOnly(doc) && (
                <div className="mt-4 ml-13">
                  <label className="block  text-[10px]  md:text-[12px] font-medium text-[var(--foreground)] mb-2">
                    Review Comment for this Document
                  </label>
                  <Textarea
                    value={docComments[doc.id] || ""}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateDocComment(doc.id, e.target.value)}
                    placeholder="Enter comment for this document..."
                    disabled={isSubmitting}
                    rows={2}
                    fullWidth
                  />
                </div>
              )}

              {/* Action Buttons */}
              {!isReadOnly(doc) && (
                <div className="flex items-center gap-3 mt-4 ml-13">
                  <button
                    onClick={() => handleApprove(doc)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting && actionType === "approved" ? (
                      <SVGLoader width="16px" height="16px" color="#FFF" />
                    ) : (
                      "✓ Approve"
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(doc)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white bg-[var(--destructive)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {isSubmitting && actionType === "rejected" ? (
                      <SVGLoader width="16px" height="16px" color="#FFF" />
                    ) : (
                      "✗ Reject"
                    )}
                  </button>
                </div>
              )}

              {/* Previous Review Info */}
              {doc.status !== "pending" && doc.comment && (
                <div className="mt-4 ml-13 p-3 bg-[var(--muted)] rounded-lg">
                  <p className=" text-[10px]  md:text-[12px] text-[var(--muted-foreground)] mb-1">
                    Review Comment:
                  </p>
                  <p className=" text-[10px]  md:text-[12px] text-[var(--foreground)]">
                    {doc.comment}
                  </p>
                </div>
              )}
            </div>
          ))}

          {documents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[var(--muted-foreground)]">
                No documents to review.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="border-t border-[var(--border)] bg-white px-6 py-4">
        {selectedDocs.size > 0 && (
          <>
            <div className="mb-3">
              <label className="block  text-[10px]  md:text-[12px] font-medium text-[var(--foreground)] mb-2">
                General Comment (applies to all selected documents)
              </label>
              <Textarea
                value={reviewComment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewComment(e.target.value)}
                placeholder="Enter a general review comment that applies to all selected documents..."
                disabled={isSubmitting}
                rows={2}
                fullWidth
              />
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                This comment will be used for documents that don't have
                individual comments
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className=" text-[10px]  md:text-[12px] text-[var(--muted-foreground)]">
                {selectedDocs.size} document(s) selected
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedDocs(new Set())}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleApproveAll}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting
                    ? "Processing..."
                    : `Approve ${selectedDocs.size} Selected`}
                </button>
              </div>
            </div>
          </>
        )}

        {selectedDocs.size === 0 && (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
