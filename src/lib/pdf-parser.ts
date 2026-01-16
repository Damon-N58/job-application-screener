// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse')

/**
 * Fetches and extracts text content from a PDF at the given URL
 * Returns null if extraction fails
 */
export async function extractTextFromPdfUrl(pdfUrl: string): Promise<string | null> {
    try {
        console.log(`📄 Fetching PDF from: ${pdfUrl}`)

        const response = await fetch(pdfUrl)
        if (!response.ok) {
            console.error(`❌ Failed to fetch PDF: ${response.status} ${response.statusText}`)
            return null
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        console.log(`📄 PDF downloaded, size: ${buffer.length} bytes`)

        const data = await pdf(buffer)

        console.log(`✅ Extracted ${data.text.length} characters from PDF`)
        console.log(`📄 PDF has ${data.numpages} pages`)

        return data.text
    } catch (error) {
        console.error('❌ Error extracting PDF text:', error)
        return null
    }
}
