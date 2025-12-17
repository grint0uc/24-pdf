"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import LayoutSelector from "@/components/LayoutSelector";
import SpacingSelector from "@/components/SpacingSelector";
import OrientationSelector from "@/components/OrientationSelector";
import PdfPreview from "@/components/PdfPreview";
import ProcessButton from "@/components/ProcessButton";
import TipButton from "@/components/TipButton";
import {
  LayoutType,
  SpacingType,
  OrientationType,
  getOutputPageCount,
} from "@/lib/pdf-processor";

interface PdfInfo {
  fileName: string;
  pageCount: number;
  data: string;
}

export default function EditorPage() {
  const router = useRouter();
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<LayoutType>("2-up");
  const [spacing, setSpacing] = useState<SpacingType>("regular");
  const [orientation, setOrientation] = useState<OrientationType>("landscape");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load PDF info from sessionStorage
    const fileName = sessionStorage.getItem("pdfFileName");
    const pageCount = sessionStorage.getItem("pdfPageCount");
    const pdfData = sessionStorage.getItem("pdfData");

    if (!fileName || !pageCount || !pdfData) {
      // No PDF loaded, redirect to home
      router.push("/");
      return;
    }

    setPdfInfo({
      fileName,
      pageCount: parseInt(pageCount, 10),
      data: pdfData,
    });
    setLoading(false);
  }, [router]);

  const handleSuccess = () => {
    setShowSuccess(true);
  };

  const handleStartOver = () => {
    sessionStorage.removeItem("pdfData");
    sessionStorage.removeItem("pdfFileName");
    sessionStorage.removeItem("pdfPageCount");
    router.push("/");
  };

  const outputPageCount = pdfInfo
    ? getOutputPageCount(pdfInfo.pageCount, layout)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-amber-400 border-t-transparent rounded-full"></div>
        </main>
      </div>
    );
  }

  // Success screen
  if (showSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md bg-teal-800/60 backdrop-blur-sm p-8 rounded-xl border border-teal-600">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-teal-300"
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
            <h2 className="text-2xl font-bold text-white mb-2">
              Download Complete!
            </h2>
            <p className="text-teal-200 mb-8">
              Your combined PDF has been downloaded successfully.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleStartOver}
                className="w-full py-3 px-4 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition-colors font-medium"
              >
                Start Over
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-3 px-4 bg-teal-600 text-teal-100 rounded-lg hover:bg-teal-500 transition-colors font-medium"
              >
                Back to Editor
              </button>
            </div>
            <div className="mt-8 pt-6 border-t border-teal-600">
              <p className="text-sm text-teal-300 mb-3">
                Enjoying PDF Combiner?
              </p>
              <TipButton />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-teal-600 bg-teal-800/80 backdrop-blur-sm p-4 flex flex-col">
          {/* File info */}
          {pdfInfo && (
            <div className="mb-4 p-3 bg-teal-700/50 rounded-lg border border-teal-600">
              <p className="text-sm font-medium text-white truncate">
                {pdfInfo.fileName}
              </p>
              <p className="text-xs text-teal-300 mt-1">
                {pdfInfo.pageCount} page{pdfInfo.pageCount !== 1 ? "s" : ""} →{" "}
                {outputPageCount} output page{outputPageCount !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Options */}
          <div className="space-y-6">
            <LayoutSelector value={layout} onChange={setLayout} />
            <OrientationSelector
              value={orientation}
              onChange={setOrientation}
            />
            <SpacingSelector value={spacing} onChange={setSpacing} />

            {pdfInfo && (
              <ProcessButton
                pdfData={pdfInfo.data}
                fileName={pdfInfo.fileName}
                layout={layout}
                spacing={spacing}
                orientation={orientation}
                onSuccess={handleSuccess}
              />
            )}
          </div>

          {/* Back link */}
          <div className="mt-auto pt-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-teal-300 hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Upload different file
            </Link>
          </div>
        </aside>

        {/* Preview area */}
        <div className="flex-1 overflow-auto bg-teal-900/50 min-h-[400px]">
          {pdfInfo && (
            <PdfPreview
              pdfData={pdfInfo.data}
              layout={layout}
              spacing={spacing}
              orientation={orientation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
