'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Sparkles,
    CheckCircle,
    PlusCircle,
    X,
    ArrowLeft,
    Briefcase,
    Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useJobs } from '@/hooks'

const departments = [
    'Engineering',
    'Design',
    'Sales',
    'Marketing',
    'Operations',
    'Human Resources',
    'Finance',
    'Customer Success'
]

export default function NewJobPage() {
    const router = useRouter()
    const { createJob } = useJobs()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        description: '',
        mustHaves: [] as string[],
        niceToHaves: [] as string[],
        culturalFit: ''
    })

    // Input state for adding requirements
    const [mustHaveInput, setMustHaveInput] = useState('')
    const [niceToHaveInput, setNiceToHaveInput] = useState('')

    const addMustHave = () => {
        if (mustHaveInput.trim()) {
            setFormData(prev => ({
                ...prev,
                mustHaves: [...prev.mustHaves, mustHaveInput.trim()]
            }))
            setMustHaveInput('')
        }
    }

    const removeMustHave = (index: number) => {
        setFormData(prev => ({
            ...prev,
            mustHaves: prev.mustHaves.filter((_, i) => i !== index)
        }))
    }

    const addNiceToHave = () => {
        if (niceToHaveInput.trim()) {
            setFormData(prev => ({
                ...prev,
                niceToHaves: [...prev.niceToHaves, niceToHaveInput.trim()]
            }))
            setNiceToHaveInput('')
        }
    }

    const removeNiceToHave = (index: number) => {
        setFormData(prev => ({
            ...prev,
            niceToHaves: prev.niceToHaves.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const newJob = await createJob({
                title: formData.title,
                department: formData.department,
                description: formData.description,
                status: 'active',
                ai_persona: {
                    mustHaves: formData.mustHaves,
                    niceToHaves: formData.niceToHaves,
                    culturalFit: formData.culturalFit
                }
            })

            if (newJob) {
                router.push('/jobs')
            } else {
                setError('Failed to create job. Please try again.')
            }
        } catch (err) {
            console.error('Error creating job:', err)
            setError('An unexpected error occurred.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const isFormValid = formData.title && formData.department && formData.description && formData.mustHaves.length > 0

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back Button */}
                <Link href="/jobs">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Jobs
                    </Button>
                </Link>

                {/* Page Header */}
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black">
                        <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create New Job Opening</h1>
                        <p className="text-gray-500">Define the role and configure AI screening criteria</p>
                    </div>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Enter the essential details for this job opening
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Job Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Senior Software Engineer"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department *</Label>
                                    <Select
                                        value={formData.department}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>
                                                    {dept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Job Description *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                                    className="min-h-[150px]"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Persona Configuration */}
                    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                                    <Sparkles className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <CardTitle>AI Persona Configuration</CardTitle>
                                    <CardDescription>
                                        Define what the AI should look for when screening candidates
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Must Haves */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Label className="text-base font-semibold">Must Haves *</Label>
                                    <Badge variant="destructive" className="text-xs">Required</Badge>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Critical requirements that candidates must meet. The AI will flag candidates missing these.
                                </p>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g., 5+ years Python experience"
                                        value={mustHaveInput}
                                        onChange={(e) => setMustHaveInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMustHave())}
                                    />
                                    <Button type="button" onClick={addMustHave} variant="outline">
                                        <PlusCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                                {formData.mustHaves.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.mustHaves.map((item, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="gap-1.5 pl-3 pr-1.5 py-1.5 bg-white border border-gray-200"
                                            >
                                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                                {item}
                                                <button
                                                    type="button"
                                                    onClick={() => removeMustHave(index)}
                                                    className="ml-1 rounded-full p-0.5 hover:bg-gray-100"
                                                >
                                                    <X className="h-3.5 w-3.5 text-gray-400" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Nice to Haves */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Label className="text-base font-semibold">Nice to Haves</Label>
                                    <Badge variant="secondary" className="text-xs">Optional</Badge>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Preferred qualifications that would be a bonus. These boost a candidate&apos;s score but aren&apos;t required.
                                </p>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g., Machine learning experience"
                                        value={niceToHaveInput}
                                        onChange={(e) => setNiceToHaveInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNiceToHave())}
                                    />
                                    <Button type="button" onClick={addNiceToHave} variant="outline">
                                        <PlusCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                                {formData.niceToHaves.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.niceToHaves.map((item, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="gap-1.5 pl-3 pr-1.5 py-1.5 bg-white border border-gray-200"
                                            >
                                                {item}
                                                <button
                                                    type="button"
                                                    onClick={() => removeNiceToHave(index)}
                                                    className="ml-1 rounded-full p-0.5 hover:bg-gray-100"
                                                >
                                                    <X className="h-3.5 w-3.5 text-gray-400" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Cultural Fit */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Cultural Fit Description</Label>
                                <p className="text-sm text-gray-500">
                                    Describe the ideal candidate&apos;s personality, work style, and values. The AI will assess cultural alignment.
                                </p>
                                <Textarea
                                    placeholder="e.g., Self-motivated individual who thrives in a fast-paced startup environment. Must be comfortable with ambiguity and able to take ownership of projects..."
                                    className="min-h-[100px]"
                                    value={formData.culturalFit}
                                    onChange={(e) => setFormData(prev => ({ ...prev, culturalFit: e.target.value }))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Email Integration Notice */}
                    <Card className="bg-gray-50 border-dashed">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Automatic Email Scraping Enabled</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Applications sent to <span className="font-mono text-gray-700">jobs@nineteen58.co.za</span> will be automatically
                                        captured and associated with this job based on subject line matching.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <Link href="/jobs">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={!isFormValid || isSubmitting}
                            className="min-w-[150px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Job Opening'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    )
}
