import {
  __name,
  init_esm
} from "./chunk-7VV2K5OU.mjs";

// src/lib/pdf-parser.ts
init_esm();
async function extractTextFromPdfUrl(pdfUrl) {
  try {
    console.log(`📄 Fetching PDF from: ${pdfUrl}`);
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      console.error(`❌ Failed to fetch PDF: ${response.status} ${response.statusText}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`📄 PDF downloaded, size: ${buffer.length} bytes`);
    const { PDFParse } = await import("./esm-MWHPTNDD.mjs");
    const parser = new PDFParse();
    const data = await parser.loadPDF(buffer);
    console.log(`✅ Extracted ${data.text?.length || 0} characters from PDF`);
    console.log(`📄 PDF has ${data.numpages || "unknown"} pages`);
    return data.text || null;
  } catch (error) {
    console.error("❌ Error extracting PDF text:", error);
    return null;
  }
}
__name(extractTextFromPdfUrl, "extractTextFromPdfUrl");
export {
  extractTextFromPdfUrl
};
//# sourceMappingURL=pdf-parser-ACVWIIAB.mjs.map
