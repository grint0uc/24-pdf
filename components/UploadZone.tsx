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
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return "Please upload a PDF file";
    }

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
    e.target.value = "";
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full max-w-lg p-10 rounded-2xl text-center
        cursor-pointer transition-all duration-300 backdrop-blur-sm
        group overflow-hidden
        ${
          isDragging
            ? "bg-amber-400/20 border-2 border-amber-400 scale-105"
            : "bg-teal-800/40 border-2 border-dashed border-teal-400/50 hover:border-amber-400 hover:bg-teal-700/50"
        }
      `}
    >
      {/* Animated corner accents */}
      <div
        className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-xl transition-colors ${isDragging ? "border-amber-400" : "border-teal-400/50 group-hover:border-amber-400"}`}
      />
      <div
        className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-xl transition-colors ${isDragging ? "border-amber-400" : "border-teal-400/50 group-hover:border-amber-400"}`}
      />
      <div
        className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-xl transition-colors ${isDragging ? "border-amber-400" : "border-teal-400/50 group-hover:border-amber-400"}`}
      />
      <div
        className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-xl transition-colors ${isDragging ? "border-amber-400" : "border-teal-400/50 group-hover:border-amber-400"}`}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Icon with animation */}
      <div className="mb-6 relative">
        <div
          className={`
          mx-auto w-20 h-20 rounded-2xl flex items-center justify-center
          transition-all duration-300 group-hover:scale-110
          ${
            isDragging ? "bg-amber-500" : "bg-teal-600 group-hover:bg-amber-500"
          }
        `}
        >
          <svg
            className="h-10 w-10 text-white transition-transform group-hover:scale-110"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        {/* Ping effect when dragging */}
        {isDragging && (
          <div className="absolute inset-0 mx-auto w-20 h-20 rounded-2xl bg-amber-400/50 animate-ping" />
        )}
      </div>

      {/* Instructions */}
      <p
        className={`text-xl font-bold mb-2 transition-colors ${isDragging ? "text-amber-300" : "text-white"}`}
      >
        {isDragging ? "Drop it like it's hot!" : "Drag & drop your PDF"}
      </p>
      <p className="text-teal-200 mb-4">
        or{" "}
        <span className="text-amber-400 font-medium underline underline-offset-2">
          click to browse
        </span>
      </p>

      {/* File type badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-900/50 rounded-full">
        <svg
          className="w-4 h-4 text-red-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 18a.5.5 0 01-.5-.5v-4a.5.5 0 011 0v4a.5.5 0 01-.5.5zm3 0a.5.5 0 01-.5-.5v-4a.5.5 0 011 0v4a.5.5 0 01-.5.5zm3 0a.5.5 0 01-.5-.5v-4a.5.5 0 011 0v4a.5.5 0 01-.5.5z" />
        </svg>
        <span className="text-sm text-teal-300">PDF files only</span>
        <span className="text-teal-600">•</span>
        <span className="text-sm text-teal-300">Max 20MB</span>
      </div>
    </div>
  );
}
