import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client for server-side operations
function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

interface CloudMailinAttachment {
    file_name: string
    content_type: string
    content: string // Base64 encoded
    size: number
}

interface CloudMailinPayload {
    envelope: {
        to: string
        from: string
        helo_domain: string
        remote_ip: string
    }
    headers: {
        Subject: string
        From: string
        To: string
        Date: string
        [key: string]: string
    }
    plain: string
    html: string
    attachments: CloudMailinAttachment[]
}

// Extract name and email from "Name <email@domain.com>" format
function parseFromAddress(from: string): { name: string; email: string } {
    const match = from.match(/^(.+?)\s*<(.+?)>$/)
    if (match) {
        return {
            name: match[1].trim().replace(/^["']|["']$/g, ''),
            email: match[2].trim().toLowerCase()
        }
    }
    // Just an email address
    return {
        name: from.split('@')[0],
        email: from.toLowerCase()
    }
}

// Try to match email subject to a job
async function matchToJob(supabase: ReturnType<typeof getAdminClient>, subject: string) {
    // Get all active jobs
    const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('status', 'active')

    if (!jobs || jobs.length === 0) return null

    // Simple matching: check if job title appears in subject
    const subjectLower = subject.toLowerCase()
    for (const job of jobs) {
        if (subjectLower.includes(job.title.toLowerCase())) {
            return job.id
        }
    }

    // If no match and only one active job, default to it
    if (jobs.length === 1) {
        return jobs[0].id
    }

    // No match found
    return null
}

export async function POST(req: Request) {
    try {
        // Parse the multipart form data from CloudMailin
        const formData = await req.formData()

        // CloudMailin sends data as form fields
        const envelope = JSON.parse(formData.get('envelope') as string || '{}')
        const headers = JSON.parse(formData.get('headers') as string || '{}')
        const plain = formData.get('plain') as string || ''
        const html = formData.get('html') as string || ''

        // Get attachments
        const attachments: CloudMailinAttachment[] = []
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('attachments[')) {
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

        // Extract sender info
        const fromHeader = headers.From || headers.from || envelope.from || ''
        const { name, email } = parseFromAddress(fromHeader)
        const subject = headers.Subject || headers.subject || 'No Subject'

        console.log(`📧 Incoming email from: ${name} <${email}>`)
        console.log(`   Subject: ${subject}`)
        console.log(`   Attachments: ${attachments.length}`)

        const supabase = getAdminClient()

        // Check if we already have this applicant (by email)
        const { data: existingApplicant } = await supabase
            .from('applicants')
            .select('id')
            .eq('email', email)
            .single()

        if (existingApplicant) {
            console.log(`⚠️ Applicant ${email} already exists, skipping`)
            return NextResponse.json({
                success: true,
                message: 'Applicant already exists',
                applicant_id: existingApplicant.id
            })
        }

        // Try to match to a job
        const jobId = await matchToJob(supabase, subject)

        if (!jobId) {
            console.log(`⚠️ Could not match email to any job: "${subject}"`)
            return NextResponse.json({
                success: false,
                message: 'No matching job found for this application'
            }, { status: 422 })
        }

        // Upload resume if there's a PDF attachment
        let resumeUrl: string | null = null
        const pdfAttachment = attachments.find(a =>
            a.content_type === 'application/pdf' ||
            a.file_name.toLowerCase().endsWith('.pdf')
        )

        if (pdfAttachment) {
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
        const { data: newApplicant, error: insertError } = await supabase
            .from('applicants')
            .insert({
                job_id: jobId,
                name,
                email,
                status: 'incoming',
                source: 'email',
                source_detail: 'CloudMailin: 99e40646fb2e27d8b27e@cloudmailin.net',
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

        // TODO: Trigger AI evaluation here
        // For now, we'll just mark as 'analyzing' 
        await supabase
            .from('applicants')
            .update({ status: 'analyzing' })
            .eq('id', newApplicant.id)

        return NextResponse.json({
            success: true,
            message: 'Application received',
            applicant_id: newApplicant.id,
            job_id: jobId
        })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

// Handle GET requests for testing
export async function GET() {
    return NextResponse.json({
        status: 'CloudMailin webhook active',
        endpoint: '/api/webhooks/incoming-email'
    })
}
