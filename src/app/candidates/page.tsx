'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CandidateDetailSheet } from '@/components/candidates'
import { useAllApplicants, type ApplicantWithEvaluation } from '@/hooks'
import { formatDate, getScoreColor, getStatusColor, getScoreBgColor } from '@/lib/utils'
import {
    Search,
    Users,
    Sparkles,
    Loader2
} from 'lucide-react'

export default function CandidatesPage() {
    const { applicants, loading } = useAllApplicants()
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedApplicant, setSelectedApplicant] = useState<ApplicantWithEvaluation | null>(null)
    const [sheetOpen, setSheetOpen] = useState(false)

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                        <p className="text-gray-500">Loading candidates...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    // Filter applicants
    const filteredApplicants = applicants.filter(applicant => {
        const matchesSearch = applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            applicant.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter
        return matchesSearch && matchesStatus
    })

    // Sort by score (qualified first with highest scores)
    const sortedApplicants = [...filteredApplicants].sort((a, b) => {
        if (a.ai_evaluation && b.ai_evaluation) {
            return b.ai_evaluation.score - a.ai_evaluation.score
        }
        if (a.ai_evaluation) return -1
        if (b.ai_evaluation) return 1
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    })

    const handleCardClick = (applicant: ApplicantWithEvaluation) => {
        setSelectedApplicant(applicant)
        setSheetOpen(true)
    }

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

    const transformedJob = selectedApplicant?.job ? {
        ...selectedApplicant.job,
        aiPersona: selectedApplicant.job.ai_persona as { mustHaves: string[], niceToHaves: string[], culturalFit: string },
        createdAt: new Date(selectedApplicant.job.created_at),
        updatedAt: new Date(selectedApplicant.job.updated_at)
    } : null

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Candidate Pool</h1>
                    <p className="text-gray-500">All applicants across all job openings</p>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="py-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                {['all', 'qualified', 'analyzing', 'incoming', 'rejected'].map((status) => (
                                    <Button
                                        key={status}
                                        variant={statusFilter === status ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setStatusFilter(status)}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Count */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{filteredApplicants.length} candidates found</span>
                </div>

                {/* Candidates List */}
                <div className="grid gap-4">
                    {sortedApplicants.map((applicant) => (
                        <Card
                            key={applicant.id}
                            className="cursor-pointer transition-shadow hover:shadow-md"
                            onClick={() => handleCardClick(applicant)}
                        >
                            <CardContent className="py-4">
                                <div className="flex items-center gap-4">
                                    {/* Score */}
                                    <div className={`flex h-14 w-14 items-center justify-center rounded-full ${applicant.ai_evaluation ? getScoreBgColor(applicant.ai_evaluation.score) : 'bg-gray-100'
                                        }`}>
                                        {applicant.ai_evaluation ? (
                                            <div className="text-center">
                                                <span className={`text-lg font-bold ${getScoreColor(applicant.ai_evaluation.score)}`}>
                                                    {applicant.ai_evaluation.score}
                                                </span>
                                            </div>
                                        ) : (
                                            <Sparkles className="h-6 w-6 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">{applicant.name}</h3>
                                            <Badge className={getStatusColor(applicant.status)}>
                                                {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500">{applicant.email}</p>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                            <span>Applied to: {applicant.job?.title || 'Unknown Position'}</span>
                                            <span>•</span>
                                            <span>{formatDate(new Date(applicant.submitted_at))}</span>
                                        </div>
                                    </div>

                                    {/* Strengths Preview */}
                                    {applicant.ai_evaluation && applicant.ai_evaluation.key_strengths.length > 0 && (
                                        <div className="hidden lg:block max-w-xs">
                                            <p className="text-xs text-gray-500 mb-1">Top strength:</p>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {applicant.ai_evaluation.key_strengths[0]}
                                            </p>
                                        </div>
                                    )}

                                    {/* Source */}
                                    <Badge variant="outline" className="hidden md:flex gap-1">
                                        Via {applicant.source}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredApplicants.length === 0 && (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Users className="h-12 w-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                                <p className="text-gray-500 text-center">
                                    {applicants.length === 0
                                        ? "Candidates will appear here once applications come in"
                                        : "Try adjusting your search or filter criteria"
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Candidate Detail Sheet */}
                {transformedApplicant && (
                    <CandidateDetailSheet
                        applicant={transformedApplicant as any}
                        job={transformedJob as any}
                        open={sheetOpen}
                        onOpenChange={setSheetOpen}
                    />
                )}
            </div>
        </DashboardLayout>
    )
}
