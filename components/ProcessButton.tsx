"use client";

import { useState } from "react";
import {
  combinePages,
  LayoutType,
  SpacingType,
  OrientationType,
} from "@/lib/pdf-processor";

interface ProcessButtonProps {
  pdfData: Uint8Array;
  fileName: string;
  layout: LayoutType;
  spacing: SpacingType;
  orientation: OrientationType;
  onSuccess: () => void;
}

export default function ProcessButton({
  pdfData,
  fileName,
  layout,
  spacing,
  orientation,
  onSuccess,
}: ProcessButtonProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Process the PDF directly from Uint8Array
      const processedBytes = await combinePages(pdfData, {
        layout,
        spacing,
        orientation,
      });

      // Create download
      const blob = new Blob([new Uint8Array(processedBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      // Generate output filename
      const baseName = fileName.replace(/\.pdf$/i, "");
      const outputFileName = `${baseName}-${layout}-${orientation}.pdf`;

      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = outputFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      URL.revokeObjectURL(url);

      setProcessing(false);
      onSuccess();
    } catch (err) {
      console.error("Processing error:", err);
      setError("Failed to process PDF. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleProcess}
        disabled={processing}
        className={`
          w-full py-3 px-4 rounded-lg font-medium transition-all
          ${
            processing
              ? "bg-brown-500 cursor-not-allowed text-white"
              : "bg-[#c41e3a] hover:bg-[#a31830] text-white"
          }
        `}
      >
        {processing ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg
              className="w-5 h-5 mr-2"
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
            Process & Download
          </span>
        )}
      </button>

      {error && <p className="text-sm text-[#c41e3a] text-center">{error}</p>}
    </div>
  );
}
