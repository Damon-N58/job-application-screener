import {
  generateText,
  openai
} from "./chunk-WUVDVLAP.mjs";
import "./chunk-GKFVX6KG.mjs";
import "./chunk-7D76SFG3.mjs";
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
    const base64 = buffer.toString("base64");
    console.log(`📄 PDF downloaded, size: ${buffer.length} bytes`);
    console.log(`📄 Sending to GPT-4o for text extraction...`);
    const dataUrl = `data:application/pdf;base64,${base64}`;
    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract and return ALL the text content from this PDF document. Return ONLY the extracted text, nothing else. Maintain the original structure and formatting as much as possible."
            },
            {
              type: "file",
              data: dataUrl
            }
          ]
        }
      ]
    });
    if (text && text.trim()) {
      console.log(`✅ Extracted ${text.length} characters from PDF via GPT-4o`);
      return text;
    }
    console.log("⚠️ GPT-4o returned empty text");
    return null;
  } catch (error) {
    console.error("❌ Error extracting PDF text:", error);
    return null;
  }
}
__name(extractTextFromPdfUrl, "extractTextFromPdfUrl");
export {
  extractTextFromPdfUrl
};
//# sourceMappingURL=pdf-parser-7HNHQOU4.mjs.map
