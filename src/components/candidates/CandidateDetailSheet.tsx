'use client'

import { Applicant, Job } from '@/types'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, getScoreColor, getScoreRingColor, formatDate, getStatusColor } from '@/lib/utils'
import {
    FileText,
    Sparkles,
    CheckCircle,
    AlertTriangle,
    Mail,
    Phone,
    Calendar,
    X,
    Download
} from 'lucide-react'

interface CandidateDetailSheetProps {
    applicant: Applicant | null
    job: Job | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onStatusChange?: (applicantId: string, status: Applicant['status']) => void
}

// Circular Score Ring Component
function ScoreRing({ score }: { score: number }) {
    const radius = 50
    const circumference = 2 * Math.PI * radius
    const progress = (score / 100) * circumference
    const offset = circumference - progress

    return (
        <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
                {/* Background ring */}
                <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                />
                {/* Progress ring */}
                <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={cn("transition-all duration-700", getScoreRingColor(score))}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={cn("text-3xl font-bold", getScoreColor(score))}>{score}</span>
                <span className="text-xs text-gray-500">AI Score</span>
            </div>
        </div>
    )
}

export function CandidateDetailSheet({
    applicant,
    job,
    open,
    onOpenChange,
    onStatusChange
}: CandidateDetailSheetProps) {
    if (!applicant) return null

    const hasEvaluation = applicant.aiEvaluation !== undefined

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
                <SheetHeader className="pb-4 border-b">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <SheetTitle className="text-xl">{applicant.name}</SheetTitle>
                                <Badge className={getStatusColor(applicant.status)}>
                                    {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                                </Badge>
                            </div>
                            <SheetDescription className="mt-1">
                                Applying for: {job?.title || 'Unknown Position'}
                            </SheetDescription>
                        </div>
                        <SheetClose asChild>
                            <Button variant="ghost" size="icon">
                                <X className="h-5 w-5" />
                            </Button>
                        </SheetClose>
                    </div>
                </SheetHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {/* Left Column - Resume Preview */}
                    <div className="space-y-4">
                        {/* Resume Placeholder */}
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-gray-400" />
                                    <span className="font-medium text-gray-700">Resume</span>
                                </div>
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                </Button>
                            </div>
                            {/* PDF Viewer Placeholder */}
                            <div className="aspect-[8.5/11] bg-white rounded border border-gray-200 flex items-center justify-center">
                                <div className="text-center p-6">
                                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-sm">PDF Viewer Placeholder</p>
                                    <p className="text-gray-400 text-xs mt-1">{applicant.resumeUrl || 'No resume uploaded'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="rounded-lg border border-gray-200 p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <a href={`mailto:${applicant.email}`} className="text-indigo-600 hover:underline">
                                        {applicant.email}
                                    </a>
                                </div>
                                {applicant.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600">{applicant.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">Applied {formatDate(applicant.submittedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - AI Analysis */}
                    <div className="space-y-4">
                        {hasEvaluation ? (
                            <>
                                {/* AI Score Ring */}
                                <div className="rounded-lg border border-gray-200 p-6 flex flex-col items-center">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="h-5 w-5 text-indigo-600" />
                                        <h4 className="font-medium text-gray-900">AI Evaluation</h4>
                                    </div>
                                    <ScoreRing score={applicant.aiEvaluation!.score} />
                                    <p className="text-sm text-gray-500 mt-4 text-center max-w-xs">
                                        {applicant.aiEvaluation!.summary}
                                    </p>
                                </div>

                                {/* Analysis Tabs */}
                                <Tabs defaultValue="strengths" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="strengths">Strengths</TabsTrigger>
                                        <TabsTrigger value="flags">Red Flags</TabsTrigger>
                                        <TabsTrigger value="match">Match Details</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="strengths" className="mt-4">
                                        <div className="rounded-lg border border-gray-200 p-4">
                                            <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                Key Strengths
                                            </h5>
                                            <ul className="space-y-2">
                                                {applicant.aiEvaluation!.keyStrengths.map((strength, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm">
                                                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                                        <span className="text-gray-600">{strength}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="flags" className="mt-4">
                                        <div className="rounded-lg border border-gray-200 p-4">
                                            <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                Red Flags
                                            </h5>
                                            {applicant.aiEvaluation!.redFlags.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {applicant.aiEvaluation!.redFlags.map((flag, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm">
                                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                                            <span className="text-gray-600">{flag}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-500">No red flags detected</p>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="match" className="mt-4">
                                        <div className="rounded-lg border border-gray-200 p-4 space-y-4">
                                            {/* Must Haves */}
                                            <div>
                                                <h5 className="font-medium text-gray-900 mb-2">Must Haves</h5>
                                                <div className="space-y-2">
                                                    {applicant.aiEvaluation!.matchDetails.mustHaves.map((item, i) => (
                                                        <div key={i} className="flex items-start gap-2 text-sm">
                                                            {item.met ? (
                                                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                            ) : (
                                                                <X className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                                            )}
                                                            <div>
                                                                <span className={item.met ? 'text-gray-700' : 'text-gray-500'}>
                                                                    {item.requirement}
                                                                </span>
                                                                {item.notes && (
                                                                    <p className="text-xs text-gray-400 mt-0.5">{item.notes}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Nice to Haves */}
                                            <div>
                                                <h5 className="font-medium text-gray-900 mb-2">Nice to Haves</h5>
                                                <div className="space-y-2">
                                                    {applicant.aiEvaluation!.matchDetails.niceToHaves.map((item, i) => (
                                                        <div key={i} className="flex items-start gap-2 text-sm">
                                                            {item.met ? (
                                                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                            ) : (
                                                                <span className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                                                            )}
                                                            <span className={item.met ? 'text-gray-700' : 'text-gray-500'}>
                                                                {item.requirement}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Cultural Fit */}
                                            <div>
                                                <h5 className="font-medium text-gray-900 mb-2">Cultural Fit Score</h5>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-600 rounded-full transition-all"
                                                            style={{ width: `${applicant.aiEvaluation!.matchDetails.culturalFitScore}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {applicant.aiEvaluation!.matchDetails.culturalFitScore}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </>
                        ) : (
                            <div className="rounded-lg border border-gray-200 p-8 flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 mb-4" />
                                <h4 className="font-medium text-gray-900">AI Analysis in Progress</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    The AI is reviewing this candidate&apos;s resume...
                                </p>
                            </div>
                        )}

                        {/* Email Context */}
                        {applicant.emailBody && (
                            <div className="rounded-lg border border-gray-200 p-4">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    Email Context
                                </h4>
                                <div className="bg-gray-50 rounded p-3">
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                        {applicant.emailBody}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {hasEvaluation && onStatusChange && (
                            <div className="flex gap-3 pt-4 border-t">
                                {applicant.status !== 'qualified' && (
                                    <Button
                                        variant="indigo"
                                        className="flex-1"
                                        onClick={() => onStatusChange(applicant.id, 'qualified')}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Move to Qualified
                                    </Button>
                                )}
                                {applicant.status !== 'rejected' && (
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => onStatusChange(applicant.id, 'rejected')}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Reject
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
