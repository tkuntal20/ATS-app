import type { AnalysisResult } from '../types';

const API_BASE_URL = 'http://localhost:3000';

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
  // Backend returns suggestions as objects with {priority, category, suggestion, impact}
  // Frontend expects simple string arrays
  const improvements = (data.suggestions || data.weaknesses || []).map((item: any) => 
    typeof item === 'string' ? item : item.suggestion || item
  );
  
  return {
    score: data.score,
    matchedSkills: data.matchedSkills || [],
    missingSkills: data.missingSkills || [],
    strengths: data.strengths || [],
    improvements,
  };
}
