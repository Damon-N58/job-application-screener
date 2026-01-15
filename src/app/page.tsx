'use client'

import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  Users,
  CheckCircle,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { useJobs, useDashboardStats, useProfile } from '@/hooks'
import { formatRelativeTime, getScoreColor } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { profile, loading: profileLoading } = useProfile()
  const { jobs, loading: jobsLoading } = useJobs()
  const { stats, loading: statsLoading } = useDashboardStats()

  const isLoading = profileLoading || jobsLoading || statsLoading

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const activeJobs = jobs.filter(j => j.status === 'active')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! Here&apos;s your hiring overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Jobs
              </CardTitle>
              <Briefcase className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.activeJobs} currently hiring
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Applicants
              </CardTitle>
              <Users className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeApplicants}</div>
              <p className="text-xs text-gray-500 mt-1">
                Across all job openings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Qualified Today
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.qualifiedToday}</div>
              <p className="text-xs text-gray-500 mt-1">
                Ready for interview
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                AI Processing
              </CardTitle>
              <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">{stats.aiProcessing}</div>
              <p className="text-xs text-gray-500 mt-1">
                Resumes being analyzed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State for New Users */}
        {jobs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-4">
                <Sparkles className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Nineteen58 Recruiter!</h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                Get started by creating your first job opening. Our AI will help you screen candidates automatically.
              </p>
              <Link href="/jobs/new">
                <Button>
                  Create Your First Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Active Jobs Quick View */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Active Job Openings</CardTitle>
                  <CardDescription>Quick overview of all positions</CardDescription>
                </div>
                <Link href="/jobs">
                  <Button variant="outline">
                    View All Jobs
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {activeJobs.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeJobs.slice(0, 6).map((job) => (
                      <Link key={job.id} href={`/jobs/${job.id}`}>
                        <div className="rounded-lg border border-gray-200 p-4 transition-all hover:border-gray-300 hover:shadow-sm">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{job.title}</h3>
                              <p className="text-sm text-gray-500">{job.department}</p>
                            </div>
                            <Badge variant="success">{job.status}</Badge>
                          </div>
                          <div className="mt-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Sparkles className="h-4 w-4 text-indigo-500" />
                              {(job.ai_persona as { mustHaves: string[] }).mustHaves?.length || 0} screening criteria
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No active jobs. Create one to start receiving applications!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
