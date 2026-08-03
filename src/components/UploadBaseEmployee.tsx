"use client";
import React, { useState, useRef } from "react";
import { RxCross2, RxUpload } from "react-icons/rx";
import {
 Download,
 FileText,
 X,
 CheckCircle,
 Upload as UploadIcon,
} from "lucide-react";
import { toast } from "sonner";
import Input from "@/components/Input";
import Modal from "./modals/Modal";


interface UploadBaseProps {
 isOpen?: boolean;
 onClose?: () => void;
 showButton?: boolean;
 onUploadComplete?: (data: CsvRow[], file?: File) => void;
 title?: string;
 onDownloadTemplate?: () => void;
}

// Simple CSV parser function
type CsvRow = Record<string, string>;

const parseCSV = (text: string, header: boolean = true): CsvRow[] => {
 const lines = text.split('\n').filter(line => line.trim());
 if (lines.length === 0) return [];

 const rows = lines.map(line => {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
   const char = line[i];
   const nextChar = line[i + 1];

   if (char === '"') {
    if (insideQuotes && nextChar === '"') {
     currentValue += '"';
     i++; // Skip next quote
    } else {
     insideQuotes = !insideQuotes;
    }
   } else if (char === ',' && !insideQuotes) {
    values.push(currentValue.trim());
    currentValue = '';
   } else {
    currentValue += char;
   }
  }
  values.push(currentValue.trim()); // Add last value

  return values;
 });

 if (!header || rows.length === 0) return [];

 const headers = rows[0];
 const data = rows.slice(1).map(row => {
  const obj: Record<string, string> = {};
  headers.forEach((header, index) => {
   obj[header] = row[index] || '';
  });
  return obj;
 });

 return data;
};

const UploadBase: React.FC<UploadBaseProps> = ({
 isOpen: externalIsOpen,
 onClose: externalOnClose,
 showButton = true,
 onUploadComplete,
 title = "Upload Users",
 onDownloadTemplate,
}) => {

 const primaryColor = '#050711';
 const [progress, setProgress] = useState(0);
 const [show, setShow] = useState(false);
 const [jsonData, setJSONData] = useState<CsvRow[]>([]);
 const [isDragOver, setIsDragOver] = useState(false);
 const [isSuccess] = useState(false);
 const [isError] = useState(false);
 const [isLoading] = useState(false);
 const [fileToUpload, setFileToUpload] = useState<File | null>(null);
 type ApiError = { data?: { message?: string } };
 const [error] = useState<ApiError | null>(null);

 const fileInputRef = useRef<HTMLInputElement>(null);



 // Use external control if provided, otherwise use internal state
 const isOpen = externalIsOpen !== undefined ? externalIsOpen : show;
 const handleClose = () => {
  if (externalOnClose) {
   externalOnClose();
  } else {
   setShow(false);
  }
  setProgress(0);
  setJSONData([]);
  setIsDragOver(false);
  setFileToUpload(null);
 };

 const handleShow = () => setShow(true);

 const onClickReset = () => {
  setProgress(0);
  setJSONData([]);
  setIsDragOver(false);
  setFileToUpload(null);
 };

 const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragOver(true);
 };

 const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragOver(false);
 };

 const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragOver(false);

  const files = e.dataTransfer.files;
  if (files.length > 0) {
   const file = files[0];
   if (file.type === "text/csv" || file.name.endsWith(".csv")) {
    handleFileUpload(file);
   } else {
    toast.error("Invalid file type", {
     description: "Please upload a CSV file",
     duration: 3000,
    });
   }
  }
 };

 const handleFileUpload = (file: File) => {
  setFileToUpload(file);
  const reader = new FileReader();

  reader.onload = (e) => {
   try {
    const text = e.target?.result as string;
    const parsedData = parseCSV(text, true);
    setJSONData(parsedData);
    toast.success("File loaded successfully", {
     description: `${parsedData.length} records loaded`,
     duration: 3000,
    });
   } catch (error) {
    toast.error("Failed to parse CSV", {
     description: "Please check the file format",
     duration: 3000,
    });
   }
  };

  reader.onerror = () => {
   toast.error("Failed to read file", {
    description: "Please try again",
    duration: 3000,
   });
  };

  reader.readAsText(file, 'UTF-8');
 };

 const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files && files.length > 0) {
   const file = files[0];
   if (file.type === "text/csv" || file.name.endsWith(".csv")) {
    handleFileUpload(file);
   } else {
    toast.error("Invalid file type", {
     description: "Please upload a CSV file",
     duration: 3000,
    });
   }
  }
 };

 const handleDragAreaClick = () => {
  if (fileInputRef.current) {
   fileInputRef.current.click();
  }
 };

 const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
   setProgress(30);


   setProgress(100);

   // Extract data from the API response
   const { created, updated, failed } = { created: [], updated: [], failed: [] };

   const successCount = created.length;
   const skippedCount = updated.length;
   const failedCount = failed.length;
   const skippedDetails = updated.join(", ");
   const failedDetails = failed
    .map((item: { email?: string; reason?: string }) => `${item.email || "Unknown email"}: ${item.reason || "Unknown reason"}`)
    .join("; ");

   if (successCount || skippedCount || failedCount) {
    toast.success("Upload summary", {
     description: `Success: ${successCount}, Skipped: ${skippedCount}${skippedDetails ? ` (${skippedDetails})` : ""}, Failed: ${failedCount}${failedDetails ? ` (${failedDetails})` : ""}`,
     duration: 5000,
    });
   }

   // Call onUploadComplete callback if provided
   if (onUploadComplete && jsonData.length > 0) {
    onUploadComplete(jsonData, fileToUpload || undefined);
   }
  } catch (err: unknown) {
   setProgress(0);

   toast.error("Upload Failed", {
    description: (typeof err === "object" && err && (err as { data?: { message?: string } }).data?.message) || "An error occurred while uploading employees",
    duration: 5000,
   });
  }
 };

 return (
  <>
   {showButton && (
    <button
     onClick={handleShow}
     className="cursor-pointer flex flex-col md:flex-row justify-center items-center px-2 py-[8px] gap-2 md:w-[150px] h-[40px] font-normal text-[14px] leading-[150%] text-[#FFFFFF]"
     style={{ backgroundColor: primaryColor }}
    >
     Upload
    </button>
   )}

   {isOpen && (
    <Modal
     isOpen={isOpen}
     onClose={handleClose}
     title={title}
     size="lg"
    >
     <div className="space-y-5">
      {/* Template download — inside the modal, like the specialty bulk upload */}
      {onDownloadTemplate && (
       <div className="bg-[#44CE2D]/5 border border-[#44CE2D]/30 rounded-xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
         <FileText className="w-5 h-5 text-[#3bb025] flex-shrink-0" />
         <div className="min-w-0">
          <p className="text-[12px] font-semibold text-[var(--foreground)]">
           Need a template?
          </p>
          <p className="text-[10px] text-[var(--muted-foreground)]">
           Download the sample CSV to match the format.
          </p>
         </div>
        </div>
        <button
         type="button"
         onClick={onDownloadTemplate}
         className="flex items-center gap-2 text-[12px] text-[#3bb025] hover:text-[#2e8a20] font-medium bg-[var(--card)] px-3 py-1.5 rounded-lg border border-[#44CE2D]/40 transition-colors flex-shrink-0"
        >
         <Download className="w-4 h-4" />
         <span>Sample CSV</span>
        </button>
       </div>
      )}

      <form onSubmit={submitHandler} className="space-y-5">
       {/* Upload zone / selected file card */}
       {!fileToUpload ? (
        <div
         onClick={handleDragAreaClick}
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}
         className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragOver
           ? "border-[#44CE2D] bg-[#44CE2D]/5"
           : "border-[var(--border)] hover:border-[#44CE2D]"
         }`}
        >
         <UploadIcon className="w-12 h-12 text-[var(--muted-foreground)] mb-3" />
         <p className="text-[13px] font-medium text-[var(--foreground)]">
          Click to upload or drag &amp; drop
         </p>
         <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
          Only CSV files are supported
         </p>
        </div>
       ) : (
        <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--muted)]">
         <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
           <FileText className="w-8 h-8 text-[#3bb025] flex-shrink-0" />
           <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[var(--foreground)] truncate">
             {fileToUpload.name}
            </p>
            <p className="text-[10px] text-[var(--muted-foreground)]">
             {(fileToUpload.size / 1024).toFixed(2)} KB
             {jsonData.length > 0
              ? ` · ${jsonData.length} record${jsonData.length === 1 ? "" : "s"}`
              : ""}
            </p>
           </div>
          </div>
          {!isLoading && (
           <button
            type="button"
            onClick={onClickReset}
            className="p-1 rounded-full hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex-shrink-0"
           >
            <X className="w-5 h-5" />
           </button>
          )}
         </div>
        </div>
       )}

       <Input
        ref={fileInputRef}
        type="file"
        id="csv-upload"
        accept=".csv,text/csv"
        onChange={handleFileInputChange}
        style={{ display: "none" }}
       />

       {/* Progress */}
       {(isLoading || (progress > 0 && progress < 100)) && (
        <div className="space-y-2">
         <div className="flex justify-between text-[11px] font-medium text-[var(--muted-foreground)]">
          <span>Uploading users...</span>
          <span>{progress}%</span>
         </div>
         <div className="w-full bg-[var(--muted)] rounded-full h-2 overflow-hidden">
          <div
           className="bg-[#44CE2D] h-2 rounded-full transition-all duration-300"
           style={{ width: `${progress}%` }}
          />
         </div>
        </div>
       )}

       {/* Actions */}
       <div className="flex gap-3 pt-1">
        <button
         type="button"
         onClick={handleClose}
         disabled={isLoading}
         className="flex-1 bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
         Cancel
        </button>
        <button
         type="submit"
         disabled={isLoading || jsonData.length === 0}
         className="flex-1 bg-[#44CE2D] hover:bg-[#3bb025] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
         {isLoading ? (
          <span>Uploading...</span>
         ) : (
          <>
           <CheckCircle className="w-4 h-4" />
           <span>Upload Users</span>
          </>
         )}
        </button>
       </div>
      </form>
     </div>
    </Modal>
   )}


  </>
 );
};

export default UploadBase;
