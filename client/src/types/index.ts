export interface AnalysisResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  resumeText?: string;
  jobDescription?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}