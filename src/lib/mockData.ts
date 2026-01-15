import { Job, Applicant, DashboardStats } from '@/types'

// Helper to create dates relative to now
const daysAgo = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date
}

const hoursAgo = (hours: number) => {
    const date = new Date()
    date.setHours(date.getHours() - hours)
    return date
}

// Mock Jobs
export const mockJobs: Job[] = [
    {
        id: 'job-001',
        title: 'Senior Python Developer',
        department: 'Engineering',
        description: 'We are looking for an experienced Python developer to join our backend team. The ideal candidate will have strong experience with Django, FastAPI, and cloud infrastructure.',
        status: 'active',
        createdAt: daysAgo(14),
        applicantCount: 24,
        aiPersona: {
            mustHaves: [
                '5+ years Python experience',
                'Experience with Django or FastAPI',
                'Cloud infrastructure (AWS/GCP)',
                'REST API design'
            ],
            niceToHaves: [
                'Machine learning experience',
                'Kubernetes knowledge',
                'Open source contributions'
            ],
            culturalFit: 'Self-motivated individual who thrives in a fast-paced startup environment. Must be comfortable with ambiguity and able to take ownership of projects from conception to deployment.'
        }
    },
    {
        id: 'job-002',
        title: 'Product Designer',
        department: 'Design',
        description: 'Join our design team to create beautiful, user-centered experiences. You will work closely with product and engineering to deliver world-class interfaces.',
        status: 'active',
        createdAt: daysAgo(7),
        applicantCount: 18,
        aiPersona: {
            mustHaves: [
                '3+ years product design experience',
                'Proficiency in Figma',
                'Strong portfolio of shipped products',
                'Experience with design systems'
            ],
            niceToHaves: [
                'Motion design skills',
                'Front-end development knowledge',
                'Experience with B2B SaaS'
            ],
            culturalFit: 'Collaborative designer who values feedback and iteration. Should be passionate about solving real user problems and can articulate design decisions clearly.'
        }
    },
    {
        id: 'job-003',
        title: 'Head of Sales',
        department: 'Sales',
        description: 'Lead our sales team and drive revenue growth for our AI recruitment platform. This is a strategic role with significant impact on company trajectory.',
        status: 'active',
        createdAt: daysAgo(21),
        applicantCount: 12,
        aiPersona: {
            mustHaves: [
                '8+ years B2B sales experience',
                '3+ years in sales leadership',
                'Track record of hitting targets',
                'Experience selling to HR/Recruiting'
            ],
            niceToHaves: [
                'SaaS sales background',
                'Africa market experience',
                'Enterprise sales experience'
            ],
            culturalFit: 'Natural leader who can inspire and develop a sales team. Results-oriented but ethical in approach. Excellent communication and negotiation skills.'
        }
    },
    {
        id: 'job-004',
        title: 'DevOps Engineer',
        department: 'Engineering',
        description: 'Manage and improve our cloud infrastructure. Focus on reliability, security, and developer experience.',
        status: 'paused',
        createdAt: daysAgo(30),
        applicantCount: 8,
        aiPersona: {
            mustHaves: [
                '4+ years DevOps/SRE experience',
                'Strong Kubernetes knowledge',
                'CI/CD pipeline expertise',
                'Monitoring and observability'
            ],
            niceToHaves: [
                'Terraform experience',
                'Security certifications',
                'Cost optimization experience'
            ],
            culturalFit: 'Detail-oriented engineer who takes pride in building reliable systems. Proactive about identifying and fixing issues before they become problems.'
        }
    }
]

// Mock Applicants
export const mockApplicants: Applicant[] = [
    // Senior Python Developer applicants
    {
        id: 'app-001',
        jobId: 'job-001',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+27 82 123 4567',
        resumeUrl: '/resumes/sarah-johnson.pdf',
        source: 'email',
        sourceDetail: 'jobs@nineteen58.co.za',
        status: 'qualified',
        submittedAt: hoursAgo(2),
        emailBody: 'Dear Hiring Team,\n\nI am excited to apply for the Senior Python Developer position. With 7 years of Python experience and extensive work with Django and AWS, I believe I would be a strong addition to your team.\n\nI have led multiple successful projects including a real-time data processing pipeline serving 10M+ requests daily.\n\nBest regards,\nSarah',
        aiEvaluation: {
            score: 92,
            keyStrengths: [
                '7 years of Python experience exceeds requirement',
                'Led enterprise-scale projects with Django',
                'Strong AWS and cloud infrastructure background',
                'Clear communication style in application'
            ],
            redFlags: [],
            matchDetails: {
                mustHaves: [
                    { requirement: '5+ years Python experience', met: true, notes: '7 years confirmed from resume' },
                    { requirement: 'Experience with Django or FastAPI', met: true, notes: 'Senior Django developer' },
                    { requirement: 'Cloud infrastructure (AWS/GCP)', met: true, notes: 'AWS certified, 4 years experience' },
                    { requirement: 'REST API design', met: true, notes: 'Designed APIs for 3 major products' }
                ],
                niceToHaves: [
                    { requirement: 'Machine learning experience', met: true, notes: 'Worked on ML pipeline' },
                    { requirement: 'Kubernetes knowledge', met: false },
                    { requirement: 'Open source contributions', met: true, notes: 'Django contributor' }
                ],
                culturalFitScore: 88
            },
            summary: 'Excellent candidate with strong technical skills and relevant experience. Highly recommended for interview.'
        }
    },
    {
        id: 'app-002',
        jobId: 'job-001',
        name: 'Michael Chen',
        email: 'm.chen@techmail.com',
        phone: '+27 83 987 6543',
        resumeUrl: '/resumes/michael-chen.pdf',
        source: 'email',
        sourceDetail: 'jobs@nineteen58.co.za',
        status: 'qualified',
        submittedAt: hoursAgo(5),
        emailBody: 'Hi,\n\nApplying for the Python role. Check out my GitHub for code samples.\n\nThanks,\nMichael',
        aiEvaluation: {
            score: 78,
            keyStrengths: [
                '5 years Python experience meets requirement',
                'Strong FastAPI and async programming skills',
                'Active open source contributor',
                'Good problem-solving demonstrated in portfolio'
            ],
            redFlags: [
                'Brief application email - may indicate low enthusiasm',
                'No mention of team collaboration experience'
            ],
            matchDetails: {
                mustHaves: [
                    { requirement: '5+ years Python experience', met: true, notes: 'Exactly 5 years' },
                    { requirement: 'Experience with Django or FastAPI', met: true, notes: 'FastAPI specialist' },
                    { requirement: 'Cloud infrastructure (AWS/GCP)', met: true, notes: 'GCP experience' },
                    { requirement: 'REST API design', met: true }
                ],
                niceToHaves: [
                    { requirement: 'Machine learning experience', met: false },
                    { requirement: 'Kubernetes knowledge', met: true },
                    { requirement: 'Open source contributions', met: true, notes: 'Several popular packages' }
                ],
                culturalFitScore: 65
            },
            summary: 'Technically strong candidate but communication style may need assessment. Worth interviewing for technical skills.'
        }
    },
    {
        id: 'app-003',
        jobId: 'job-001',
        name: 'Thabo Ndlovu',
        email: 'thabo.n@gmail.com',
        resumeUrl: '/resumes/thabo-ndlovu.pdf',
        source: 'email',
        sourceDetail: 'jobs@nineteen58.co.za',
        status: 'analyzing',
        submittedAt: hoursAgo(1),
        emailBody: 'Dear Nineteen58 Team,\n\nI am writing to express my interest in the Senior Python Developer role. Currently working at a fintech startup, I have been building scalable Python applications for the past 6 years.\n\nI am particularly drawn to your mission of transforming recruitment through AI.\n\nKind regards,\nThabo'
    },
    {
        id: 'app-004',
        jobId: 'job-001',
        name: 'Emma Williams',
        email: 'emma.w@outlook.com',
        resumeUrl: '/resumes/emma-williams.pdf',
        source: 'email',
        sourceDetail: 'jobs@nineteen58.co.za',
        status: 'incoming',
        submittedAt: hoursAgo(0.5),
        emailBody: 'Hello,\n\nI would like to apply for the Python Developer position. Please find my CV attached.\n\nRegards,\nEmma Williams'
    },
    {
        id: 'app-005',
        jobId: 'job-001',
        name: 'Daniel Botha',
        email: 'daniel.botha@company.co.za',
        resumeUrl: '/resumes/daniel-botha.pdf',
        source: 'email',
        sourceDetail: 'jobs@nineteen58.co.za',
        status: 'rejected',
        submittedAt: daysAgo(1),
        emailBody: 'Hi, I want to apply for the developer job. I have 2 years experience with Python.',
        aiEvaluation: {
            score: 32,
            keyStrengths: [
                'Enthusiasm for the role',
                'Some Python experience'
            ],
            redFlags: [
                'Only 2 years experience - does not meet 5+ year requirement',
                'No framework experience mentioned',
                'No cloud experience evident'
            ],
            matchDetails: {
                mustHaves: [
                    { requirement: '5+ years Python experience', met: false, notes: 'Only 2 years' },
                    { requirement: 'Experience with Django or FastAPI', met: false },
                    { requirement: 'Cloud infrastructure (AWS/GCP)', met: false },
                    { requirement: 'REST API design', met: false, notes: 'Basic experience only' }
                ],
                niceToHaves: [
                    { requirement: 'Machine learning experience', met: false },
                    { requirement: 'Kubernetes knowledge', met: false },
                    { requirement: 'Open source contributions', met: false }
                ],
                culturalFitScore: 45
            },
            summary: 'Does not meet minimum requirements. Consider for junior positions if available.'
        }
    },
    // Product Designer applicants
    {
        id: 'app-006',
        jobId: 'job-002',
        name: 'Lerato Molefe',
        email: 'lerato.design@gmail.com',
        phone: '+27 84 555 1234',
        resumeUrl: '/resumes/lerato-molefe.pdf',
        source: 'email',
        sourceDetail: 'jobs@nineteen58.co.za',
        status: 'qualified',
        submittedAt: daysAgo(2),
        emailBody: 'Dear Hiring Manager,\n\nI am thrilled to apply for the Product Designer role at Nineteen58. My portfolio showcases 5 years of creating user-centered designs for B2B SaaS products.\n\nI believe design should solve real problems while delighting users. Let me know if you would like to schedule a portfolio review.\n\nWarm regards,\nLerato Molefe',
        aiEvaluation: {
            score: 88,
            keyStrengths: [
                '5 years product design experience',
                'Strong B2B SaaS background',
                'Impressive portfolio with shipped products',
                'Excellent communication in application'
            ],
            redFlags: [],
            matchDetails: {
                mustHaves: [
                    { requirement: '3+ years product design experience', met: true, notes: '5 years' },
                    { requirement: 'Proficiency in Figma', met: true, notes: 'Figma expert per portfolio' },
                    { requirement: 'Strong portfolio of shipped products', met: true },
                    { requirement: 'Experience with design systems', met: true }
                ],
                niceToHaves: [
                    { requirement: 'Motion design skills', met: true },
                    { requirement: 'Front-end development knowledge', met: false },
                    { requirement: 'Experience with B2B SaaS', met: true }
                ],
                culturalFitScore: 92
            },
            summary: 'Outstanding candidate with perfect alignment to role requirements. Strong cultural fit indicators.'
        }
    },
    {
        id: 'app-007',
        jobId: 'job-002',
        name: 'James Peterson',
        email: 'james.p@designstudio.com',
        resumeUrl: '/resumes/james-peterson.pdf',
        source: 'email',
        sourceDetail: 'jobs@nineteen58.co.za',
        status: 'analyzing',
        submittedAt: hoursAgo(3)
    },
    {
        id: 'app-008',
        jobId: 'job-002',
        name: 'Nomsa Dlamini',
        email: 'nomsa.d@creative.co.za',
        resumeUrl: '/resumes/nomsa-dlamini.pdf',
        source: 'manual',
        sourceDetail: 'LinkedIn Application',
        status: 'incoming',
        submittedAt: hoursAgo(1)
    },
    // Head of Sales applicants
    {
        id: 'app-009',
        jobId: 'job-003',
        name: 'Robert van der Berg',
        email: 'robert.vdb@salesforce.com',
        phone: '+27 82 777 8888',
        resumeUrl: '/resumes/robert-vdb.pdf',
        source: 'email',
        sourceDetail: 'jobs@nineteen58.co.za',
        status: 'qualified',
        submittedAt: daysAgo(3),
        emailBody: 'Dear Nineteen58 Leadership,\n\nWith 12 years in B2B sales and 5 years leading high-performing teams, I am confident I can drive Nineteen58 to its next stage of growth.\n\nMy track record includes scaling a sales team from 5 to 45 people and growing ARR from R10M to R150M.\n\nI look forward to discussing how I can contribute to your mission.\n\nBest,\nRobert',
        aiEvaluation: {
            score: 95,
            keyStrengths: [
                'Exceeds experience requirements significantly',
                'Proven track record of scaling teams',
                'Impressive revenue growth achievements',
                'Strong leadership narrative'
            ],
            redFlags: [],
            matchDetails: {
                mustHaves: [
                    { requirement: '8+ years B2B sales experience', met: true, notes: '12 years' },
                    { requirement: '3+ years in sales leadership', met: true, notes: '5 years' },
                    { requirement: 'Track record of hitting targets', met: true, notes: 'Exceptional growth' },
                    { requirement: 'Experience selling to HR/Recruiting', met: true }
                ],
                niceToHaves: [
                    { requirement: 'SaaS sales background', met: true },
                    { requirement: 'Africa market experience', met: true },
                    { requirement: 'Enterprise sales experience', met: true }
                ],
                culturalFitScore: 90
            },
            summary: 'Exceptional candidate who exceeds all requirements. Top priority for immediate interview.'
        }
    },
    {
        id: 'app-010',
        jobId: 'job-003',
        name: 'Patricia Okonkwo',
        email: 'patricia.o@enterprise.ng',
        resumeUrl: '/resumes/patricia-okonkwo.pdf',
        source: 'email',
        sourceDetail: 'jobs@nineteen58.co.za',
        status: 'qualified',
        submittedAt: daysAgo(5),
        emailBody: 'Hello,\n\nI am interested in the Head of Sales position. I bring 10 years of sales experience across Africa, with the last 4 years in leadership.\n\nI have particular expertise in the Nigerian and South African markets.\n\nBest regards,\nPatricia',
        aiEvaluation: {
            score: 82,
            keyStrengths: [
                'Strong Pan-African sales experience',
                'Solid leadership background',
                'Market expertise in key regions'
            ],
            redFlags: [
                'Limited HR/Recruiting industry experience'
            ],
            matchDetails: {
                mustHaves: [
                    { requirement: '8+ years B2B sales experience', met: true, notes: '10 years' },
                    { requirement: '3+ years in sales leadership', met: true, notes: '4 years' },
                    { requirement: 'Track record of hitting targets', met: true },
                    { requirement: 'Experience selling to HR/Recruiting', met: false, notes: 'No direct experience' }
                ],
                niceToHaves: [
                    { requirement: 'SaaS sales background', met: true },
                    { requirement: 'Africa market experience', met: true, notes: 'Extensive' },
                    { requirement: 'Enterprise sales experience', met: true }
                ],
                culturalFitScore: 85
            },
            summary: 'Strong candidate with excellent regional expertise. Worth interviewing despite limited HR industry experience.'
        }
    },
    // DevOps Engineer applicants (paused job)
    {
        id: 'app-011',
        jobId: 'job-004',
        name: 'Ahmed Hassan',
        email: 'ahmed.h@cloudops.com',
        resumeUrl: '/resumes/ahmed-hassan.pdf',
        source: 'email',
        sourceDetail: 'jobs@nineteen58.co.za',
        status: 'qualified',
        submittedAt: daysAgo(10),
        aiEvaluation: {
            score: 85,
            keyStrengths: [
                'Strong Kubernetes expertise',
                'Excellent CI/CD experience',
                'Security certifications'
            ],
            redFlags: [],
            matchDetails: {
                mustHaves: [
                    { requirement: '4+ years DevOps/SRE experience', met: true, notes: '6 years' },
                    { requirement: 'Strong Kubernetes knowledge', met: true },
                    { requirement: 'CI/CD pipeline expertise', met: true },
                    { requirement: 'Monitoring and observability', met: true }
                ],
                niceToHaves: [
                    { requirement: 'Terraform experience', met: true },
                    { requirement: 'Security certifications', met: true, notes: 'AWS Security Specialty' },
                    { requirement: 'Cost optimization experience', met: false }
                ],
                culturalFitScore: 80
            },
            summary: 'Well-qualified candidate. Application on hold pending job status change.'
        }
    },
    {
        id: 'app-012',
        jobId: 'job-001',
        name: 'Precious Khumalo',
        email: 'precious.k@dev.co.za',
        resumeUrl: '/resumes/precious-khumalo.pdf',
        source: 'email',
        sourceDetail: 'jobs@nineteen58.co.za',
        status: 'incoming',
        submittedAt: hoursAgo(0.25),
        emailBody: 'Good day,\n\nPlease accept my application for the Senior Python Developer role. I have 6 years of experience building web applications with Python.\n\nThank you for your consideration.\n\nPrecious Khumalo'
    }
]

// Dashboard Stats
export const mockDashboardStats: DashboardStats = {
    totalJobs: mockJobs.length,
    activeApplicants: mockApplicants.filter(a => a.status !== 'rejected').length,
    qualifiedToday: mockApplicants.filter(a => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return a.status === 'qualified' && a.submittedAt >= today
    }).length,
    aiProcessing: mockApplicants.filter(a => a.status === 'analyzing').length
}

// Helper functions
export function getJobById(id: string): Job | undefined {
    return mockJobs.find(job => job.id === id)
}

export function getApplicantById(id: string): Applicant | undefined {
    return mockApplicants.find(applicant => applicant.id === id)
}

export function getApplicantsByJobId(jobId: string): Applicant[] {
    return mockApplicants.filter(applicant => applicant.jobId === jobId)
}

export function getApplicantsByStatus(jobId: string, status: Applicant['status']): Applicant[] {
    return mockApplicants.filter(applicant => applicant.jobId === jobId && applicant.status === status)
}

// Recent activity for dashboard
export interface ActivityItem {
    id: string;
    type: 'new_applicant' | 'ai_complete' | 'status_change';
    message: string;
    timestamp: Date;
    applicantId?: string;
    jobId?: string;
}

export const mockActivities: ActivityItem[] = [
    {
        id: 'act-001',
        type: 'new_applicant',
        message: 'New application received for Senior Python Developer',
        timestamp: hoursAgo(0.25),
        applicantId: 'app-012',
        jobId: 'job-001'
    },
    {
        id: 'act-002',
        type: 'new_applicant',
        message: 'New application received for Senior Python Developer',
        timestamp: hoursAgo(0.5),
        applicantId: 'app-004',
        jobId: 'job-001'
    },
    {
        id: 'act-003',
        type: 'ai_complete',
        message: 'AI analysis complete for Sarah Johnson - Score: 92%',
        timestamp: hoursAgo(1.5),
        applicantId: 'app-001',
        jobId: 'job-001'
    },
    {
        id: 'act-004',
        type: 'status_change',
        message: 'Lerato Molefe moved to Qualified for Product Designer',
        timestamp: daysAgo(2),
        applicantId: 'app-006',
        jobId: 'job-002'
    },
    {
        id: 'act-005',
        type: 'ai_complete',
        message: 'AI analysis complete for Robert van der Berg - Score: 95%',
        timestamp: daysAgo(3),
        applicantId: 'app-009',
        jobId: 'job-003'
    }
]
