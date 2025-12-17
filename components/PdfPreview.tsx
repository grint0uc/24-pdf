"use client";

import { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  combinePages,
  LayoutType,
  SpacingType,
  OrientationType,
} from "@/lib/pdf-processor";

// Set worker path to local file instead of CDN for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfPreviewProps {
  pdfData: string; // base64 encoded PDF
  layout: LayoutType;
  spacing: SpacingType;
  orientation: OrientationType;
}

export default function PdfPreview({
  pdfData,
  layout,
  spacing,
  orientation,
}: PdfPreviewProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    generatePreview();

    return () => {
      abortRef.current = true;
    };
  }, [pdfData, layout, spacing, orientation]);

  const generatePreview = async () => {
    setLoading(true);
    setError(null);

    try {
      // Decode base64 PDF data
      const binaryString = atob(pdfData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Process the PDF with current options
      const processedBytes = await combinePages(bytes, {
        layout,
        spacing,
        orientation,
      });

      if (abortRef.current) return;

      // Load the processed PDF with pdf.js for rendering
      const loadingTask = pdfjsLib.getDocument({ data: processedBytes });

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      setTotalPages(numPages);

      // Render first 3 pages max
      const pagesToRender = Math.min(numPages, 3);
      const pageImages: string[] = [];

      for (let i = 1; i <= pagesToRender; i++) {
        if (abortRef.current) return;

        const page = await pdf.getPage(i);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        // Create canvas for rendering
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        pageImages.push(canvas.toDataURL("image/png"));

        // Clean up page resources
        page.cleanup();
      }

      if (!abortRef.current) {
        setPreviews(pageImages);
        setLoading(false);
      }

      // Clean up PDF document
      pdf.destroy();
    } catch (err) {
      console.error("Preview generation error:", err);
      if (!abortRef.current) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        if (
          errorMessage.includes("worker") ||
          errorMessage.includes("Worker")
        ) {
          setError("Failed to load PDF renderer. Please refresh the page.");
        } else if (
          errorMessage.includes("Invalid PDF") ||
          errorMessage.includes("password")
        ) {
          setError("Invalid or password-protected PDF");
        } else {
          setError("Failed to generate preview. Please try again.");
        }
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin h-10 w-10 border-4 border-amber-400 border-t-transparent rounded-full mb-4"></div>
        <p className="text-teal-100">Generating preview...</p>
        <p className="text-xs text-teal-300 mt-1">
          {layout} • {orientation} • {spacing}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-red-300">
        <svg
          className="h-12 w-12 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>{error}</p>
        <button
          onClick={() => generatePreview()}
          className="mt-4 px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-4 text-sm text-teal-200">
        {totalPages} output page{totalPages !== 1 ? "s" : ""} • {layout} •{" "}
        {orientation} • {spacing}
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {previews.map((src, index) => (
          <div
            key={index}
            className="bg-teal-800/60 shadow-lg rounded-lg overflow-hidden border border-teal-600"
          >
            <div className="p-2 bg-teal-700/50 text-xs text-teal-200 text-center border-b border-teal-600">
              Page {index + 1}
            </div>
            <img
              src={src}
              alt={`Page ${index + 1} preview`}
              className="max-w-[300px] max-h-[400px] object-contain"
            />
          </div>
        ))}
      </div>

      {totalPages > 3 && (
        <p className="mt-4 text-sm text-teal-300">
          +{totalPages - 3} more page{totalPages - 3 !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
