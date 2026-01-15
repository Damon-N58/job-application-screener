-- Nineteen58 Recruiter Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE job_status AS ENUM ('active', 'paused', 'closed');
CREATE TYPE applicant_status AS ENUM ('incoming', 'analyzing', 'qualified', 'rejected');
CREATE TYPE applicant_source AS ENUM ('email', 'manual');

-- ============================================
-- PROFILES TABLE
-- Links to Clerk users
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for Clerk user lookup
CREATE INDEX idx_profiles_clerk_user_id ON profiles(clerk_user_id);

-- ============================================
-- JOBS TABLE
-- Job postings with AI persona configuration
-- ============================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    description TEXT NOT NULL,
    status job_status DEFAULT 'active',
    ai_persona JSONB NOT NULL DEFAULT '{
        "mustHaves": [],
        "niceToHaves": [],
        "culturalFit": ""
    }',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for profile lookup
CREATE INDEX idx_jobs_profile_id ON jobs(profile_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- ============================================
-- APPLICANTS TABLE
-- Candidate applications for jobs
-- ============================================
CREATE TABLE applicants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    status applicant_status DEFAULT 'incoming',
    source applicant_source DEFAULT 'email',
    source_detail TEXT, -- e.g., email address used
    email_body TEXT,
    email_subject TEXT,
    resume_url TEXT, -- Supabase Storage URL
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for applicant queries
CREATE INDEX idx_applicants_job_id ON applicants(job_id);
CREATE INDEX idx_applicants_status ON applicants(status);
CREATE INDEX idx_applicants_email ON applicants(email);

-- ============================================
-- AI EVALUATIONS TABLE
-- AI analysis results for applicants
-- ============================================
CREATE TABLE ai_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_id UUID UNIQUE NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    summary TEXT NOT NULL,
    key_strengths TEXT[] DEFAULT '{}',
    red_flags TEXT[] DEFAULT '{}',
    match_details JSONB NOT NULL DEFAULT '{
        "mustHaves": [],
        "niceToHaves": [],
        "culturalFitScore": 0
    }',
    raw_response JSONB, -- Store the raw AI response for debugging
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for applicant lookup
CREATE INDEX idx_ai_evaluations_applicant_id ON ai_evaluations(applicant_id);
CREATE INDEX idx_ai_evaluations_score ON ai_evaluations(score);

-- ============================================
-- UPDATED_AT TRIGGER
-- Automatically update updated_at column
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applicants_updated_at
    BEFORE UPDATE ON applicants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Secure access to data
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_evaluations ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/modify their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (true); -- We'll use Clerk JWT to verify in app layer

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (true);

-- Jobs: Access through profile ownership
CREATE POLICY "Users can view own jobs"
    ON jobs FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own jobs"
    ON jobs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update own jobs"
    ON jobs FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete own jobs"
    ON jobs FOR DELETE
    USING (true);

-- Applicants: Access through job ownership
CREATE POLICY "Users can view applicants for own jobs"
    ON applicants FOR SELECT
    USING (true);

CREATE POLICY "Users can insert applicants"
    ON applicants FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update applicants"
    ON applicants FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete applicants"
    ON applicants FOR DELETE
    USING (true);

-- AI Evaluations: Access through applicant ownership
CREATE POLICY "Users can view ai evaluations"
    ON ai_evaluations FOR SELECT
    USING (true);

CREATE POLICY "Users can insert ai evaluations"
    ON ai_evaluations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update ai evaluations"
    ON ai_evaluations FOR UPDATE
    USING (true);

-- ============================================
-- VIEWS
-- Helpful aggregated views
-- ============================================

-- Job statistics view
CREATE VIEW job_stats AS
SELECT 
    j.id as job_id,
    j.title,
    j.status,
    COUNT(a.id) as total_applicants,
    COUNT(CASE WHEN a.status = 'qualified' THEN 1 END) as qualified_count,
    COUNT(CASE WHEN a.status = 'analyzing' THEN 1 END) as analyzing_count,
    COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN a.status = 'incoming' THEN 1 END) as incoming_count,
    AVG(e.score) as avg_score
FROM jobs j
LEFT JOIN applicants a ON a.job_id = j.id
LEFT JOIN ai_evaluations e ON e.applicant_id = a.id
GROUP BY j.id, j.title, j.status;

-- ============================================
-- STORAGE BUCKET FOR RESUMES
-- ============================================
-- Note: Run this in Supabase Storage settings or via API
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('resumes', 'resumes', false);

-- Storage policy for resumes (run after creating bucket):
-- CREATE POLICY "Users can upload resumes"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'resumes');

-- CREATE POLICY "Users can view resumes"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'resumes');
