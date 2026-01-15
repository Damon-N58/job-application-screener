'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { useUser } from '@clerk/nextjs'
import { getProfileByClerkId, createProfile } from '@/lib/db'
import { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileContextType {
    profile: Profile | null
    loading: boolean
    error: Error | null
    refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType>({
    profile: null,
    loading: true,
    error: null,
    refreshProfile: async () => { },
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchOrCreateProfile = useCallback(async () => {
        if (!user) {
            setProfile(null)
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            // Try to get existing profile
            let existingProfile = await getProfileByClerkId(user.id)

            // If no profile exists, create one (fallback for webhook failures)
            if (!existingProfile) {
                existingProfile = await createProfile({
                    clerk_user_id: user.id,
                    email: user.emailAddresses[0]?.emailAddress || '',
                    full_name: user.fullName || null,
                    company_name: null,
                })
            }

            setProfile(existingProfile)
            setError(null)
        } catch (err) {
            console.error('Error fetching profile:', err)
            setError(err as Error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (isLoaded) {
            fetchOrCreateProfile()
        }
    }, [isLoaded, fetchOrCreateProfile])

    const refreshProfile = useCallback(async () => {
        await fetchOrCreateProfile()
    }, [fetchOrCreateProfile])

    return (
        <ProfileContext.Provider value={{ profile, loading, error, refreshProfile }}>
            {children}
        </ProfileContext.Provider>
    )
}

export function useProfile() {
    return useContext(ProfileContext)
}
