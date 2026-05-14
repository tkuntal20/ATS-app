import type { AnalysisResult, OptimizedResume, OptimizationRequest } from '../types';

const API_BASE_URL = 'http://localhost:3000';

interface ApiResponse {
  success: boolean;
  optimizedResume?: OptimizedResume;
  error?: string;
}

export async function analyzeResume(
  resumeFile: File,
  jobDescription: string
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('jd', jobDescription);

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to analyze resume' }));
    throw new Error(error.error || 'Failed to analyze resume');
  }

  const data = await response.json();
  
  console.log('Backend response:', data);
  
  // Map backend response to frontend format
  const improvements = (data.suggestions || data.weaknesses || []).map((item: { suggestion?: string } | string) => 
    typeof item === 'string' ? item : item.suggestion || item
  );
  
  return {
    score: data.score,
    breakdown: data.breakdown,
    matchedSkills: data.matchedSkills || [],
    missingSkills: data.missingSkills || [],
    strengths: data.strengths || [],
    improvements,
    resumeText: data.resumeText,
    jobDescription: data.jobDescription
  };
}

export async function optimizeResume(
  request: OptimizationRequest
): Promise<OptimizedResume> {
  const response = await fetch(`${API_BASE_URL}/api/optimize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...request,
      mode: request.mode || 'balanced'
    }),
  });

  if (!response.ok) {
    const error: ApiResponse = await response.json().catch(() => ({ 
      success: false, 
      error: 'Failed to optimize resume' 
    }));
    throw new Error(error.error || 'Failed to optimize resume');
  }

  const data: ApiResponse = await response.json();
  
  if (!data.optimizedResume) {
    throw new Error('No optimized resume returned from server');
  }

  return data.optimizedResume;
}
