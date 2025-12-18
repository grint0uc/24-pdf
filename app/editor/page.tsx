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
import { getPDF, clearPDF } from "@/lib/pdf-storage";
import {
  LayoutType,
  SpacingType,
  OrientationType,
  getOutputPageCount,
} from "@/lib/pdf-processor";

interface PdfInfo {
  fileName: string;
  pageCount: number;
  data: Uint8Array;
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
    // Load PDF from IndexedDB
    const loadPDF = async () => {
      try {
        const stored = await getPDF();
        if (!stored) {
          router.push("/");
          return;
        }

        setPdfInfo({
          fileName: stored.fileName,
          pageCount: stored.pageCount,
          data: stored.data,
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed to load PDF from storage:", err);
        router.push("/");
      }
    };

    loadPDF();
  }, [router]);

  const handleSuccess = () => {
    setShowSuccess(true);
  };

  const handleStartOver = async () => {
    await clearPDF();
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
          <div className="animate-spin h-8 w-8 border-4 border-[#c41e3a] border-t-transparent rounded-full"></div>
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
          <div className="text-center max-w-md bg-brown-700 p-8 rounded-xl border border-brown-500 shadow-lg">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-[#c41e3a]"
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
            <p className="text-brown-200 mb-8">
              Your combined PDF has been downloaded successfully.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleStartOver}
                className="w-full py-3 px-4 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a31830] transition-colors font-medium"
              >
                Start Over
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-3 px-4 bg-brown-600 text-white rounded-lg hover:bg-brown-500 transition-colors font-medium"
              >
                Back to Editor
              </button>
            </div>
            <div className="mt-8 pt-6 border-t border-brown-500">
              <p className="text-sm text-brown-300 mb-3">Enjoying 2up4up?</p>
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
        <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-brown-600 bg-brown-800 p-4 flex flex-col">
          {/* File info */}
          {pdfInfo && (
            <div className="mb-4 p-3 bg-brown-700/50 rounded-lg border border-brown-600">
              <p className="text-sm font-medium text-white truncate">
                {pdfInfo.fileName}
              </p>
              <p className="text-xs text-brown-300 mt-1">
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
              className="inline-flex items-center text-sm text-brown-300 hover:text-white transition-colors"
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
        <div className="flex-1 overflow-auto bg-brown-900 min-h-[400px]">
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
