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
    if (typeof PDFParse !== "function") {
      console.error(`❌ PDFParse is not a function, got: ${typeof PDFParse}`);
      return null;
    }
    const data = await PDFParse(buffer);
    console.log(`✅ Extracted ${data.text.length} characters from PDF`);
    console.log(`📄 PDF has ${data.numpages} pages`);
    return data.text;
  } catch (error) {
    console.error("❌ Error extracting PDF text:", error);
    return null;
  }
}
__name(extractTextFromPdfUrl, "extractTextFromPdfUrl");
export {
  extractTextFromPdfUrl
};
//# sourceMappingURL=pdf-parser-M3OKQP7F.mjs.map
