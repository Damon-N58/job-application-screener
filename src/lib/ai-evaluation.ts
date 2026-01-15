import { generateObject } from 'ai'
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
        notes: z.string().optional()
    })).describe('Analysis of each must-have requirement'),
    niceToHavesAnalysis: z.array(z.object({
        requirement: z.string(),
        met: z.boolean()
    })).describe('Analysis of each nice-to-have requirement'),
    culturalFitScore: z.number().min(0).max(100).describe('Cultural fit score from 0-100')
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

export async function evaluateApplicant(
    applicant: ApplicantData,
    job: JobData
): Promise<EvaluationResult | null> {
    const supabase = getAdminClient()

    try {
        console.log(`🤖 Starting AI evaluation for ${applicant.name}...`)

        // Build the resume content
        let resumeContent = ''

        // If there's a resume URL, we'll include it in the prompt
        // GPT-4o can read PDF URLs directly
        if (applicant.resumeUrl) {
            resumeContent = `Resume URL: ${applicant.resumeUrl}\n\nPlease analyze the resume at this URL.`
        }

        // Add email body if available
        if (applicant.emailBody) {
            resumeContent += `\n\nApplication Email:\n${applicant.emailBody}`
        }

        if (!resumeContent.trim()) {
            console.log(`⚠️ No resume or email content for ${applicant.name}`)
            return null
        }

        // Build the evaluation prompt
        const systemPrompt = `You are an expert HR recruiter and talent evaluator. Your job is to evaluate job applicants against specific criteria.

Analyze the candidate's resume and application materials carefully. Be thorough but fair in your assessment.

For scoring:
- 85-100: Exceptional match, strongly recommend
- 70-84: Good match, worth interviewing
- 50-69: Moderate match, consider if limited candidates
- 30-49: Weak match, significant gaps
- 0-29: Poor match, does not meet requirements`

        const userPrompt = `Evaluate this candidate for the following position:

**Job Title:** ${job.title}
**Department:** ${job.department}

**Job Description:**
${job.description}

**Must-Have Requirements:**
${job.aiPersona.mustHaves.map((r, i) => `${i + 1}. ${r}`).join('\n')}

**Nice-to-Have Qualifications:**
${job.aiPersona.niceToHaves.map((r, i) => `${i + 1}. ${r}`).join('\n')}

**Cultural Fit Description:**
${job.aiPersona.culturalFit || 'Not specified'}

---

**Candidate Information:**
Name: ${applicant.name}
Email: ${applicant.email}

${resumeContent}

---

Provide a comprehensive evaluation of this candidate against all the requirements.`

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
        console.error('AI evaluation error:', error)

        // Mark as failed (keep as analyzing for retry)
        await supabase
            .from('applicants')
            .update({ status: 'incoming' })
            .eq('id', applicant.id)

        return null
    }
}

// Evaluate an applicant by their ID
export async function evaluateApplicantById(applicantId: string): Promise<EvaluationResult | null> {
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
