import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

/**
 * Fetches PDF and extracts text using GPT-4o vision
 * This is the fallback/primary method since pdf-parse has bundler issues
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
        const base64 = buffer.toString('base64')

        console.log(`📄 PDF downloaded, size: ${buffer.length} bytes`)
        console.log(`📄 Sending to GPT-4o for text extraction...`)

        // Use GPT-4o to extract text from the PDF
        const { text } = await generateText({
            model: openai('gpt-4o'),
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Please extract and return ALL the text content from this PDF document. Return ONLY the extracted text, nothing else. Maintain the original structure and formatting as much as possible.'
                        },
                        {
                            type: 'file',
                            data: base64,
                            mediaType: 'application/pdf'
                        }
                    ]
                }
            ]
        })

        if (text && text.trim()) {
            console.log(`✅ Extracted ${text.length} characters from PDF via GPT-4o`)
            return text
        }

        console.log('⚠️ GPT-4o returned empty text')
        return null
    } catch (error) {
        console.error('❌ Error extracting PDF text:', error)
        return null
    }
}
