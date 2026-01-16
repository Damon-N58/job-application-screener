import { generateObject, generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
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

// Schema for AI evaluation response
const EvaluationSchema = z.object({
    score: z.number().min(0).max(100).describe('Overall match score from 0-100'),
    summary: z.string().describe('2-3 sentence summary of the candidate fit'),
    keyStrengths: z.array(z.string()).describe('3-5 key strengths of the candidate'),
    redFlags: z.array(z.string()).describe('Any concerns or red flags (can be empty)'),
    mustHavesAnalysis: z.array(z.object({
        requirement: z.string(),
        met: z.boolean(),
        notes: z.string().nullable().describe('Notes if applicable, otherwise null')
    })).describe('Analysis of each must-have requirement'),
    niceToHavesAnalysis: z.array(z.object({
        requirement: z.string(),
        met: z.boolean()
    })).describe('Analysis of each nice-to-have requirement'),
    culturalFitScore: z.number().min(0).max(100).describe('Cultural fit score from 0-100')
})

// Schema for extracting applicant info from email
const ApplicantInfoSchema = z.object({
    name: z.string().describe('Full name of the applicant'),
    email: z.string().describe('Email address of the applicant'),
    phone: z.string().nullable().describe('Phone number if found, otherwise null')
})

type EvaluationResult = z.infer<typeof EvaluationSchema>

interface JobPersona {
    mustHaves: string[]
    niceToHaves: string[]
    culturalFit: string
}

interface ApplicantData {
    id: string
    name: string
    email: string
    emailBody: string | null
    resumeUrl: string | null
}

interface JobData {
    id: string
    title: string
    department: string
    description: string
    aiPersona: JobPersona
}

// Use AI to extract applicant info from email content
export async function extractApplicantInfo(emailBody: string, emailSubject: string): Promise<{ name: string; email: string; phone?: string | null } | null> {
    if (!emailBody && !emailSubject) {
        return null
    }

    try {
        console.log('🔍 Extracting applicant info with AI...')

        const { object } = await generateObject({
            model: openai('gpt-4o-mini'), // Use mini for faster extraction
            prompt: `Extract the job applicant's contact information from this email.

Subject: ${emailSubject}

Email Content:
${emailBody}

If you cannot find the name, look for signatures, greetings, or any identifying info.
If you cannot find an email, use "unknown@email.com".
If looking at a forwarded email, extract the ORIGINAL sender's info, not the forwarder.`,
            schema: ApplicantInfoSchema,
        })

        console.log(`✅ Extracted: ${object.name} <${object.email}>`)
        return object
    } catch (error) {
        console.error('Error extracting applicant info:', error)
        return null
    }
}

export async function evaluateApplicant(
    applicant: ApplicantData,
    job: JobData
): Promise<EvaluationResult | null> {
    const supabase = getAdminClient()

    try {
        console.log(`🤖 Starting AI evaluation for ${applicant.name}...`)
        console.log(`📧 Email body length: ${applicant.emailBody?.length || 0}`)
        console.log(`📄 Resume URL: ${applicant.resumeUrl || 'none'}`)

        // Check if OpenAI API key is set
        if (!process.env.OPENAI_API_KEY) {
            console.error('❌ OPENAI_API_KEY is not set!')
            throw new Error('OpenAI API key not configured')
        }

        // Build the content for evaluation
        let candidateContent = ''

        // Add email body
        if (applicant.emailBody && applicant.emailBody.trim()) {
            candidateContent += `Application Email Content:\n${applicant.emailBody}\n\n`
        }

        // Try to extract text from PDF resume
        if (applicant.resumeUrl) {
            console.log('📄 Attempting to extract text from resume PDF...')
            const { extractTextFromPdfUrl } = await import('./pdf-parser')
            const resumeText = await extractTextFromPdfUrl(applicant.resumeUrl)

            if (resumeText && resumeText.trim()) {
                candidateContent += `Resume/CV Content:\n${resumeText}\n\n`
                console.log(`✅ Added ${resumeText.length} characters from resume`)
            } else {
                candidateContent += `Note: A resume PDF was attached but could not be parsed. Please evaluate based on the email content.\n`
                console.log('⚠️ Could not extract text from resume PDF')
            }
        }

        if (!candidateContent.trim()) {
            console.log(`⚠️ No content available for evaluation`)
            // Still create a basic evaluation
            candidateContent = 'No application content available. The applicant submitted an empty application.'
        }

        // Build the evaluation prompt
        const systemPrompt = `You are an expert HR recruiter and talent evaluator. Your job is to evaluate job applicants against specific criteria.

Analyze the candidate's application materials carefully. Be thorough but fair in your assessment.

For scoring:
- 85-100: Exceptional match, strongly recommend
- 70-84: Good match, worth interviewing
- 50-69: Moderate match, consider if limited candidates
- 30-49: Weak match, significant gaps
- 0-29: Poor match, does not meet requirements

If information is missing or limited, score conservatively and note the gaps in red flags.`

        const mustHavesList = job.aiPersona.mustHaves?.length
            ? job.aiPersona.mustHaves.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')
            : 'None specified'

        const niceToHavesList = job.aiPersona.niceToHaves?.length
            ? job.aiPersona.niceToHaves.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')
            : 'None specified'

        const userPrompt = `Evaluate this candidate for the following position:

**Job Title:** ${job.title}
**Department:** ${job.department}

**Job Description:**
${job.description}

**Must-Have Requirements:**
${mustHavesList}

**Nice-to-Have Qualifications:**
${niceToHavesList}

**Cultural Fit Description:**
${job.aiPersona.culturalFit || 'Not specified'}

---

**Candidate Information:**
Name: ${applicant.name}
Email: ${applicant.email}

${candidateContent}

---

Provide a comprehensive evaluation of this candidate against all the requirements.`

        console.log('📤 Sending to OpenAI...')

        // Call GPT-4o for evaluation
        const { object: evaluation } = await generateObject({
            model: openai('gpt-4o'),
            system: systemPrompt,
            prompt: userPrompt,
            schema: EvaluationSchema,
        })

        console.log(`✅ AI evaluation complete for ${applicant.name}: Score ${evaluation.score}`)

        // Save to database
        const { error } = await supabase
            .from('ai_evaluations')
            .insert({
                applicant_id: applicant.id,
                score: evaluation.score,
                summary: evaluation.summary,
                key_strengths: evaluation.keyStrengths,
                red_flags: evaluation.redFlags,
                match_details: {
                    mustHaves: evaluation.mustHavesAnalysis,
                    niceToHaves: evaluation.niceToHavesAnalysis,
                    culturalFitScore: evaluation.culturalFitScore
                },
                raw_response: evaluation
            })

        if (error) {
            console.error('Error saving AI evaluation:', error)
            return null
        }

        // Update applicant status based on score
        let newStatus: 'qualified' | 'rejected' = 'qualified'
        if (evaluation.score < 50) {
            newStatus = 'rejected'
        }

        await supabase
            .from('applicants')
            .update({ status: newStatus })
            .eq('id', applicant.id)

        console.log(`📊 Applicant ${applicant.name} marked as ${newStatus}`)

        return evaluation

    } catch (error) {
        console.error('❌ AI evaluation error:', error)
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')

        // Mark as incoming for retry
        await supabase
            .from('applicants')
            .update({ status: 'incoming' })
            .eq('id', applicant.id)

        return null
    }
}

// Evaluate an applicant by their ID
export async function evaluateApplicantById(applicantId: string): Promise<EvaluationResult | null> {
    console.log(`🔄 evaluateApplicantById called for: ${applicantId}`)

    const supabase = getAdminClient()

    // Fetch applicant with their job
    const { data: applicant, error: appError } = await supabase
        .from('applicants')
        .select(`
            id,
            name,
            email,
            email_body,
            resume_url,
            job_id,
            jobs (
                id,
                title,
                department,
                description,
                ai_persona
            )
        `)
        .eq('id', applicantId)
        .single()

    if (appError || !applicant) {
        console.error('Error fetching applicant:', appError)
        return null
    }

    console.log(`📋 Fetched applicant: ${applicant.name}, email_body: ${applicant.email_body?.substring(0, 100)}...`)

    const job = Array.isArray(applicant.jobs) ? applicant.jobs[0] : applicant.jobs

    if (!job) {
        console.error('No job found for applicant')
        return null
    }

    return evaluateApplicant(
        {
            id: applicant.id,
            name: applicant.name,
            email: applicant.email,
            emailBody: applicant.email_body,
            resumeUrl: applicant.resume_url
        },
        {
            id: job.id,
            title: job.title,
            department: job.department,
            description: job.description,
            aiPersona: job.ai_persona as JobPersona
        }
    )
}
