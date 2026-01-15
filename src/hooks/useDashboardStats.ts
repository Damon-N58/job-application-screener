'use client'

import { useState, useEffect, useCallback } from 'react'
import { useProfile } from './useProfile'
import { getDashboardStats } from '@/lib/db'

interface DashboardStats {
    totalJobs: number
    activeJobs: number
    activeApplicants: number
    qualifiedToday: number
    aiProcessing: number
}

export function useDashboardStats() {
    const { profile } = useProfile()
    const [stats, setStats] = useState<DashboardStats>({
        totalJobs: 0,
        activeJobs: 0,
        activeApplicants: 0,
        qualifiedToday: 0,
        aiProcessing: 0,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchStats = useCallback(async () => {
        if (!profile) {
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const data = await getDashboardStats(profile.id)
            setStats(data)
            setError(null)
        } catch (err) {
            console.error('Error fetching dashboard stats:', err)
            setError(err as Error)
        } finally {
            setLoading(false)
        }
    }, [profile])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    const refreshStats = () => fetchStats()

    return {
        stats,
        loading,
        error,
        refreshStats,
    }
}
