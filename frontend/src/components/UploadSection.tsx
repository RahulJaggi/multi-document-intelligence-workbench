import React, { useState, useRef } from 'react';
import api from '../services/api';

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileType: string;
  extractedText: string;
}

interface UploadSectionProps {
  onUploadSuccess: (docs: UploadedDocument[]) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const UploadSection: React.FC<UploadSectionProps> = ({ onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidFileType = (file: File): boolean => {
    const mimeTypes = ['application/pdf', 'text/plain'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    return mimeTypes.includes(file.type) || ext === 'pdf' || ext === 'txt';
  };

  const handleFiles = (filesList: FileList) => {
    setUploadError(null);
    setUploadSuccess(null);
    const validFiles: File[] = [];

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (!isValidFileType(file)) {
        setUploadError(`Unsupported file type: ${file.name}. Only PDF (.pdf) and TXT (.txt) files are allowed.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`File too large: ${file.name}. Maximum size allowed is 10 MB.`);
        return;
      }
      validFiles.push(file);
    }

    setSelectedFiles((prev) => {
      const updated = [...prev, ...validFiles];
      if (updated.length > 10) {
        setUploadError('Maximum of 10 files can be selected at a time.');
        return prev;
      }
      return updated;
    });
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadError(null);
    setUploadSuccess(null);
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        setUploadSuccess(`Successfully uploaded ${selectedFiles.length} file(s).`);
        onUploadSuccess(response.data.documents);
        setSelectedFiles([]);
      } else {
        setUploadError('Upload failed. Please try again.');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'File upload failed.';
      setUploadError(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[#151b2d] border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col">
      {/* Top Section */}
      <h3 className="font-semibold text-lg text-slate-200 mb-4">Upload Documents</h3>

      {/* Middle Section: Drag and Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={triggerFileSelect}
        className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[140px] text-center ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-700 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/70'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          multiple
          className="hidden"
          accept=".pdf,.txt"
        />
        <div className="text-3xl mb-2">📥</div>
        <p className="text-slate-350 text-sm font-medium">
          Drag & drop files here, or <span className="text-blue-400 hover:underline">browse</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">Supports PDF (.pdf) and TXT (.txt) up to 10MB each</p>
      </div>

      {/* Feedback Messages */}
      {uploadError && (
        <div className="mt-4 p-3 bg-red-950/40 border border-red-900/60 text-red-400 text-xs rounded-lg">
          ⚠️ {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 text-xs rounded-lg">
          ✅ {uploadSuccess}
        </div>
      )}

      {/* Bottom Section: Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Selected Files ({selectedFiles.length})
            </span>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-[10px] text-slate-500 hover:text-slate-350 transition-colors uppercase font-bold"
            >
              Clear All
            </button>
          </div>
          
          <ul className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {selectedFiles.map((file, idx) => {
              const isPdf = file.name.endsWith('.pdf');
              return (
                <li
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg hover:border-slate-700/60 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-xl shrink-0">{isPdf ? '📕' : '📄'}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate pr-2">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatFileSize(file.size)} &bull; {isPdf ? 'PDF' : 'Text'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="text-slate-500 hover:text-red-400 p-1 rounded-md hover:bg-slate-800/40 transition-all shrink-0"
                    aria-label="Remove file"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Upload Trigger Button */}
          <button
            onClick={uploadFiles}
            disabled={isUploading}
            className={`w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all shadow-md flex items-center justify-center space-x-2 ${
              isUploading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4.5 w-4.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              <span>Upload to Workbench</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
