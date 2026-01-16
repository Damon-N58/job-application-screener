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

        // Import pdf-parse and use PDFParse as a class
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { PDFParse } = await import('pdf-parse') as any

        // PDFParse is a class - instantiate it and call parse method
        const parser = new PDFParse()
        const data = await parser.loadPDF(buffer)

        console.log(`✅ Extracted ${data.text?.length || 0} characters from PDF`)
        console.log(`📄 PDF has ${data.numpages || 'unknown'} pages`)

        return data.text || null
    } catch (error) {
        console.error('❌ Error extracting PDF text:', error)
        return null
    }
}
