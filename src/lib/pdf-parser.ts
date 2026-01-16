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

        // Import pdf-parse and use the PDFParse named export
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { PDFParse } = await import('pdf-parse') as any

        if (typeof PDFParse !== 'function') {
            console.error(`❌ PDFParse is not a function, got: ${typeof PDFParse}`)
            return null
        }

        const data = await PDFParse(buffer)

        console.log(`✅ Extracted ${data.text.length} characters from PDF`)
        console.log(`📄 PDF has ${data.numpages} pages`)

        return data.text
    } catch (error) {
        console.error('❌ Error extracting PDF text:', error)
        return null
    }
}
