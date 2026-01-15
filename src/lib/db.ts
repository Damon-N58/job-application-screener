import { supabase, createAdminClient } from './supabase'
import { Database } from '@/types/database.types'

// Type aliases for cleaner code
type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type Job = Database['public']['Tables']['jobs']['Row']
type JobInsert = Database['public']['Tables']['jobs']['Insert']
type JobUpdate = Database['public']['Tables']['jobs']['Update']
type Applicant = Database['public']['Tables']['applicants']['Row']
type ApplicantInsert = Database['public']['Tables']['applicants']['Insert']
type ApplicantUpdate = Database['public']['Tables']['applicants']['Update']
type AIEvaluation = Database['public']['Tables']['ai_evaluations']['Row']

// ============================================
// PROFILE OPERATIONS
// ============================================

export async function getProfileByClerkId(clerkUserId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return null
    }
    return data
}

export async function createProfile(profile: ProfileInsert): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single()

    if (error) {
        console.error('Error creating profile:', error)
        return null
    }
    return data
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating profile:', error)
        return null
    }
    return data
}

// ============================================
// JOB OPERATIONS
// ============================================

export async function getJobsByProfileId(profileId: string): Promise<Job[]> {
    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching jobs:', error)
        return []
    }
    return data || []
}

export async function getJobById(jobId: string): Promise<Job | null> {
    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()

    if (error) {
        console.error('Error fetching job:', error)
        return null
    }
    return data
}

export async function createJob(job: JobInsert): Promise<Job | null> {
    const { data, error } = await supabase
        .from('jobs')
        .insert(job)
        .select()
        .single()

    if (error) {
        console.error('Error creating job:', error)
        return null
    }
    return data
}

export async function updateJob(jobId: string, updates: JobUpdate): Promise<Job | null> {
    const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single()

    if (error) {
        console.error('Error updating job:', error)
        return null
    }
    return data
}

export async function deleteJob(jobId: string): Promise<boolean> {
    const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)

    if (error) {
        console.error('Error deleting job:', error)
        return false
    }
    return true
}

// ============================================
// APPLICANT OPERATIONS
// ============================================

export async function getApplicantsByJobId(jobId: string): Promise<(Applicant & { ai_evaluation?: AIEvaluation })[]> {
    const { data, error } = await supabase
        .from('applicants')
        .select(`
      *,
      ai_evaluations (*)
    `)
        .eq('job_id', jobId)
        .order('submitted_at', { ascending: false })

    if (error) {
        console.error('Error fetching applicants:', error)
        return []
    }

    // Transform to flatten ai_evaluation
    return (data || []).map(applicant => ({
        ...applicant,
        ai_evaluation: Array.isArray(applicant.ai_evaluations)
            ? applicant.ai_evaluations[0]
            : applicant.ai_evaluations
    }))
}

export async function getAllApplicantsByProfileId(profileId: string): Promise<(Applicant & { ai_evaluation?: AIEvaluation, job?: Job })[]> {
    // First get all jobs for the profile
    const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('profile_id', profileId)

    if (jobsError || !jobs) {
        console.error('Error fetching jobs for applicants:', jobsError)
        return []
    }

    const jobIds = jobs.map(j => j.id)

    if (jobIds.length === 0) return []

    const { data, error } = await supabase
        .from('applicants')
        .select(`
      *,
      ai_evaluations (*),
      jobs (*)
    `)
        .in('job_id', jobIds)
        .order('submitted_at', { ascending: false })

    if (error) {
        console.error('Error fetching all applicants:', error)
        return []
    }

    return (data || []).map(applicant => ({
        ...applicant,
        ai_evaluation: Array.isArray(applicant.ai_evaluations)
            ? applicant.ai_evaluations[0]
            : applicant.ai_evaluations,
        job: Array.isArray(applicant.jobs)
            ? applicant.jobs[0]
            : applicant.jobs
    }))
}

export async function getApplicantById(applicantId: string): Promise<(Applicant & { ai_evaluation?: AIEvaluation }) | null> {
    const { data, error } = await supabase
        .from('applicants')
        .select(`
      *,
      ai_evaluations (*)
    `)
        .eq('id', applicantId)
        .single()

    if (error) {
        console.error('Error fetching applicant:', error)
        return null
    }

    return {
        ...data,
        ai_evaluation: Array.isArray(data.ai_evaluations)
            ? data.ai_evaluations[0]
            : data.ai_evaluations
    }
}

export async function createApplicant(applicant: ApplicantInsert): Promise<Applicant | null> {
    const { data, error } = await supabase
        .from('applicants')
        .insert(applicant)
        .select()
        .single()

    if (error) {
        console.error('Error creating applicant:', error)
        return null
    }
    return data
}

export async function updateApplicant(applicantId: string, updates: ApplicantUpdate): Promise<Applicant | null> {
    const { data, error } = await supabase
        .from('applicants')
        .update(updates)
        .eq('id', applicantId)
        .select()
        .single()

    if (error) {
        console.error('Error updating applicant:', error)
        return null
    }
    return data
}

// ============================================
// AI EVALUATION OPERATIONS
// ============================================

export async function createAIEvaluation(evaluation: Database['public']['Tables']['ai_evaluations']['Insert']): Promise<AIEvaluation | null> {
    const { data, error } = await supabase
        .from('ai_evaluations')
        .insert(evaluation)
        .select()
        .single()

    if (error) {
        console.error('Error creating AI evaluation:', error)
        return null
    }
    return data
}

// ============================================
// STORAGE OPERATIONS
// ============================================

export async function uploadResume(file: File, applicantId: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${applicantId}.${fileExt}`
    const filePath = `resumes/${fileName}`

    const { error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
        })

    if (error) {
        console.error('Error uploading resume:', error)
        return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath)

    return urlData.publicUrl
}

export async function getResumeUrl(applicantId: string): Promise<string | null> {
    // Try to get signed URL for private bucket
    const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(`resumes/${applicantId}.pdf`, 3600) // 1 hour expiry

    if (error) {
        console.error('Error getting resume URL:', error)
        return null
    }

    return data.signedUrl
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats(profileId: string) {
    // Get job counts
    const { data: jobs } = await supabase
        .from('jobs')
        .select('id, status')
        .eq('profile_id', profileId)

    const activeJobs = jobs?.filter(j => j.status === 'active').length || 0
    const jobIds = jobs?.map(j => j.id) || []

    if (jobIds.length === 0) {
        return {
            totalJobs: 0,
            activeJobs: 0,
            activeApplicants: 0,
            qualifiedToday: 0,
            aiProcessing: 0
        }
    }

    // Get applicant stats
    const { data: applicants } = await supabase
        .from('applicants')
        .select('status, submitted_at')
        .in('job_id', jobIds)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const activeApplicants = applicants?.filter(a => a.status !== 'rejected').length || 0
    const qualifiedToday = applicants?.filter(a =>
        a.status === 'qualified' &&
        new Date(a.submitted_at) >= today
    ).length || 0
    const aiProcessing = applicants?.filter(a => a.status === 'analyzing').length || 0

    return {
        totalJobs: jobs?.length || 0,
        activeJobs,
        activeApplicants,
        qualifiedToday,
        aiProcessing
    }
}
