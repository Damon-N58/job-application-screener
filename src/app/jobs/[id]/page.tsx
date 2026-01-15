'use client'

import { useState } from 'react'
import { use } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ApplicantCard, CandidateDetailSheet } from '@/components/candidates'
import { useJob } from '@/hooks/useJobs'
import { useApplicants, type ApplicantWithEvaluation } from '@/hooks/useApplicants'
import { formatDate, getStatusColor } from '@/lib/utils'
import { Database } from '@/types/database.types'
import {
    ArrowLeft,
    Settings,
    Mail,
    Sparkles,
    CheckCircle,
    X,
    Loader2,
    Users
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type ApplicantStatus = Database['public']['Tables']['applicants']['Row']['status']

interface KanbanColumnProps {
    title: string
    icon: React.ReactNode
    status: ApplicantStatus
    applicants: ApplicantWithEvaluation[]
    color: string
    onCardClick: (applicant: ApplicantWithEvaluation) => void
}

function KanbanColumn({ title, icon, applicants, color, onCardClick }: KanbanColumnProps) {
    const count = applicants.length

    return (
        <div className="flex flex-col min-w-[300px] max-w-[300px]">
            {/* Column Header */}
            <div className={`rounded-t-lg px-4 py-3 ${color}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {icon}
                        <h3 className="font-medium text-gray-900">{title}</h3>
                    </div>
                    <Badge variant="secondary" className="bg-white/80">
                        {count}
                    </Badge>
                </div>
            </div>

            {/* Column Content */}
            <div className="flex-1 bg-gray-100 rounded-b-lg p-3 space-y-3 min-h-[400px]">
                {applicants.length === 0 ? (
                    <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-400">No applicants</p>
                    </div>
                ) : (
                    applicants.map((applicant) => (
                        <ApplicantCard
                            key={applicant.id}
                            applicant={applicant}
                            onClick={() => onCardClick(applicant)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default function JobDetailPage({ params }: PageProps) {
    const { id } = use(params)
    const { job, loading: jobLoading, error: jobError } = useJob(id)
    const { applicants, loading: applicantsLoading, updateApplicantStatus } = useApplicants(id)

    const [selectedApplicant, setSelectedApplicant] = useState<ApplicantWithEvaluation | null>(null)
    const [sheetOpen, setSheetOpen] = useState(false)

    const handleCardClick = (applicant: ApplicantWithEvaluation) => {
        setSelectedApplicant(applicant)
        setSheetOpen(true)
    }

    const handleStatusChange = async (applicantId: string, newStatus: ApplicantStatus) => {
        await updateApplicantStatus(applicantId, newStatus)
        setSheetOpen(false)
    }

    if (jobLoading || applicantsLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                        <p className="text-gray-500">Loading job details...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!job || jobError) {
        notFound()
    }

    const aiPersona = job.ai_persona as { mustHaves: string[], niceToHaves: string[], culturalFit: string }

    // Group applicants by status
    const incomingApplicants = applicants.filter(a => a.status === 'incoming')
    const analyzingApplicants = applicants.filter(a => a.status === 'analyzing')
    const qualifiedApplicants = applicants.filter(a => a.status === 'qualified')
    const rejectedApplicants = applicants.filter(a => a.status === 'rejected')

    // Transform applicant for CandidateDetailSheet
    const transformedApplicant = selectedApplicant ? {
        ...selectedApplicant,
        phone: selectedApplicant.phone || undefined,
        sourceDetail: selectedApplicant.source_detail || '',
        emailBody: selectedApplicant.email_body || undefined,
        resumeUrl: selectedApplicant.resume_url || undefined,
        submittedAt: new Date(selectedApplicant.submitted_at),
        aiEvaluation: selectedApplicant.ai_evaluation ? {
            score: selectedApplicant.ai_evaluation.score,
            summary: selectedApplicant.ai_evaluation.summary,
            keyStrengths: selectedApplicant.ai_evaluation.key_strengths,
            redFlags: selectedApplicant.ai_evaluation.red_flags,
            matchDetails: selectedApplicant.ai_evaluation.match_details as {
                mustHaves: { requirement: string; met: boolean; notes?: string }[]
                niceToHaves: { requirement: string; met: boolean }[]
                culturalFitScore: number
            }
        } : undefined
    } : null

    const transformedJob = {
        ...job,
        aiPersona,
        createdAt: new Date(job.created_at),
        updatedAt: new Date(job.updated_at)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <Link href="/jobs">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                                <Badge className={getStatusColor(job.status)}>
                                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                </Badge>
                            </div>
                            <p className="text-gray-500 mt-1">
                                {job.department} • Posted {formatDate(new Date(job.created_at))} • {applicants.length} applicants
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Edit Job
                        </Button>
                    </div>
                </div>

                {/* AI Persona Summary */}
                <Card className="bg-gradient-to-r from-indigo-50 to-white border-indigo-100">
                    <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                                <Sparkles className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900 mb-2">AI Screening Criteria</h3>
                                <div className="flex flex-wrap gap-2">
                                    {aiPersona.mustHaves?.map((req, i) => (
                                        <Badge key={i} variant="secondary" className="bg-white">
                                            <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                                            {req}
                                        </Badge>
                                    ))}
                                    {aiPersona.niceToHaves?.map((req, i) => (
                                        <Badge key={i} variant="outline" className="bg-white">
                                            {req}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Empty state when no applicants */}
                {applicants.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                                <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applicants yet</h3>
                            <p className="text-gray-500 text-center max-w-md">
                                Applications will appear here once candidates apply. Share this job posting or wait for emails to
                                <span className="font-mono mx-1">jobs@nineteen58.co.za</span>
                                to be processed.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    /* Kanban Board */
                    <div className="overflow-x-auto pb-4">
                        <div className="flex gap-4 min-w-max">
                            <KanbanColumn
                                title="Incoming"
                                icon={<Mail className="h-4 w-4 text-blue-600" />}
                                status="incoming"
                                applicants={incomingApplicants}
                                color="bg-blue-50"
                                onCardClick={handleCardClick}
                            />
                            <KanbanColumn
                                title="AI Analyzing"
                                icon={<Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />}
                                status="analyzing"
                                applicants={analyzingApplicants}
                                color="bg-indigo-50"
                                onCardClick={handleCardClick}
                            />
                            <KanbanColumn
                                title="Qualified"
                                icon={<CheckCircle className="h-4 w-4 text-green-600" />}
                                status="qualified"
                                applicants={qualifiedApplicants}
                                color="bg-green-50"
                                onCardClick={handleCardClick}
                            />
                            <KanbanColumn
                                title="Rejected"
                                icon={<X className="h-4 w-4 text-red-600" />}
                                status="rejected"
                                applicants={rejectedApplicants}
                                color="bg-red-50"
                                onCardClick={handleCardClick}
                            />
                        </div>
                    </div>
                )}

                {/* Candidate Detail Sheet */}
                {transformedApplicant && (
                    <CandidateDetailSheet
                        applicant={transformedApplicant as any}
                        job={transformedJob as any}
                        open={sheetOpen}
                        onOpenChange={setSheetOpen}
                        onStatusChange={handleStatusChange}
                    />
                )}
            </div>
        </DashboardLayout>
    )
}
