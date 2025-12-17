"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PDFDocument } from "pdf-lib";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";

interface FileInfo {
  name: string;
  size: string;
  pageCount: number;
}

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileSelect = async (file: File) => {
    setError(null);
    setLoading(true);
    setFileInfo(null);

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Parse PDF and get page count
      const pdfDoc = await PDFDocument.load(uint8Array, {
        ignoreEncryption: true,
      });
      const pageCount = pdfDoc.getPageCount();

      if (pageCount === 0) {
        setError("PDF has no pages");
        setLoading(false);
        return;
      }

      // Store file info
      const info: FileInfo = {
        name: file.name,
        size: formatFileSize(file.size),
        pageCount,
      };
      setFileInfo(info);

      // Store PDF data for editor
      const base64 = btoa(
        uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), ""),
      );
      sessionStorage.setItem("pdfData", base64);
      sessionStorage.setItem("pdfFileName", file.name);
      sessionStorage.setItem("pdfPageCount", pageCount.toString());

      setLoading(false);

      // Navigate to editor after short delay to show file info
      setTimeout(() => {
        router.push("/editor");
      }, 500);
    } catch (err) {
      console.error("PDF parsing error:", err);
      setError("Failed to read PDF. The file may be corrupted or encrypted.");
      setLoading(false);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setFileInfo(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">PDF Combiner</h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
          Combine multiple PDF pages onto single sheets. Choose 2-up or 4-up
          layouts with customizable spacing.
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm max-w-lg w-full text-center">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="w-full max-w-lg p-8 border-2 border-gray-300 rounded-lg text-center bg-white">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Reading PDF...</p>
          </div>
        ) : fileInfo ? (
          /* File info display */
          <div className="w-full max-w-lg p-6 border-2 border-green-300 rounded-lg bg-green-50">
            <div className="flex items-center gap-3">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-medium text-gray-900">{fileInfo.name}</p>
                <p className="text-sm text-gray-600">
                  {fileInfo.size} • {fileInfo.pageCount} page
                  {fileInfo.pageCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Redirecting to editor...
            </p>
          </div>
        ) : (
          <UploadZone onFileSelect={handleFileSelect} onError={handleError} />
        )}

        <div className="mt-8 text-sm text-gray-500">
          <p>How it works:</p>
          <ol className="mt-2 list-decimal list-inside space-y-1">
            <li>Upload your PDF file</li>
            <li>Choose 2-up or 4-up layout</li>
            <li>Select spacing preference</li>
            <li>Download your combined PDF</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
