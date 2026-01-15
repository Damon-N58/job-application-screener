// Core TypeScript interfaces for Nineteen58 Recruiter

// Job Opening
export interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
  status: 'active' | 'paused' | 'closed';
  createdAt: Date;
  applicantCount: number;
  aiPersona: AIPersonaConfig;
}

// AI Configuration for job screening
export interface AIPersonaConfig {
  mustHaves: string[];
  niceToHaves: string[];
  culturalFit: string;
}

// Applicant/Candidate
export interface Applicant {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  source: 'email' | 'manual' | 'api';
  sourceDetail: string;
  status: ApplicantStatus;
  submittedAt: Date;
  emailBody?: string;
  aiEvaluation?: AIEvaluation;
}

export type ApplicantStatus = 'incoming' | 'analyzing' | 'qualified' | 'rejected';

// AI Evaluation Results
export interface AIEvaluation {
  score: number; // 0-100
  keyStrengths: string[];
  redFlags: string[];
  matchDetails: {
    mustHaves: RequirementMatch[];
    niceToHaves: RequirementMatch[];
    culturalFitScore: number;
  };
  summary: string;
}

export interface RequirementMatch {
  requirement: string;
  met: boolean;
  notes?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalJobs: number;
  activeApplicants: number;
  qualifiedToday: number;
  aiProcessing: number;
}

// Navigation Item
export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Breadcrumb
export interface Breadcrumb {
  label: string;
  href?: string;
}
