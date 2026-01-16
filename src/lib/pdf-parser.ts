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

        // Try multiple import patterns for pdf-parse compatibility
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfParseModule = await import('pdf-parse') as any

        // Log what we got for debugging
        console.log(`📄 pdf-parse module type: ${typeof pdfParseModule}`)
        console.log(`📄 pdf-parse keys: ${Object.keys(pdfParseModule).join(', ')}`)

        // Try different ways to call the function
        let pdf: (buffer: Buffer) => Promise<{ text: string; numpages: number }>

        if (typeof pdfParseModule === 'function') {
            pdf = pdfParseModule
        } else if (typeof pdfParseModule.default === 'function') {
            pdf = pdfParseModule.default
        } else if (typeof pdfParseModule.default?.default === 'function') {
            pdf = pdfParseModule.default.default
        } else {
            // Last resort - maybe it's the module itself
            console.error(`❌ Could not find pdf-parse function. Module structure:`, JSON.stringify(pdfParseModule, null, 2))
            return null
        }

        const data = await pdf(buffer)

        console.log(`✅ Extracted ${data.text.length} characters from PDF`)
        console.log(`📄 PDF has ${data.numpages} pages`)

        return data.text
    } catch (error) {
        console.error('❌ Error extracting PDF text:', error)
        return null
    }
}
