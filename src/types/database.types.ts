export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    clerk_user_id: string
                    email: string
                    full_name: string | null
                    company_name: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    clerk_user_id: string
                    email: string
                    full_name?: string | null
                    company_name?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    clerk_user_id?: string
                    email?: string
                    full_name?: string | null
                    company_name?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            jobs: {
                Row: {
                    id: string
                    profile_id: string
                    title: string
                    department: string
                    description: string
                    status: string
                    ai_persona: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    title: string
                    department: string
                    description: string
                    status?: string
                    ai_persona: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    title?: string
                    department?: string
                    description?: string
                    status?: string
                    ai_persona?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "jobs_profile_id_fkey"
                        columns: ["profile_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            applicants: {
                Row: {
                    id: string
                    job_id: string
                    name: string
                    email: string
                    phone: string | null
                    status: string
                    source: string
                    source_detail: string | null
                    email_body: string | null
                    email_subject: string | null
                    resume_url: string | null
                    submitted_at: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    job_id: string
                    name: string
                    email: string
                    phone?: string | null
                    status?: string
                    source?: string
                    source_detail?: string | null
                    email_body?: string | null
                    email_subject?: string | null
                    resume_url?: string | null
                    submitted_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    job_id?: string
                    name?: string
                    email?: string
                    phone?: string | null
                    status?: string
                    source?: string
                    source_detail?: string | null
                    email_body?: string | null
                    email_subject?: string | null
                    resume_url?: string | null
                    submitted_at?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "applicants_job_id_fkey"
                        columns: ["job_id"]
                        isOneToOne: false
                        referencedRelation: "jobs"
                        referencedColumns: ["id"]
                    }
                ]
            }
            ai_evaluations: {
                Row: {
                    id: string
                    applicant_id: string
                    score: number
                    summary: string
                    key_strengths: string[]
                    red_flags: string[]
                    match_details: Json
                    raw_response: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    applicant_id: string
                    score: number
                    summary: string
                    key_strengths?: string[]
                    red_flags?: string[]
                    match_details: Json
                    raw_response?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    applicant_id?: string
                    score?: number
                    summary?: string
                    key_strengths?: string[]
                    red_flags?: string[]
                    match_details?: Json
                    raw_response?: Json | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "ai_evaluations_applicant_id_fkey"
                        columns: ["applicant_id"]
                        isOneToOne: true
                        referencedRelation: "applicants"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
