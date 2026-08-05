"use client";

import { useMemo, useRef, useState } from "react";
import {
  Upload as UploadIcon,
  FileText,
  Eye,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  useGetUploadsByDoctorIdQuery,
  useUploadDoctorDocumentMutation,
} from "@/store/uploadApi";
import { SVGLoader } from "@/components/SVGLoader";
import FormattedDate from "@/utils/FormattedDate";

const DOC_TYPES = [
  "Medical Licenses",
  "Certifications",
  "Insurance",
  "Professional Memberships",
];

export default function DoctorDocumentPage() {
  const { user, userInfo } = useAuth();
  const doctorId = user?.uid || "";

  const { data, isLoading, refetch } = useGetUploadsByDoctorIdQuery(doctorId, {
    skip: !doctorId,
  });
  const [uploadDoctorDocument, { isLoading: isUploading }] =
    useUploadDoctorDocumentMutation();

  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documents: any[] = data?.documents || [];

  const { hasApproved, hasPending, hasRejected, pendingCount } = useMemo(() => {
    const norm = (s?: string) => (s || "").toLowerCase();
    return {
      hasApproved: documents.some((d) => norm(d.status) === "approved"),
      hasPending: documents.some((d) => norm(d.status) === "pending"),
      hasRejected: documents.some((d) => norm(d.status) === "rejected"),
      pendingCount: documents.filter((d) => norm(d.status) === "pending").length,
    };
  }, [documents]);

  const canAccess = hasApproved && !hasPending;

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list).filter((f) => {
      const ok =
        f.type.startsWith("image/") || f.type === "application/pdf";
      if (!ok) toast.error(`"${f.name}" is not a PDF or image.`);
      return ok;
    });
    setFiles((prev) => [...prev, ...picked]);
  };

  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleUpload = async () => {
    if (!doctorId) {
      toast.error("You must be signed in to upload documents.");
      return;
    }
    if (files.length === 0) {
      toast.warning("Please select at least one file to upload.");
      return;
    }

    const doctorName =
      userInfo?.display_name ||
      [userInfo?.first_name, userInfo?.last_name].filter(Boolean).join(" ") ||
      user?.displayName ||
      "";

    try {
      for (const file of files) {
        await uploadDoctorDocument({
          doctorId,
          doctorName,
          specialization: userInfo?.specialization || "",
          description: docType,
          file,
        }).unwrap();
      }
      toast.success(
        `${files.length} document(s) uploaded. They're now pending review.`
      );
      setFiles([]);
      refetch();
    } catch (e: any) {
      toast.error(e?.error || "Failed to upload document. Please try again.");
    }
  };

  const statusBadge = (status?: string) => {
    const s = (status || "pending").toLowerCase();
    if (s === "approved")
      return "bg-green-50 text-green-700 border border-green-200";
    if (s === "rejected") return "bg-red-50 text-red-700 border border-red-200";
    return "bg-amber-50 text-amber-700 border border-amber-200";
  };

  // Verification banner
  const banner = (() => {
    if (canAccess)
      return {
        icon: <ShieldCheck className="w-5 h-5" />,
        cls: "bg-green-50 border-green-200 text-green-800",
        title: "You're verified",
        msg: "Your documents are approved. You have full access to EezyHealth.",
      };
    if (hasPending)
      return {
        icon: <Clock className="w-5 h-5" />,
        cls: "bg-amber-50 border-amber-200 text-amber-800",
        title: "Documents under review",
        msg: `You have ${pendingCount} document(s) pending verification. You'll get full access once they're approved.`,
      };
    if (hasRejected)
      return {
        icon: <AlertTriangle className="w-5 h-5" />,
        cls: "bg-red-50 border-red-200 text-red-800",
        title: "Action needed",
        msg: "Some of your documents were rejected. Please review the comments and upload new documents.",
      };
    return {
      icon: <AlertTriangle className="w-5 h-5" />,
      cls: "bg-blue-50 border-blue-200 text-blue-800",
      title: "Verification required",
      msg: "Upload your verification documents to unlock the rest of the app. An admin will review them shortly.",
    };
  })();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Verification Documents</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload your credentials for review. You&apos;ll get full access once an
          admin approves them.
        </p>
      </div>

      {/* Status banner */}
      <div className={`flex items-start gap-3 rounded-xl border p-4 mb-6 ${banner.cls}`}>
        <div className="mt-0.5">{banner.icon}</div>
        <div>
          <p className="text-sm font-semibold">{banner.title}</p>
          <p className="text-[13px] mt-0.5 opacity-90">{banner.msg}</p>
        </div>
      </div>

      {/* Upload card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Upload a document
        </h2>

        <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
          Document type
        </label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="w-full mb-4 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-[#44CE2D] focus:outline-none"
        >
          {DOC_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Drop / pick zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-gray-300 hover:border-[#44CE2D] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors"
        >
          <UploadIcon className="w-9 h-9 text-gray-400 mb-2" />
          <p className="text-[13px] font-medium text-gray-700">
            Click to upload or drag &amp; drop
          </p>
          <p className="text-[11px] text-gray-500 mt-1">PDF or image files</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {/* Selected files */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-[#44CE2D] flex-shrink-0" />
                  <span className="text-[13px] text-gray-800 truncate">
                    {f.name}
                  </span>
                  <span className="text-[11px] text-gray-400 flex-shrink-0">
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  disabled={isUploading}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#44CE2D] text-white font-medium py-2.5 hover:bg-[#3bb025] disabled:opacity-50 transition-colors"
            >
              {isUploading ? (
                <>
                  <SVGLoader width="16px" height="16px" color="#FFF" />
                  Uploading…
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4" />
                  Upload {files.length} document{files.length > 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Existing documents */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Your documents{" "}
          <span className="text-gray-400 font-normal">({documents.length})</span>
        </h2>

        {isLoading ? (
          <div className="py-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            You haven&apos;t uploaded any documents yet.
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc, i) => (
              <div
                key={doc.id || i}
                className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#44CE2D]/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4.5 h-4.5 text-[#44CE2D]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 truncate">
                      {doc.name || doc.fileName || "Document"}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {doc.description || "—"} ·{" "}
                      <FormattedDate timestamp={doc.uploadDate} />
                    </p>
                    {doc.status === "rejected" && doc.comment && (
                      <p className="text-[11px] text-red-600 mt-1">
                        Reason: {doc.comment}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {doc.downloadUrl && (
                    <a
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusBadge(
                      doc.status
                    )}`}
                  >
                    {doc.status === "approved" && (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    {(doc.status || "pending").charAt(0).toUpperCase() +
                      (doc.status || "pending").slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
