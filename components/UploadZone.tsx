"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  onError: (error: string) => void;
}

export default function UploadZone({ onFileSelect, onError }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return "Please upload a PDF file";
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return "File size exceeds 20MB limit";
    }

    return null;
  };

  const handleFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      onError(error);
      return;
    }
    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full max-w-lg p-8 border-2 border-dashed rounded-lg text-center
        cursor-pointer transition-all duration-200 backdrop-blur-sm
        ${
          isDragging
            ? "border-amber-400 bg-teal-600/70"
            : "border-teal-400 bg-teal-800/50 hover:border-amber-400 hover:bg-teal-700/60"
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Icon */}
      <div className="mb-4">
        <svg
          className={`mx-auto h-12 w-12 ${isDragging ? "text-amber-400" : "text-teal-300"}`}
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Instructions */}
      <p
        className={`text-lg font-medium ${isDragging ? "text-amber-300" : "text-white"}`}
      >
        {isDragging ? "Drop your PDF here" : "Drag & drop your PDF here"}
      </p>
      <p className="mt-1 text-sm text-teal-200">or click to browse</p>
      <p className="mt-3 text-xs text-teal-300">PDF files only, max 20MB</p>
    </div>
  );
}
