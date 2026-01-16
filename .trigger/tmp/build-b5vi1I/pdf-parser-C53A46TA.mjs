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
    const pdfParseModule = await import("./esm-MWHPTNDD.mjs");
    console.log(`📄 pdf-parse module type: ${typeof pdfParseModule}`);
    console.log(`📄 pdf-parse keys: ${Object.keys(pdfParseModule).join(", ")}`);
    let pdf;
    if (typeof pdfParseModule === "function") {
      pdf = pdfParseModule;
    } else if (typeof pdfParseModule.default === "function") {
      pdf = pdfParseModule.default;
    } else if (typeof pdfParseModule.default?.default === "function") {
      pdf = pdfParseModule.default.default;
    } else {
      console.error(`❌ Could not find pdf-parse function. Module structure:`, JSON.stringify(pdfParseModule, null, 2));
      return null;
    }
    const data = await pdf(buffer);
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
//# sourceMappingURL=pdf-parser-C53A46TA.mjs.map
