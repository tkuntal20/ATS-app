// Shared types for server-side code
export interface ResumeSection {
  type: 'summary' | 'skills' | 'experience' | 'education' | 'certifications' | 'projects';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ExperienceEntry {
  company: string;
  title: string;
  dates: string;
  location?: string;
  bullets: string[];
  technologies?: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field?: string;
  dates: string;
  gpa?: string;
  honors?: string[];
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
  bullets: string[];
  link?: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export interface ParsedResume {
  professionalSummary?: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  projects: ProjectEntry[];
  rawSections: ResumeSection[];
}

export interface OptimizationAnalysis {
  keywordDensity: number;
  overOptimizationScore: number;
  readabilityScore: number;
  actionVerbScore: number;
  weakBullets: string[];
  duplicateKeywords: string[];
  sectionCompleteness: {
    summary: boolean;
    skills: boolean;
    experience: boolean;
    education: boolean;
  };
}

export interface OptimizedResume {
  // Structured sections preserving resume format
  professionalSummary: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  projects: ProjectEntry[];
  
  // Optimization metadata
  improvements: string[];
  addedKeywords: string[];
  removedWeakPhrases: string[];
  rewrittenBullets: Array<{ original: string; optimized: string; reason: string }>;
  predictedScore: number;
  improvementPercentage: number;
  
  // Advanced analysis
  analysis: OptimizationAnalysis;
  optimizationMode: 'conservative' | 'balanced' | 'aggressive';
  
  // Highlighting for UI
  highlightedChanges: Array<{
    section: string;
    type: 'added' | 'modified' | 'removed';
    original?: string;
    optimized: string;
    explanation: string;
  }>;
}

export type OptimizationMode = 'conservative' | 'balanced' | 'aggressive';

export interface OptimizationRequest {
  resumeText: string;
  jobDescription: string;
  currentScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  mode?: OptimizationMode;
}