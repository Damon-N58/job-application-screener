'use client'

import { useState, useEffect, useCallback } from 'react'
import { useProfile } from './useProfile'
import * as db from '@/lib/db'
import { Database } from '@/types/database.types'

type Applicant = Database['public']['Tables']['applicants']['Row']
type AIEvaluation = Database['public']['Tables']['ai_evaluations']['Row']
type Job = Database['public']['Tables']['jobs']['Row']

export type ApplicantWithEvaluation = Applicant & {
    ai_evaluation?: AIEvaluation
    job?: Job
}

export function useApplicants(jobId: string) {
    const [applicants, setApplicants] = useState<ApplicantWithEvaluation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchApplicants = useCallback(async () => {
        if (!jobId) {
            setApplicants([])
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const data = await db.getApplicantsByJobId(jobId)
            setApplicants(data)
            setError(null)
        } catch (err) {
            console.error('Error fetching applicants:', err)
            setError(err as Error)
        } finally {
            setLoading(false)
        }
    }, [jobId])

    useEffect(() => {
        fetchApplicants()
    }, [fetchApplicants])

    const updateApplicantStatus = async (
        applicantId: string,
        status: Applicant['status']
    ): Promise<boolean> => {
        const updated = await db.updateApplicant(applicantId, { status })
        if (updated) {
            setApplicants(prev =>
                prev.map(a => a.id === applicantId ? { ...a, status } : a)
            )
            return true
        }
        return false
    }

    const refreshApplicants = () => fetchApplicants()

    return {
        applicants,
        loading,
        error,
        updateApplicantStatus,
        refreshApplicants,
    }
}

export function useAllApplicants() {
    const { profile } = useProfile()
    const [applicants, setApplicants] = useState<ApplicantWithEvaluation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchApplicants = useCallback(async () => {
        if (!profile) {
            setApplicants([])
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const data = await db.getAllApplicantsByProfileId(profile.id)
            setApplicants(data)
            setError(null)
        } catch (err) {
            console.error('Error fetching all applicants:', err)
            setError(err as Error)
        } finally {
            setLoading(false)
        }
    }, [profile])

    useEffect(() => {
        fetchApplicants()
    }, [fetchApplicants])

    const refreshApplicants = () => fetchApplicants()

    return {
        applicants,
        loading,
        error,
        refreshApplicants,
    }
}
