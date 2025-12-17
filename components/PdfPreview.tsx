"use client";

import { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { combinePages, LayoutType, SpacingType } from "@/lib/pdf-processor";

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfPreviewProps {
  pdfData: string; // base64 encoded PDF
  layout: LayoutType;
  spacing: SpacingType;
}

export default function PdfPreview({ pdfData, layout, spacing }: PdfPreviewProps) {
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
  }, [pdfData, layout, spacing]);

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
      const processedBytes = await combinePages(bytes, { layout, spacing });

      if (abortRef.current) return;

      // Load the processed PDF with pdf.js for rendering
      const pdf = await pdfjsLib.getDocument({ data: processedBytes }).promise;
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
      }

      if (!abortRef.current) {
        setPreviews(pageImages);
        setLoading(false);
      }
    } catch (err) {
      console.error("Preview generation error:", err);
      if (!abortRef.current) {
        setError("Failed to generate preview");
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Generating preview...</p>
        <p className="text-xs text-gray-400 mt-1">
          {layout} layout with {spacing} spacing
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-red-600">
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
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-4 text-sm text-gray-600">
        {totalPages} output page{totalPages !== 1 ? "s" : ""} • {layout} • {spacing}
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {previews.map((src, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg overflow-hidden"
          >
            <div className="p-2 bg-gray-100 text-xs text-gray-500 text-center border-b">
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
        <p className="mt-4 text-sm text-gray-500">
          +{totalPages - 3} more page{totalPages - 3 !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
