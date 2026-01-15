'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, getScoreColor, getScoreBgColor } from '@/lib/utils'
import { ApplicantWithEvaluation } from '@/hooks/useApplicants'
import {
    Mail,
    Sparkles
} from 'lucide-react'

interface ApplicantCardProps {
    applicant: ApplicantWithEvaluation
    onClick: () => void
}

export function ApplicantCard({ applicant, onClick }: ApplicantCardProps) {
    const hasEvaluation = applicant.ai_evaluation !== undefined
    const score = applicant.ai_evaluation?.score
    const topStrength = applicant.ai_evaluation?.key_strengths?.[0]

    return (
        <Card
            className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                hasEvaluation && score && score >= 80 && "border-l-4 border-l-green-500"
            )}
            onClick={onClick}
        >
            <CardContent className="p-4">
                {/* Header with name and score */}
                <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{applicant.name}</h4>
                        <p className="text-sm text-gray-500 truncate">{applicant.email}</p>
                    </div>

                    {/* AI Score */}
                    {hasEvaluation && score !== undefined ? (
                        <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full ml-2 flex-shrink-0",
                            getScoreBgColor(score)
                        )}>
                            <span className={cn("text-sm font-bold", getScoreColor(score))}>
                                {score}
                            </span>
                        </div>
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 ml-2 flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Source badge */}
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs gap-1">
                        <Mail className="h-3 w-3" />
                        Via {applicant.source}
                    </Badge>
                </div>

                {/* Top strength preview */}
                {topStrength && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Top strength:</p>
                        <p className="text-xs text-gray-600 line-clamp-2">{topStrength}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
