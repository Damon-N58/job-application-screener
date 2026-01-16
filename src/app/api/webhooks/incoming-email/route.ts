import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { evaluateApplicantById, extractApplicantInfo } from '@/lib/ai-evaluation'
import { evaluateApplicantTask } from '@/trigger/evaluate-applicant'

// Create admin client for server-side operations
function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase environment variables')
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

// Extract name and email from "Name <email@domain.com>" format
function parseFromAddress(from: string): { name: string; email: string } {
    if (!from) {
        return { name: 'Unknown', email: 'unknown@example.com' }
    }

    const match = from.match(/^(.+?)\s*<(.+?)>$/)
    if (match) {
        return {
            name: match[1].trim().replace(/^["']|["']$/g, ''),
            email: match[2].trim().toLowerCase()
        }
    }
    // Just an email address
    const emailMatch = from.match(/[\w.-]+@[\w.-]+\.\w+/)
    if (emailMatch) {
        return {
            name: from.split('@')[0].replace(/[<>]/g, ''),
            email: emailMatch[0].toLowerCase()
        }
    }
    return {
        name: from.split('@')[0] || 'Unknown',
        email: from.toLowerCase()
    }
}

// Try to match email to a job using subject AND body content
async function matchToJob(supabase: ReturnType<typeof getAdminClient>, subject: string, emailBody: string) {
    console.log('🔍 Looking for matching job...')
    console.log('📧 Subject:', subject)
    console.log('📧 Body preview:', emailBody?.substring(0, 200))

    // Get all active jobs
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching jobs:', error)
        return null
    }

    console.log('📋 Found active jobs:', jobs?.map(j => j.title))

    if (!jobs || jobs.length === 0) {
        console.log('❌ No active jobs found')
        return null
    }

    // Combine subject and body for comprehensive search
    const searchText = `${subject || ''} ${emailBody || ''}`.toLowerCase()

    // Score each job by how well it matches
    const jobScores: { job: typeof jobs[0]; score: number }[] = []

    for (const job of jobs) {
        let score = 0
        const titleLower = job.title.toLowerCase()
        const titleWords = titleLower.split(' ').filter((w: string) => w.length > 2)

        // Check for exact title match (highest score)
        if (searchText.includes(titleLower)) {
            score += 100
            console.log(`🎯 Exact title match for "${job.title}"`)
        }

        // Check for individual meaningful words
        for (const word of titleWords) {
            if (searchText.includes(word)) {
                score += 10
            }
        }

        // Special checks for common role variations
        if (titleLower.includes('software') && (searchText.includes('software') || searchText.includes('developer') || searchText.includes('programmer'))) {
            score += 20
        }
        if (titleLower.includes('engineer') && searchText.includes('engineer')) {
            score += 20
        }
        if (titleLower.includes('cto') && (searchText.includes('cto') || searchText.includes('chief technology'))) {
            score += 20
        }

        jobScores.push({ job, score })
    }

    // Sort by score descending
    jobScores.sort((a, b) => b.score - a.score)

    // Normalize scores to 0-100 scale (max raw score is ~130)
    const maxPossibleScore = 130
    const normalizedScores = jobScores.map(js => ({
        ...js,
        normalizedScore: Math.min(100, Math.round((js.score / maxPossibleScore) * 100))
    }))

    console.log('📊 Job match scores:', normalizedScores.map(js => `${js.job.title}: ${js.normalizedScore}/100`))

    // Return best match if it has a meaningful score
    if (jobScores[0].score > 0) {
        console.log(`✅ Best match: "${jobScores[0].job.title}" (score: ${jobScores[0].score})`)
        return jobScores[0].job.id
    }

    // LENIENT: If no matches, default to most recent job
    console.log(`📌 No match found, defaulting to most recent job: ${jobs[0].title}`)
    return jobs[0].id
}


export async function POST(req: Request) {
    console.log('📧 CloudMailin webhook received')

    try {
        // Check content type
        const contentType = req.headers.get('content-type') || ''
        console.log('Content-Type:', contentType)

        let envelope: Record<string, unknown> = {}
        let headers: Record<string, string> = {}
        let plain = ''
        let html = ''
        let attachments: Array<{ file_name: string; content_type: string; content: string; size: number }> = []

        // CloudMailin can send as multipart/form-data or application/json
        if (contentType.includes('multipart/form-data')) {
            console.log('📄 Parsing as multipart/form-data')
            const formData = await req.formData()

            // Log all form fields for debugging
            console.log('Form fields received:', Array.from(formData.keys()))

            // CloudMailin sends data as form fields
            const envelopeStr = formData.get('envelope') as string
            const headersStr = formData.get('headers') as string

            if (envelopeStr) envelope = JSON.parse(envelopeStr)
            if (headersStr) headers = JSON.parse(headersStr)
            plain = formData.get('plain') as string || ''
            html = formData.get('html') as string || ''

            // Get attachments
            for (const [key, value] of formData.entries()) {
                if (key.startsWith('attachments')) {
                    if (value instanceof File) {
                        const buffer = await value.arrayBuffer()
                        attachments.push({
                            file_name: value.name,
                            content_type: value.type,
                            content: Buffer.from(buffer).toString('base64'),
                            size: value.size
                        })
                    }
                }
            }
        } else if (contentType.includes('application/json')) {
            console.log('📄 Parsing as JSON')
            const body = await req.json()
            console.log('JSON body keys:', Object.keys(body))

            envelope = body.envelope || {}
            headers = body.headers || {}
            plain = body.plain || ''
            html = body.html || ''
            attachments = body.attachments || []
        } else {
            // Try to parse as JSON anyway (CloudMailin sometimes doesn't set correct content-type)
            console.log('📄 Unknown content type, trying JSON parse')
            try {
                const text = await req.text()
                console.log('Raw body (first 500 chars):', text.substring(0, 500))
                const body = JSON.parse(text)
                envelope = body.envelope || {}
                headers = body.headers || {}
                plain = body.plain || ''
                html = body.html || ''
                attachments = body.attachments || []
            } catch {
                console.error('Failed to parse request body')
                return NextResponse.json({
                    success: false,
                    error: 'Could not parse request body'
                }, { status: 400 })
            }
        }

        // Extract sender info
        const fromHeader = headers.From || headers.from || (envelope as Record<string, string>).from || ''
        let { name, email } = parseFromAddress(fromHeader)
        const subject = headers.Subject || headers.subject || 'No Subject'

        console.log(`📧 Raw From Header: ${fromHeader}`)
        console.log(`📧 Parsed: ${name} <${email}>`)

        // If name/email is unknown or this looks like a forward, try AI extraction
        if (name === 'Unknown' || email.includes('unknown') || plain.includes('Forwarded message')) {
            console.log('🤔 Applicant info unclear or forwarded - attempting AI extraction...')
            const extracted = await extractApplicantInfo(plain || html, subject)
            if (extracted) {
                console.log(`✨ AI Extracted: ${extracted.name} <${extracted.email}>`)
                name = extracted.name
                email = extracted.email
            }
        }

        console.log(`📧 Final Applicant: ${name} <${email}>`)
        console.log(`📧 Subject: ${subject}`)
        console.log(`📧 Attachments: ${attachments.length}`)
        console.log(`📧 Plain text length: ${plain.length}`)

        const supabase = getAdminClient()

        // Check if we already have this applicant (by email)
        const { data: existingApplicant, error: existingError } = await supabase
            .from('applicants')
            .select('id')
            .eq('email', email)
            .maybeSingle()

        if (existingError) {
            console.error('Error checking existing applicant:', existingError)
        }

        if (existingApplicant) {
            console.log(`⚠️ Applicant ${email} already exists, skipping`)
            return NextResponse.json({
                success: true,
                message: 'Applicant already exists',
                applicant_id: existingApplicant.id
            })
        }

        // Try to match to a job (uses both subject and body for matching)
        const jobId = await matchToJob(supabase, subject, plain)

        if (!jobId) {
            console.log(`⚠️ Could not match email to any job: "${subject}"`)
            return NextResponse.json({
                success: false,
                message: 'No matching job found for this application',
                subject: subject
            }, { status: 422 })
        }

        // Upload resume if there's a PDF attachment
        let resumeUrl: string | null = null
        const pdfAttachment = attachments.find(a =>
            a.content_type === 'application/pdf' ||
            a.file_name?.toLowerCase().endsWith('.pdf')
        )

        if (pdfAttachment) {
            console.log(`📄 Uploading resume: ${pdfAttachment.file_name}`)
            const fileName = `${Date.now()}-${pdfAttachment.file_name}`
            const filePath = `resumes/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, Buffer.from(pdfAttachment.content, 'base64'), {
                    contentType: 'application/pdf',
                    cacheControl: '3600'
                })

            if (!uploadError) {
                const { data: urlData } = supabase.storage
                    .from('resumes')
                    .getPublicUrl(filePath)
                resumeUrl = urlData.publicUrl
                console.log(`📄 Resume uploaded: ${resumeUrl}`)
            } else {
                console.error('Resume upload error:', uploadError)
            }
        }

        // Create the applicant record
        console.log('💾 Creating applicant record...')
        const { data: newApplicant, error: insertError } = await supabase
            .from('applicants')
            .insert({
                job_id: jobId,
                name,
                email,
                status: 'analyzing',
                source: 'email',
                source_detail: 'CloudMailin',
                email_subject: subject,
                email_body: plain || html?.replace(/<[^>]*>/g, '') || '',
                resume_url: resumeUrl,
                submitted_at: new Date().toISOString()
            })
            .select()
            .single()

        if (insertError) {
            console.error('Error creating applicant:', insertError)
            return NextResponse.json({
                success: false,
                error: insertError.message
            }, { status: 500 })
        }

        console.log(`✅ New applicant created: ${newApplicant.id}`)

        // Trigger AI evaluation via Trigger.dev (background job)
        try {
            const handle = await evaluateApplicantTask.trigger({ applicantId: newApplicant.id })
            console.log(`🚀 Triggered background evaluation for ${name} (Job ID: ${handle.id})`)
        } catch (err) {
            console.error('Failed to trigger background job:', err)
            // Fallback: try to run it locally if trigger fails (optional, but good for now)
            console.log('⚠️ Fallback: Running evaluation locally...')
            evaluateApplicantById(newApplicant.id).catch(e => console.error('Local fallback failed:', e))
        }

        return NextResponse.json({
            success: true,
            message: 'Application received, AI evaluation started',
            applicant_id: newApplicant.id,
            job_id: jobId
        })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 })
    }
}

// Handle GET requests for testing
export async function GET() {
    return NextResponse.json({
        status: 'CloudMailin webhook active',
        endpoint: '/api/webhooks/incoming-email',
        env_check: {
            supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabase_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            openai_key: !!process.env.OPENAI_API_KEY
        }
    })
}
