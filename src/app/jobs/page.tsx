'use client'

import { DashboardLayout } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Briefcase,
    Users,
    PlusCircle,
    Calendar,
    ArrowRight,
    Loader2,
    Sparkles
} from 'lucide-react'
import { useJobs } from '@/hooks'
import { formatDate, getStatusColor } from '@/lib/utils'
import Link from 'next/link'

export default function JobsPage() {
    const { jobs, loading } = useJobs()

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                        <p className="text-gray-500">Loading jobs...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    const activeJobs = jobs.filter(j => j.status === 'active')
    const pausedJobs = jobs.filter(j => j.status === 'paused')
    const closedJobs = jobs.filter(j => j.status === 'closed')

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
                        <p className="text-gray-500">Manage your job openings and view applicants</p>
                    </div>
                    <Link href="/jobs/new">
                        <Button>
                            <PlusCircle className="h-4 w-4" />
                            New Job Opening
                        </Button>
                    </Link>
                </div>

                {/* Empty State */}
                {jobs.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                                <Briefcase className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No job openings yet</h3>
                            <p className="text-gray-500 text-center mb-6">
                                Create your first job opening to start receiving AI-screened applications.
                            </p>
                            <Link href="/jobs/new">
                                <Button>
                                    <PlusCircle className="h-4 w-4" />
                                    Create First Job
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Active Jobs */}
                {activeJobs.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Active ({activeJobs.length})</h2>
                        <div className="grid gap-4">
                            {activeJobs.map((job) => {
                                const aiPersona = job.ai_persona as { mustHaves: string[], niceToHaves: string[], culturalFit: string }
                                return (
                                    <Card key={job.id} className="transition-shadow hover:shadow-md">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                                                        <Briefcase className="h-6 w-6 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                                        <p className="text-sm text-gray-500">{job.department}</p>
                                                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar className="h-4 w-4" />
                                                                Posted {formatDate(new Date(job.created_at))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge className={getStatusColor(job.status)}>
                                                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                                    </Badge>
                                                    <Link href={`/jobs/${job.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            View Applicants
                                                            <ArrowRight className="h-4 w-4 ml-1" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                            {/* AI Criteria Preview */}
                                            {aiPersona.mustHaves?.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                                        <Sparkles className="h-3 w-3 text-indigo-500" />
                                                        AI Screening Criteria
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {aiPersona.mustHaves.slice(0, 3).map((req, i) => (
                                                            <Badge key={i} variant="secondary" className="text-xs">
                                                                {req}
                                                            </Badge>
                                                        ))}
                                                        {aiPersona.mustHaves.length > 3 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{aiPersona.mustHaves.length - 3} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* Paused Jobs */}
                {pausedJobs.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Paused ({pausedJobs.length})</h2>
                        <div className="grid gap-4">
                            {pausedJobs.map((job) => (
                                <Card key={job.id} className="opacity-75">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                                                    <Briefcase className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-700">{job.title}</h3>
                                                    <p className="text-sm text-gray-500">{job.department}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={getStatusColor(job.status)}>
                                                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                                </Badge>
                                                <Link href={`/jobs/${job.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        View
                                                        <ArrowRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Closed Jobs */}
                {closedJobs.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-500">Closed ({closedJobs.length})</h2>
                        <div className="grid gap-4">
                            {closedJobs.map((job) => (
                                <Card key={job.id} className="opacity-50">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                                                    <Briefcase className="h-6 w-6 text-gray-300" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-500">{job.title}</h3>
                                                    <p className="text-sm text-gray-400">{job.department}</p>
                                                </div>
                                            </div>
                                            <Badge className={getStatusColor(job.status)}>
                                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </DashboardLayout>
    )
}
