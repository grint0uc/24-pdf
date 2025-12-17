import { PDFDocument, PDFPage } from "pdf-lib";

export type LayoutType = "2-up" | "4-up";
export type SpacingType = "snug" | "regular" | "spacious";

// Letter size in points (8.5 x 11 inches)
const LETTER_WIDTH = 612;
const LETTER_HEIGHT = 792;

// Landscape dimensions
const OUTPUT_WIDTH = LETTER_HEIGHT; // 792 points (11 inches)
const OUTPUT_HEIGHT = LETTER_WIDTH; // 612 points (8.5 inches)

// Spacing presets as margin percentages
const SPACING_MARGINS: Record<SpacingType, number> = {
  snug: 0.02, // 2% margin
  regular: 0.05, // 5% margin
  spacious: 0.10, // 10% margin
};

interface ProcessOptions {
  layout: LayoutType;
  spacing: SpacingType;
}

interface PagePlacement {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculate the placements for pages based on layout and spacing
 */
function calculatePlacements(
  layout: LayoutType,
  spacing: SpacingType
): PagePlacement[] {
  const margin = SPACING_MARGINS[spacing];
  const marginX = OUTPUT_WIDTH * margin;
  const marginY = OUTPUT_HEIGHT * margin;
  const gap = Math.min(marginX, marginY);

  if (layout === "2-up") {
    // 2 pages side by side
    const availableWidth = OUTPUT_WIDTH - marginX * 2 - gap;
    const availableHeight = OUTPUT_HEIGHT - marginY * 2;
    const cellWidth = availableWidth / 2;
    const cellHeight = availableHeight;

    return [
      { x: marginX, y: marginY, width: cellWidth, height: cellHeight },
      { x: marginX + cellWidth + gap, y: marginY, width: cellWidth, height: cellHeight },
    ];
  } else {
    // 4-up: 2x2 grid
    const availableWidth = OUTPUT_WIDTH - marginX * 2 - gap;
    const availableHeight = OUTPUT_HEIGHT - marginY * 2 - gap;
    const cellWidth = availableWidth / 2;
    const cellHeight = availableHeight / 2;

    return [
      // Top row (left to right)
      { x: marginX, y: marginY + cellHeight + gap, width: cellWidth, height: cellHeight },
      { x: marginX + cellWidth + gap, y: marginY + cellHeight + gap, width: cellWidth, height: cellHeight },
      // Bottom row (left to right)
      { x: marginX, y: marginY, width: cellWidth, height: cellHeight },
      { x: marginX + cellWidth + gap, y: marginY, width: cellWidth, height: cellHeight },
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
  targetHeight: number
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
  options: ProcessOptions
): Promise<Uint8Array> {
  const { layout, spacing } = options;
  const pagesPerSheet = layout === "2-up" ? 2 : 4;

  // Load the source PDF
  const sourcePdf = await PDFDocument.load(pdfBytes, {
    ignoreEncryption: true,
  });
  const sourcePages = sourcePdf.getPages();
  const totalPages = sourcePages.length;

  // Create a new PDF for output
  const outputPdf = await PDFDocument.create();

  // Calculate how many output pages we need
  const outputPageCount = Math.ceil(totalPages / pagesPerSheet);
  const placements = calculatePlacements(layout, spacing);

  for (let outputPageIndex = 0; outputPageIndex < outputPageCount; outputPageIndex++) {
    // Create a new landscape page
    const outputPage = outputPdf.addPage([OUTPUT_WIDTH, OUTPUT_HEIGHT]);

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
        placement.height
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
export function getOutputPageCount(sourcePages: number, layout: LayoutType): number {
  const pagesPerSheet = layout === "2-up" ? 2 : 4;
  return Math.ceil(sourcePages / pagesPerSheet);
}
