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
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const pdfDoc = await PDFDocument.load(uint8Array, {
        ignoreEncryption: true,
      });
      const pageCount = pdfDoc.getPageCount();

      if (pageCount === 0) {
        setError("PDF has no pages");
        setLoading(false);
        return;
      }

      const info: FileInfo = {
        name: file.name,
        size: formatFileSize(file.size),
        pageCount,
      };
      setFileInfo(info);

      const base64 = btoa(
        uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), ""),
      );
      sessionStorage.setItem("pdfData", base64);
      sessionStorage.setItem("pdfFileName", file.name);
      sessionStorage.setItem("pdfPageCount", pageCount.toString());

      setLoading(false);

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
        {/* Main title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-black mb-4 text-amber-400 drop-shadow-lg">
            2up 4up your PDF
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="px-3 py-1 bg-amber-400/20 border border-amber-400/50 rounded-full text-amber-300 text-sm font-medium">
              2-up
            </span>
            <span className="text-teal-400">+</span>
            <span className="px-3 py-1 bg-orange-400/20 border border-orange-400/50 rounded-full text-orange-300 text-sm font-medium">
              4-up
            </span>
            <span className="text-teal-400">=</span>
            <span className="px-3 py-1 bg-teal-400/20 border border-teal-400/50 rounded-full text-teal-300 text-sm font-medium">
              Save Paper
            </span>
          </div>
          <p className="text-lg md:text-xl text-teal-100 max-w-lg mx-auto leading-relaxed">
            Combine multiple PDF pages onto single sheets with
            <span className="text-amber-300 font-semibold">
              {" "}
              customizable layouts
            </span>{" "}
            and
            <span className="text-orange-300 font-semibold">
              {" "}
              spacing options
            </span>
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border-2 border-red-400 rounded-xl text-red-200 text-sm max-w-lg w-full text-center backdrop-blur-sm">
            <span className="font-medium">Oops!</span> {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="w-full max-w-lg p-8 border-2 border-amber-400 rounded-2xl text-center bg-teal-800/50 backdrop-blur-sm">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-amber-400/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <div
                className="absolute inset-2 border-4 border-orange-400 border-b-transparent rounded-full animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "0.8s",
                }}
              ></div>
            </div>
            <p className="text-teal-100 font-medium">Reading your PDF...</p>
            <p className="text-teal-300 text-sm mt-1">Hang tight!</p>
          </div>
        ) : fileInfo ? (
          /* File info display */
          <div className="w-full max-w-lg p-6 border-2 border-teal-400 rounded-2xl bg-teal-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-500 rounded-xl flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-white"
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
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-lg">{fileInfo.name}</p>
                <p className="text-teal-200">
                  {fileInfo.size} • {fileInfo.pageCount} page
                  {fileInfo.pageCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-teal-200">
              <div className="flex-1 h-2 bg-teal-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full animate-pulse"
                  style={{ width: "100%" }}
                ></div>
              </div>
              <span className="text-sm">Redirecting...</span>
            </div>
          </div>
        ) : (
          <UploadZone onFileSelect={handleFileSelect} onError={handleError} />
        )}

        {/* Features section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
          <div className="p-4 bg-teal-800/40 backdrop-blur-sm rounded-xl border border-teal-600/50 text-center group hover:border-amber-400/50 hover:bg-teal-700/40 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-3 bg-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-white mb-1">Upload</h3>
            <p className="text-sm text-teal-300">Drag & drop your PDF</p>
          </div>

          <div className="p-4 bg-teal-800/40 backdrop-blur-sm rounded-xl border border-teal-600/50 text-center group hover:border-orange-400/50 hover:bg-teal-700/40 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-3 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <h3 className="font-bold text-white mb-1">Customize</h3>
            <p className="text-sm text-teal-300">Choose layout & spacing</p>
          </div>

          <div className="p-4 bg-teal-800/40 backdrop-blur-sm rounded-xl border border-teal-600/50 text-center group hover:border-teal-400/50 hover:bg-teal-700/40 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-3 bg-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <h3 className="font-bold text-white mb-1">Download</h3>
            <p className="text-sm text-teal-300">Get your combined PDF</p>
          </div>
        </div>

        {/* Privacy badge */}
        <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-teal-800/30 rounded-full border border-teal-600/30">
          <svg
            className="w-4 h-4 text-teal-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span className="text-sm text-teal-300">
            100% private - runs entirely in your browser
          </span>
        </div>
      </main>
    </div>
  );
}
