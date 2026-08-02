import React, { useState, useRef } from "react";
import Modal from "@/components/modals/Modal";
import { Upload as UploadIcon, FileText, X, CheckCircle, Download } from "lucide-react";
import { createSpecialization } from "@/lib/specialization";
import { toast } from "sonner";

interface BulkUploadSpecialtyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

interface ParsedSpecialty {
  name: string;
  description: string;
}

const parseCSV = (text: string): ParsedSpecialty[] => {
  const lines = text.split(/\r?\n/);
  const result: ParsedSpecialty[] = [];

  // Assuming first row is header: Name,Description
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const matches = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        matches.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    matches.push(current.trim());

    const name = matches[0]?.replace(/^"|"$/g, "") || "";
    const description = matches[1]?.replace(/^"|"$/g, "") || "";

    if (name) {
      result.push({ name, description });
    }
  }
  return result;
};

const BulkUploadSpecialtyModal: React.FC<BulkUploadSpecialtyModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedSpecialty[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Invalid file format. Please select a CSV file.");
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setParsedData(parsed);
      if (parsed.length === 0) {
        toast.warning("The selected CSV file has no records or is incorrectly formatted.");
      } else {
        toast.success(`Successfully parsed ${parsed.length} specializations.`);
      }
    };
    reader.readAsText(selectedFile);
  };

  const downloadSampleCSV = () => {
    const csvContent = "Name,Description\nCardiology,\"Specialty dealing with disorders of the heart and blood vessels.\"\nNeurology,\"Specialty dealing with disorders of the nervous system.\"\nPediatrics,\"Specialty focusing on the medical care of infants, children, and adolescents.\"";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "specialization_sample.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: parsedData.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < parsedData.length; i++) {
      try {
        await createSpecialization(parsedData[i]);
        successCount++;
      } catch (err) {
        console.error("Failed to upload specialization:", parsedData[i], err);
        failCount++;
      }
      setUploadProgress({ current: i + 1, total: parsedData.length });
    }

    setIsUploading(false);
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} specializations.`);
      onUploadSuccess();
      handleClose();
    }
    if (failCount > 0) {
      toast.error(`Failed to upload ${failCount} specializations.`);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setUploadProgress({ current: 0, total: 0 });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Upload Specializations" size="lg">
      <div className="space-y-6">
        {/* Sample Download Area */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-[12px] font-semibold text-blue-900">Need a template?</p>
              <p className="text-[10px] text-blue-700">Download our sample CSV file to match format.</p>
            </div>
          </div>
          <button
            onClick={downloadSampleCSV}
            className="flex items-center space-x-2 text-[12px] text-blue-600 hover:text-blue-800 font-medium bg-white px-3 py-1.5 rounded border border-blue-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Sample CSV</span>
          </button>
        </div>

        {/* Upload Zone */}
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-green-500 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
          >
            <UploadIcon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-[12px] font-medium text-gray-700">Click to upload or drag & drop</p>
            <p className="text-[10px] text-gray-500 mt-1">Only CSV files are supported</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-[12px] font-semibold text-gray-900 truncate max-w-xs">{file.name}</p>
                  <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              {!isUploading && (
                <button
                  onClick={() => {
                    setFile(null);
                    setParsedData([]);
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Parsed Preview Table */}
            {parsedData.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold text-gray-700 mb-2">Preview ({parsedData.length} records)</p>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 sticky top-0 border-b">
                      <tr>
                        <th className="p-2 text-[10px] font-semibold text-gray-600">Specialty Name</th>
                        <th className="p-2 text-[10px] font-semibold text-gray-600">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {parsedData.map((spec, i) => (
                        <tr key={i} className="hover:bg-white bg-gray-50">
                          <td className="p-2 text-[11px] font-medium text-gray-900">{spec.name}</td>
                          <td className="p-2 text-[10px] text-gray-600 max-w-xs truncate">{spec.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Uploading progress bar */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-medium text-gray-700">
              <span>Uploading specializations...</span>
              <span>
                {uploadProgress.current} / {uploadProgress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-150"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={parsedData.length === 0 || isUploading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isUploading ? (
              <span>Uploading...</span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Upload Specialties</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkUploadSpecialtyModal;
