'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home,
    Briefcase,
    Users,
    Settings,
    PlusCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
    { label: 'Dashboard', href: '/', icon: Home },
    { label: 'Active Jobs', href: '/jobs', icon: Briefcase },
    { label: 'Candidate Pool', href: '/candidates', icon: Users },
    { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center border-b border-gray-200 px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
                            <span className="text-sm font-bold text-white">N58</span>
                        </div>
                        <span className="text-lg font-semibold tracking-tight">Nineteen58</span>
                    </Link>
                </div>

                {/* New Job Button */}
                <div className="px-4 py-4">
                    <Button asChild className="w-full" variant="default">
                        <Link href="/jobs/new">
                            <PlusCircle className="h-4 w-4" />
                            New Job Opening
                        </Link>
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(item.href))

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <item.icon className={cn(
                                    'h-5 w-5',
                                    isActive ? 'text-gray-900' : 'text-gray-400'
                                )} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4">
                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-xs font-medium text-gray-600">Email Integration</p>
                        <p className="mt-1 text-xs text-gray-500">
                            Monitoring: jobs@nineteen58.co.za
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            <span className="text-xs text-green-700">Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
