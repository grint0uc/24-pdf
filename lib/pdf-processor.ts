import { PDFDocument, PDFPage } from "pdf-lib";

export type LayoutType = "2-up" | "4-up";
export type SpacingType = "snug" | "regular" | "spacious";
export type OrientationType = "landscape" | "portrait";

// Letter size in points (8.5 x 11 inches)
const LETTER_WIDTH = 612;
const LETTER_HEIGHT = 792;

// Spacing presets as margin percentages
const SPACING_MARGINS: Record<SpacingType, number> = {
  snug: 0.02, // 2% margin
  regular: 0.05, // 5% margin
  spacious: 0.1, // 10% margin
};

interface ProcessOptions {
  layout: LayoutType;
  spacing: SpacingType;
  orientation: OrientationType;
}

interface PagePlacement {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Get output dimensions based on orientation
 */
function getOutputDimensions(orientation: OrientationType): {
  width: number;
  height: number;
} {
  if (orientation === "landscape") {
    return { width: LETTER_HEIGHT, height: LETTER_WIDTH }; // 792 x 612
  } else {
    return { width: LETTER_WIDTH, height: LETTER_HEIGHT }; // 612 x 792
  }
}

/**
 * Calculate the placements for pages based on layout, spacing, and orientation
 */
function calculatePlacements(
  layout: LayoutType,
  spacing: SpacingType,
  orientation: OrientationType,
): PagePlacement[] {
  const { width: outputWidth, height: outputHeight } =
    getOutputDimensions(orientation);
  const margin = SPACING_MARGINS[spacing];
  const marginX = outputWidth * margin;
  const marginY = outputHeight * margin;
  const gap = Math.min(marginX, marginY);

  if (layout === "2-up") {
    if (orientation === "landscape") {
      // 2 pages side by side (horizontal arrangement)
      const availableWidth = outputWidth - marginX * 2 - gap;
      const availableHeight = outputHeight - marginY * 2;
      const cellWidth = availableWidth / 2;
      const cellHeight = availableHeight;

      return [
        { x: marginX, y: marginY, width: cellWidth, height: cellHeight },
        {
          x: marginX + cellWidth + gap,
          y: marginY,
          width: cellWidth,
          height: cellHeight,
        },
      ];
    } else {
      // 2 pages stacked vertically (portrait)
      const availableWidth = outputWidth - marginX * 2;
      const availableHeight = outputHeight - marginY * 2 - gap;
      const cellWidth = availableWidth;
      const cellHeight = availableHeight / 2;

      return [
        {
          x: marginX,
          y: marginY + cellHeight + gap,
          width: cellWidth,
          height: cellHeight,
        },
        { x: marginX, y: marginY, width: cellWidth, height: cellHeight },
      ];
    }
  } else {
    // 4-up: 2x2 grid
    const availableWidth = outputWidth - marginX * 2 - gap;
    const availableHeight = outputHeight - marginY * 2 - gap;
    const cellWidth = availableWidth / 2;
    const cellHeight = availableHeight / 2;

    return [
      // Top row (left to right)
      {
        x: marginX,
        y: marginY + cellHeight + gap,
        width: cellWidth,
        height: cellHeight,
      },
      {
        x: marginX + cellWidth + gap,
        y: marginY + cellHeight + gap,
        width: cellWidth,
        height: cellHeight,
      },
      // Bottom row (left to right)
      { x: marginX, y: marginY, width: cellWidth, height: cellHeight },
      {
        x: marginX + cellWidth + gap,
        y: marginY,
        width: cellWidth,
        height: cellHeight,
      },
    ];
  }
}

/**
 * Scale a page to fit within the given dimensions while maintaining aspect ratio
 */
function calculateScale(
  pageWidth: number,
  pageHeight: number,
  targetWidth: number,
  targetHeight: number,
): { scale: number; offsetX: number; offsetY: number } {
  const scaleX = targetWidth / pageWidth;
  const scaleY = targetHeight / pageHeight;
  const scale = Math.min(scaleX, scaleY);

  // Center the page within the cell
  const scaledWidth = pageWidth * scale;
  const scaledHeight = pageHeight * scale;
  const offsetX = (targetWidth - scaledWidth) / 2;
  const offsetY = (targetHeight - scaledHeight) / 2;

  return { scale, offsetX, offsetY };
}

/**
 * Combine PDF pages into a multi-up layout
 */
export async function combinePages(
  pdfBytes: Uint8Array,
  options: ProcessOptions,
): Promise<Uint8Array> {
  const { layout, spacing, orientation } = options;
  const pagesPerSheet = layout === "2-up" ? 2 : 4;

  // Load the source PDF with lenient parsing options
  let sourcePdf;
  try {
    sourcePdf = await PDFDocument.load(pdfBytes, {
      ignoreEncryption: true,
      updateMetadata: false,
    });
  } catch {
    // Try with more lenient parsing if first attempt fails
    sourcePdf = await PDFDocument.load(pdfBytes, {
      ignoreEncryption: true,
      updateMetadata: false,
      throwOnInvalidObject: false,
      capNumbers: true,
    });
  }
  const sourcePages = sourcePdf.getPages();
  const totalPages = sourcePages.length;

  // Create a new PDF for output
  const outputPdf = await PDFDocument.create();

  // Get output dimensions based on orientation
  const { width: outputWidth, height: outputHeight } =
    getOutputDimensions(orientation);

  // Calculate how many output pages we need
  const outputPageCount = Math.ceil(totalPages / pagesPerSheet);
  const placements = calculatePlacements(layout, spacing, orientation);

  for (
    let outputPageIndex = 0;
    outputPageIndex < outputPageCount;
    outputPageIndex++
  ) {
    // Create a new page with the correct orientation
    const outputPage = outputPdf.addPage([outputWidth, outputHeight]);

    // Embed source pages onto this output page
    for (let slotIndex = 0; slotIndex < pagesPerSheet; slotIndex++) {
      const sourcePageIndex = outputPageIndex * pagesPerSheet + slotIndex;

      // Check if we have a page for this slot
      if (sourcePageIndex >= totalPages) {
        break;
      }

      const sourcePage = sourcePages[sourcePageIndex];
      const placement = placements[slotIndex];

      // Get source page dimensions
      const { width: srcWidth, height: srcHeight } = sourcePage.getSize();

      // Calculate scaling to fit in the cell
      const { scale, offsetX, offsetY } = calculateScale(
        srcWidth,
        srcHeight,
        placement.width,
        placement.height,
      );

      // Embed the page
      const [embeddedPage] = await outputPdf.embedPages([sourcePage]);

      // Draw the embedded page
      outputPage.drawPage(embeddedPage, {
        x: placement.x + offsetX,
        y: placement.y + offsetY,
        width: srcWidth * scale,
        height: srcHeight * scale,
      });
    }
  }

  // Save and return the output PDF
  return outputPdf.save();
}

/**
 * Get the number of output pages for a given source page count and layout
 */
export function getOutputPageCount(
  sourcePages: number,
  layout: LayoutType,
): number {
  const pagesPerSheet = layout === "2-up" ? 2 : 4;
  return Math.ceil(sourcePages / pagesPerSheet);
}
