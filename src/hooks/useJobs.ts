'use client'

import { useState, useEffect, useCallback } from 'react'
import { useProfile } from './useProfile'
import * as db from '@/lib/db'
import { Database } from '@/types/database.types'

type Job = Database['public']['Tables']['jobs']['Row']
type JobInsert = Database['public']['Tables']['jobs']['Insert']

export function useJobs() {
    const { profile } = useProfile()
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchJobs = useCallback(async () => {
        if (!profile) {
            setJobs([])
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const data = await db.getJobsByProfileId(profile.id)
            setJobs(data)
            setError(null)
        } catch (err) {
            console.error('Error fetching jobs:', err)
            setError(err as Error)
        } finally {
            setLoading(false)
        }
    }, [profile])

    useEffect(() => {
        fetchJobs()
    }, [fetchJobs])

    const createJob = async (jobData: Omit<JobInsert, 'profile_id'>): Promise<Job | null> => {
        if (!profile) return null

        const newJob = await db.createJob({
            ...jobData,
            profile_id: profile.id,
        })

        if (newJob) {
            setJobs(prev => [newJob, ...prev])
        }
        return newJob
    }

    const updateJob = async (jobId: string, updates: Partial<Job>): Promise<Job | null> => {
        const updatedJob = await db.updateJob(jobId, updates)
        if (updatedJob) {
            setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j))
        }
        return updatedJob
    }

    const deleteJob = async (jobId: string): Promise<boolean> => {
        const success = await db.deleteJob(jobId)
        if (success) {
            setJobs(prev => prev.filter(j => j.id !== jobId))
        }
        return success
    }

    const refreshJobs = () => fetchJobs()

    return {
        jobs,
        loading,
        error,
        createJob,
        updateJob,
        deleteJob,
        refreshJobs,
    }
}

export function useJob(jobId: string) {
    const [job, setJob] = useState<Job | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        async function fetchJob() {
            setLoading(true)
            try {
                const data = await db.getJobById(jobId)
                setJob(data)
                setError(null)
            } catch (err) {
                console.error('Error fetching job:', err)
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        if (jobId) {
            fetchJob()
        }
    }, [jobId])

    return { job, loading, error }
}
