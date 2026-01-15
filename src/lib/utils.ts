import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Format date to readable string
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date)
}

// Format relative time
export function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return formatDate(date)
}

// Get score color based on value
export function getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-indigo-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
}

export function getScoreBgColor(score: number): string {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-indigo-100'
    if (score >= 40) return 'bg-yellow-100'
    return 'bg-red-100'
}

export function getScoreRingColor(score: number): string {
    if (score >= 80) return 'stroke-green-600'
    if (score >= 60) return 'stroke-indigo-600'
    if (score >= 40) return 'stroke-yellow-600'
    return 'stroke-red-600'
}

// Get status color
export function getStatusColor(status: string): string {
    switch (status) {
        case 'active':
        case 'qualified':
            return 'bg-green-100 text-green-800'
        case 'paused':
        case 'analyzing':
            return 'bg-yellow-100 text-yellow-800'
        case 'closed':
        case 'rejected':
            return 'bg-red-100 text-red-800'
        case 'incoming':
            return 'bg-blue-100 text-blue-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}
