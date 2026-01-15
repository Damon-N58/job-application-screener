'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
    UserCircle,
    Mail,
    Sparkles,
    Settings,
    CheckCircle,
    Link as LinkIcon
} from 'lucide-react'

export default function SettingsPage() {
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSaving(false)
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                        <Settings className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-500">Manage your account and AI preferences</p>
                    </div>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="email">Email Integration</TabsTrigger>
                        <TabsTrigger value="ai">AI Configuration</TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserCircle className="h-5 w-5" />
                                    Profile Settings
                                </CardTitle>
                                <CardDescription>
                                    Manage your account information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                                        <UserCircle className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <div>
                                        <Button variant="outline" size="sm">Change Avatar</Button>
                                        <p className="text-xs text-gray-500 mt-2">JPG, PNG. Max 2MB</p>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" defaultValue="Damon" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" defaultValue="Carle" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" defaultValue="damon@nineteen58.co.za" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company">Company Name</Label>
                                    <Input id="company" defaultValue="Nineteen58" />
                                </div>

                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Email Integration Tab */}
                    <TabsContent value="email">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Email Integration
                                </CardTitle>
                                <CardDescription>
                                    Configure automatic email scraping for applications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Current Integration */}
                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">Email Integration Active</h4>
                                                <p className="text-sm text-gray-600">
                                                    Monitoring: <span className="font-mono">jobs@nineteen58.co.za</span>
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="success">Connected</Badge>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-gray-500">Emails Processed</p>
                                        <p className="text-2xl font-bold mt-1">1,247</p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-gray-500">Applications Captured</p>
                                        <p className="text-2xl font-bold mt-1">892</p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-gray-500">Last Sync</p>
                                        <p className="text-2xl font-bold mt-1">2m ago</p>
                                    </div>
                                </div>

                                {/* Configuration */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Email Matching Rules</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <span className="text-sm text-gray-600">Match subject containing job title</span>
                                            <Badge variant="secondary">Enabled</Badge>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <span className="text-sm text-gray-600">Auto-extract resume attachments</span>
                                            <Badge variant="secondary">Enabled</Badge>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <span className="text-sm text-gray-600">Parse LinkedIn profile links</span>
                                            <Badge variant="secondary">Enabled</Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* AI Configuration Tab */}
                    <TabsContent value="ai">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-indigo-600" />
                                    AI Configuration
                                </CardTitle>
                                <CardDescription>
                                    Configure how the AI evaluates candidates
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Model Selection */}
                                <div className="space-y-2">
                                    <Label>AI Model</Label>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="relative rounded-lg border-2 border-indigo-600 bg-indigo-50 p-4 cursor-pointer">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">GPT-4o</h4>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Best accuracy, comprehensive analysis
                                                    </p>
                                                </div>
                                                <CheckCircle className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <Badge variant="indigo" className="mt-3">Current</Badge>
                                        </div>
                                        <div className="rounded-lg border p-4 cursor-pointer hover:border-gray-300">
                                            <h4 className="font-medium text-gray-900">GPT-4o Mini</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Faster processing, good for high volume
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Scoring Weights */}
                                <div className="space-y-4">
                                    <Label>Scoring Weights</Label>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Must Haves Match</span>
                                            <span className="font-medium">50%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full">
                                            <div className="h-2 w-1/2 bg-indigo-600 rounded-full" />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Nice to Haves Match</span>
                                            <span className="font-medium">25%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full">
                                            <div className="h-2 w-1/4 bg-indigo-600 rounded-full" />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Cultural Fit</span>
                                            <span className="font-medium">25%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full">
                                            <div className="h-2 w-1/4 bg-indigo-600 rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                {/* Auto-actions */}
                                <div className="space-y-4">
                                    <Label>Automated Actions</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <span className="text-sm text-gray-900">Auto-qualify high scorers</span>
                                                <p className="text-xs text-gray-500">Candidates scoring 85+ are auto-qualified</p>
                                            </div>
                                            <Badge variant="secondary">Enabled</Badge>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <span className="text-sm text-gray-900">Auto-reject low scorers</span>
                                                <p className="text-xs text-gray-500">Candidates scoring below 30 are auto-rejected</p>
                                            </div>
                                            <Badge variant="outline">Disabled</Badge>
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save AI Settings'}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
