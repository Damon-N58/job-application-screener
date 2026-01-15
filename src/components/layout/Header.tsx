'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { ChevronRight, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Breadcrumb {
    label: string
    href?: string
}

// Generate breadcrumbs based on current path
function getBreadcrumbs(pathname: string): Breadcrumb[] {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: Breadcrumb[] = [{ label: 'Dashboard', href: '/' }]

    let currentPath = ''
    segments.forEach((segment, index) => {
        currentPath += `/${segment}`

        // Map segments to readable labels
        let label = segment.charAt(0).toUpperCase() + segment.slice(1)

        // Handle specific routes
        if (segment === 'jobs') {
            label = 'Jobs'
        } else if (segment === 'new') {
            label = 'New Job'
        } else if (segment === 'candidates') {
            label = 'Candidate Pool'
        } else if (segment === 'settings') {
            label = 'Settings'
        } else if (segment.startsWith('job-')) {
            label = 'Job Details'
        } else if (segment.startsWith('app-')) {
            label = 'Candidate'
        }

        breadcrumbs.push({
            label,
            href: index < segments.length - 1 ? currentPath : undefined
        })
    })

    return breadcrumbs
}

export function Header() {
    const pathname = usePathname()
    const breadcrumbs = getBreadcrumbs(pathname)

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2">
                {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {index > 0 && (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                        {crumb.href ? (
                            <Link
                                href={crumb.href}
                                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="text-sm font-medium text-gray-900">
                                {crumb.label}
                            </span>
                        )}
                    </div>
                ))}
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative">
                    <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-indigo-600"></div>
                    <Bell className="h-5 w-5 text-gray-600" />
                </Button>

                {/* Clerk UserButton */}
                <UserButton
                    afterSignOutUrl="/sign-in"
                    appearance={{
                        elements: {
                            avatarBox: "h-9 w-9",
                            userButtonTrigger: "rounded-full"
                        }
                    }}
                />
            </div>
        </header>
    )
}
