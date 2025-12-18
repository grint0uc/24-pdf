"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PDFDocument } from "pdf-lib";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import { storePDF } from "@/lib/pdf-storage";

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

      // Try to load PDF with various recovery options
      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(uint8Array, {
          ignoreEncryption: true,
          updateMetadata: false,
        });
      } catch (firstError) {
        console.warn(
          "First load attempt failed, trying with throwOnInvalidObject: false",
          firstError,
        );
        try {
          // Try with more lenient parsing
          pdfDoc = await PDFDocument.load(uint8Array, {
            ignoreEncryption: true,
            updateMetadata: false,
            throwOnInvalidObject: false,
          });
        } catch (secondError) {
          console.warn(
            "Second load attempt failed, trying to repair PDF structure",
            secondError,
          );
          // Last resort: try loading with all recovery options
          pdfDoc = await PDFDocument.load(uint8Array, {
            ignoreEncryption: true,
            updateMetadata: false,
            throwOnInvalidObject: false,
            capNumbers: true,
          });
        }
      }

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

      // Store PDF in IndexedDB (handles large files)
      await storePDF(uint8Array, file.name, pageCount);

      setLoading(false);

      setTimeout(() => {
        router.push("/editor");
      }, 500);
    } catch (err) {
      console.error("PDF parsing error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);

      // Provide more specific error messages
      if (
        errorMessage.toLowerCase().includes("quota") ||
        errorMessage.toLowerCase().includes("storage")
      ) {
        setError(
          `File too large for browser storage (${formatFileSize(file.size)}). Try a smaller file.`,
        );
      } else if (
        errorMessage.toLowerCase().includes("password") ||
        errorMessage.toLowerCase().includes("encrypt")
      ) {
        setError(
          "This PDF is password-protected. Please remove the password and try again.",
        );
      } else if (
        errorMessage.toLowerCase().includes("invalid") ||
        errorMessage.toLowerCase().includes("parse")
      ) {
        setError(
          "Could not parse this PDF. It may use an unsupported format. Try re-saving it from another PDF viewer.",
        );
      } else if (
        errorMessage.toLowerCase().includes("xref") ||
        errorMessage.toLowerCase().includes("trailer")
      ) {
        setError(
          "This PDF has a damaged structure. Try opening and re-saving it in a PDF viewer like Preview or Adobe Reader.",
        );
      } else if (
        errorMessage.toLowerCase().includes("call stack") ||
        errorMessage.toLowerCase().includes("memory")
      ) {
        setError(
          `File too large to process (${formatFileSize(file.size)}). Try a smaller file.`,
        );
      } else {
        setError(
          "Failed to read PDF. Try opening and re-saving it in another PDF application.",
        );
      }
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
          <h1 className="text-5xl md:text-7xl font-black mb-4 text-white drop-shadow-lg">
            2up 4up your PDF
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="px-3 py-1 bg-brown-700/50 border border-brown-500 rounded-full text-brown-200 text-sm font-medium">
              2-up
            </span>
            <span className="text-brown-400">+</span>
            <span className="px-3 py-1 bg-brown-700/50 border border-brown-500 rounded-full text-brown-200 text-sm font-medium">
              4-up
            </span>
            <span className="text-brown-400">=</span>
            <span className="px-3 py-1 bg-[#c41e3a] border border-[#c41e3a] rounded-full text-white text-sm font-medium">
              Save Paper
            </span>
          </div>
          <p className="text-lg md:text-xl text-brown-200 max-w-lg mx-auto leading-relaxed">
            The free n-up PDF online tool to combine PDF pages and print
            <span className="text-[#c41e3a] font-semibold">
              {" "}
              multiple pages per sheet
            </span>{" "}
            with
            <span className="text-white font-semibold">
              {" "}
              customizable layouts
            </span>
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-[#c41e3a]/20 border-2 border-[#c41e3a] rounded-xl text-white text-sm max-w-lg w-full text-center">
            <span className="font-medium">Oops!</span> {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="w-full max-w-lg p-8 border-2 border-brown-500 rounded-2xl text-center bg-brown-700/50">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-brown-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#c41e3a] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-white font-medium">Reading your PDF...</p>
            <p className="text-brown-300 text-sm mt-1">Hang tight!</p>
          </div>
        ) : fileInfo ? (
          /* File info display */
          <div className="w-full max-w-lg p-6 border-2 border-brown-500 rounded-2xl bg-brown-700/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#c41e3a] rounded-xl flex items-center justify-center">
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
                <p className="text-brown-200">
                  {fileInfo.size} • {fileInfo.pageCount} page
                  {fileInfo.pageCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-brown-200">
              <div className="flex-1 h-2 bg-brown-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c41e3a] rounded-full animate-pulse"
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
          <div className="p-4 bg-brown-700/50 rounded-xl border border-brown-500 text-center group hover:border-[#c41e3a] transition-all duration-300">
            <div
              className="w-12 h-12 mx-auto mb-3 bg-[#c41e3a] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
              aria-hidden="true"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
            <p className="text-sm text-brown-300">Drag & drop your PDF file</p>
          </div>

          <div className="p-4 bg-brown-700/50 rounded-xl border border-brown-500 text-center group hover:border-[#c41e3a] transition-all duration-300">
            <div
              className="w-12 h-12 mx-auto mb-3 bg-brown-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
              aria-hidden="true"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
            <p className="text-sm text-brown-300">
              Print 2 pages on 1 sheet or 4-up
            </p>
          </div>

          <div className="p-4 bg-brown-700/50 rounded-xl border border-brown-500 text-center group hover:border-[#c41e3a] transition-all duration-300">
            <div
              className="w-12 h-12 mx-auto mb-3 bg-brown-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
              aria-hidden="true"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
            <p className="text-sm text-brown-300">
              Get your PDF page layout instantly
            </p>
          </div>
        </div>

        {/* Privacy badge */}
        <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-brown-700/30 rounded-full border border-brown-600">
          <svg
            className="w-4 h-4 text-brown-300"
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
          <span className="text-sm text-brown-300">
            100% private - runs entirely in your browser
          </span>
        </div>

        {/* FAQ Section */}
        <section className="mt-16 max-w-3xl w-full">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="p-5 bg-brown-700/50 rounded-xl border border-brown-500">
              <h3 className="font-bold text-[#c41e3a] mb-2">
                What is 2-up and 4-up printing?
              </h3>
              <p className="text-brown-200 text-sm leading-relaxed">
                2-up printing places 2 pages side by side on a single sheet,
                while 4-up fits 4 pages in a 2x2 grid. Also known as n-up PDF,
                this PDF page layout tool is perfect for saving paper when
                printing handouts, lecture notes, or documents. Print multiple
                pages per sheet easily!
              </p>
            </div>

            <div className="p-5 bg-brown-700/50 rounded-xl border border-brown-500">
              <h3 className="font-bold text-[#c41e3a] mb-2">
                How do I combine PDF pages?
              </h3>
              <p className="text-brown-200 text-sm leading-relaxed">
                Simply drag and drop your PDF file onto the upload area, choose
                your preferred layout to print 2 pages on 1 sheet or 4-up,
                select the orientation and spacing, then click download. Your
                combined PDF pages are ready in seconds with this free n-up PDF
                online tool!
              </p>
            </div>

            <div className="p-5 bg-brown-700/50 rounded-xl border border-brown-500">
              <h3 className="font-bold text-[#c41e3a] mb-2">
                Is my PDF secure and private?
              </h3>
              <p className="text-brown-200 text-sm leading-relaxed">
                Absolutely! Your PDF never leaves your device. All processing
                happens directly in your browser using JavaScript. We don&apos;t
                upload, store, or have access to any of your files. It&apos;s
                100% private.
              </p>
            </div>

            <div className="p-5 bg-brown-700/50 rounded-xl border border-brown-500">
              <h3 className="font-bold text-[#c41e3a] mb-2">
                Why use 2up4up instead of other PDF page layout tools?
              </h3>
              <p className="text-brown-200 text-sm leading-relaxed">
                Unlike other PDF combiner tools, 2up4up is completely free with
                no signup required, works offline after loading, processes files
                instantly in your browser, and never uploads your documents to
                any server. The best way to combine PDF pages - fast, private,
                and simple.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
