-- ============================================
-- 1. UTILITY FUNCTIONS
-- ============================================

-- Helper to get the Clerk User ID from the JWT
-- Clerk passes the user ID in the 'sub' claim
CREATE OR REPLACE FUNCTION auth_user_id()
RETURNS TEXT AS $$
    SELECT current_setting('request.jwt.claims', true)::json->>'sub';
$$ LANGUAGE SQL STABLE;

-- ============================================
-- 2. DROP EXISTING POLICIES
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Jobs
DROP POLICY IF EXISTS "Users can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON jobs;

-- Applicants
DROP POLICY IF EXISTS "Users can view applicants for own jobs" ON applicants;
DROP POLICY IF EXISTS "Users can insert applicants" ON applicants;
DROP POLICY IF EXISTS "Users can update applicants" ON applicants;
DROP POLICY IF EXISTS "Users can delete applicants" ON applicants;

-- AI Evaluations
DROP POLICY IF EXISTS "Users can view ai evaluations" ON ai_evaluations;
DROP POLICY IF EXISTS "Users can insert ai evaluations" ON ai_evaluations;
DROP POLICY IF EXISTS "Users can update ai evaluations" ON ai_evaluations;

-- ============================================
-- 3. DEFINE NEW SECURE POLICIES
-- ============================================

-- PROFILES: Users can only access their own profile (matched by Clerk ID)
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (clerk_user_id = auth_user_id());

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (clerk_user_id = auth_user_id());

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (clerk_user_id = auth_user_id());

-- JOBS: Access via profile_id owner
CREATE POLICY "Users can view own jobs"
    ON jobs FOR SELECT
    USING (
        profile_id IN (
            SELECT id FROM profiles 
            WHERE clerk_user_id = auth_user_id()
        )
    );

CREATE POLICY "Users can insert own jobs"
    ON jobs FOR INSERT
    WITH CHECK (
        profile_id IN (
            SELECT id FROM profiles 
            WHERE clerk_user_id = auth_user_id()
        )
    );

CREATE POLICY "Users can update own jobs"
    ON jobs FOR UPDATE
    USING (
        profile_id IN (
            SELECT id FROM profiles 
            WHERE clerk_user_id = auth_user_id()
        )
    );

CREATE POLICY "Users can delete own jobs"
    ON jobs FOR DELETE
    USING (
        profile_id IN (
            SELECT id FROM profiles 
            WHERE clerk_user_id = auth_user_id()
        )
    );

-- APPLICANTS: Access via job ownership
-- Note: 'INSERT' is allowed for public (e.g. candidates applying) or controlled by API key if needed.
-- Assuming here that ONLY the job owner should view/manage applicants.
-- If public submissions are direct to DB, you might need a public INSERT policy for applicants.
-- For now, mirroring previous "true" logic but scoping to owner for management.

CREATE POLICY "Users can view applicants for own jobs"
    ON applicants FOR SELECT
    USING (
        job_id IN (
            SELECT id FROM jobs 
            WHERE profile_id IN (
                SELECT id FROM profiles 
                WHERE clerk_user_id = auth_user_id()
            )
        )
    );

-- Allow public inserts for applicants (e.g. via an API wrapper or edge function).
-- IF you want to restrict this, remove this policy.
CREATE POLICY "Anyone can insert applicants"
    ON applicants FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update applicants for own jobs"
    ON applicants FOR UPDATE
    USING (
        job_id IN (
            SELECT id FROM jobs 
            WHERE profile_id IN (
                SELECT id FROM profiles 
                WHERE clerk_user_id = auth_user_id()
            )
        )
    );

CREATE POLICY "Users can delete applicants for own jobs"
    ON applicants FOR DELETE
    USING (
        job_id IN (
            SELECT id FROM jobs 
            WHERE profile_id IN (
                SELECT id FROM profiles 
                WHERE clerk_user_id = auth_user_id()
            )
        )
    );

-- AI EVALUATIONS: Access via applicant -> job ownership
CREATE POLICY "Users can view ai evaluations"
    ON ai_evaluations FOR SELECT
    USING (
        applicant_id IN (
            SELECT id FROM applicants 
            WHERE job_id IN (
                SELECT id FROM jobs 
                WHERE profile_id IN (
                    SELECT id FROM profiles 
                    WHERE clerk_user_id = auth_user_id()
                )
            )
        )
    );

-- Allow system/functions to insert (or users if they trigger it manually)
-- Adjust according to who actually writes these rows.
CREATE POLICY "Users can insert ai evaluations"
    ON ai_evaluations FOR INSERT
    WITH CHECK (
        applicant_id IN (
            SELECT id FROM applicants 
            WHERE job_id IN (
                SELECT id FROM jobs 
                WHERE profile_id IN (
                    SELECT id FROM profiles 
                    WHERE clerk_user_id = auth_user_id()
                )
            )
        )
    );

CREATE POLICY "Users can update ai evaluations"
    ON ai_evaluations FOR UPDATE
    USING (
        applicant_id IN (
            SELECT id FROM applicants 
            WHERE job_id IN (
                SELECT id FROM jobs 
                WHERE profile_id IN (
                    SELECT id FROM profiles 
                    WHERE clerk_user_id = auth_user_id()
                )
            )
        )
    );

-- ============================================
-- 4. SECURE THE VIEW
-- ============================================

-- Drop the existing view
DROP VIEW IF EXISTS job_stats;

-- Recreate it with security_invoker = true
-- This ensures the view runs with the permissions of the user querying it,
-- so RLS policies on the underlying tables are respected.
CREATE VIEW job_stats WITH (security_invoker = true) AS
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
