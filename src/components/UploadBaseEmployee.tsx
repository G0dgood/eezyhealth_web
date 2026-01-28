"use client";
import React, { useState, useRef } from "react";
import { RxCross2, RxUpload } from "react-icons/rx";
import { toast } from "sonner";
import Input from "@/components/Input";
import Modal from "./modals/Modal";


interface UploadBaseProps {
  isOpen?: boolean;
  onClose?: () => void;
  showButton?: boolean;
  onUploadComplete?: (data: CsvRow[], file?: File) => void;
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
          title="Upload CSV File"
          size="md"
        >
          <div
            className="dark:bg-gray-800 w-full max-w-2xl "
            style={{ backgroundColor: 'var(--accent-white)' }}
          >


            <form className="mt-4 space-y-4" onSubmit={submitHandler}>
              {isError && (
                <div
                  className="dark:bg-red-900/30 dark:text-red-400 px-4 py-2 relative flex justify-between items-center"
                  style={{
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    color: '#DC2626'
                  }}
                >
                  <p>
                    <i className="fas fa-exclamation-circle mr-2" />{" "}
                    {error?.data?.message || "Upload failed"}
                  </p>
                  <button
                    onClick={onClickReset}
                    className="dark:text-red-400 dark:hover:text-red-300"
                    style={{ color: '#DC2626' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#991B1B';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#DC2626';
                    }}
                  >
                    <i className="fas fa-times" />
                  </button>
                </div>
              )}

              {isSuccess && (
                <div
                  className="dark:bg-green-900/30 dark:text-green-400 px-4 py-2 relative flex justify-between items-center"
                  style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    color: '#22C55E'
                  }}
                >
                  <p>
                    <i className="fas fa-check-circle mr-2" /> Upload
                    successful!
                  </p>
                  <button
                    onClick={onClickReset}
                    className="dark:text-gray-400 dark:hover:text-red-400 text-[14px] md:text-[16px]"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#DC2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-tertiary)';
                    }}
                  >
                    <RxCross2
                      className="w-5 h-5 dark:text-gray-400 dark:hover:text-gray-200"
                      style={{ color: 'var(--text-tertiary)' }}
                    />
                  </button>
                </div>
              )}

              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed p-8 transition-all cursor-pointer ${isDragOver
                  ? ""
                  : progress > 0
                    ? "dark:bg-green-900/20 dark:border-green-500"
                    : "dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700"
                  }`}
                style={isDragOver ? {
                  backgroundColor: `${primaryColor}15`,
                  borderColor: primaryColor
                } : progress > 0 ? {
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderColor: '#22C55E'
                } : {
                  borderColor: 'var(--light-gray)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isDragOver && progress === 0) {
                    e.currentTarget.style.borderColor = '#94A3B8';
                    e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDragOver && progress === 0) {
                    e.currentTarget.style.borderColor = 'var(--light-gray)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleDragAreaClick}
              >
                <RxUpload
                  className={`w-12 h-12 mb-4 dark:text-gray-500`}
                  style={isDragOver ? { color: primaryColor } : { color: 'var(--text-tertiary)' }}
                />
                <p
                  className="text-[14px] md:text-[16px] font-medium dark:text-gray-300 mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {progress === 0
                    ? "Drag and drop your CSV file here"
                    : "Uploading..."}
                </p>
                <p
                  className=" !text-[10px]  !md:text-[12px] dark:text-gray-400 text-center"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {progress === 0
                    ? "or click to browse files"
                    : "Please wait while we process your file"}
                </p>
                {jsonData.length > 0 && progress === 0 && (
                  <p
                    className=" !text-[10px]  !md:text-[12px] dark:text-green-400 mt-2"
                    style={{ color: '#22C55E' }}
                  >
                    ✓ File loaded successfully ({jsonData.length} records)
                  </p>
                )}
              </div>

              <Input
                ref={fileInputRef}
                type="file"
                id="csv-upload"
                accept=".csv,text/csv"
                onChange={handleFileInputChange}
                style={{ display: "none" }}
              />

              <div
                className="w-full dark:bg-gray-700 rounded-full h-3 overflow-hidden mt-2"
                style={{ backgroundColor: 'var(--bg-primary)' }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: primaryColor }}
                />
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="reset"
                  onClick={onClickReset}
                  className="px-4 py-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E2E8F0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                  }}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isLoading || jsonData.length === 0}
                  className={`px-4 py-2 text-white transition-opacity ${isLoading || jsonData.length === 0
                    ? "dark:bg-gray-600 cursor-not-allowed"
                    : ""
                    }`}
                  style={!isLoading && jsonData.length > 0 ? {
                    backgroundColor: primaryColor,
                  } : {
                    backgroundColor: '#9CA3AF',
                    cursor: 'not-allowed'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && jsonData.length > 0) {
                      e.currentTarget.style.opacity = '0.9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && jsonData.length > 0) {
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                >
                  {isLoading ? "Uploading..." : "Upload"}
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
