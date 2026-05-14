import { ResumeParsed } from '../parsers/resumeParser.js';
import { JDParsed } from '../parsers/jdParser.js';
import { ScoringResult } from '../scoring/calculator.js';

export interface Suggestion {
  priority: 'high' | 'medium' | 'low';
  category: string;
  suggestion: string;
  impact: string;
}

export function generateSuggestions(
  resume: ResumeParsed,
  jd: JDParsed,
  scoring: ScoringResult
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Missing skills suggestions
  scoring.missingSkills.forEach(skill => {
    suggestions.push({
      priority: 'high',
      category: 'Skills',
      suggestion: `Add "${skill}" to your skills section - it's explicitly mentioned in the job description`,
      impact: 'Can improve ATS score by 2-3 points',
    });
  });

  // Experience suggestions
  if (scoring.breakdown.experienceMatch < 10) {
    suggestions.push({
      priority: 'high',
      category: 'Experience',
      suggestion: 'Highlight relevant projects and experiences that match the job requirements',
      impact: 'Can improve ATS score by 3-5 points',
    });
  }

  // Keyword suggestions
  if (scoring.breakdown.keywordMatch < 30) {
    const missingKeywords = findMissingKeywords(resume.normalizedText, jd.normalizedText);
    missingKeywords.slice(0, 3).forEach(keyword => {
      suggestions.push({
        priority: 'medium',
        category: 'Keywords',
        suggestion: `Incorporate "${keyword}" in your experience descriptions to match JD language`,
        impact: 'Can improve ATS score by 1-2 points per keyword',
      });
    });
  }

  // Formatting suggestions
  if (scoring.breakdown.formatting < 8) {
    suggestions.push({
      priority: 'high',
      category: 'Formatting',
      suggestion: 'Avoid tables, columns, and graphics. Use simple formatting for ATS compatibility',
      impact: 'Can improve ATS score by 2-3 points',
    });
  }

  // Readability suggestions
  if (scoring.breakdown.readability < 7) {
    suggestions.push({
      priority: 'medium',
      category: 'Readability',
      suggestion: 'Use action verbs at the start of bullet points (e.g., "Developed", "Led", "Achieved")',
      impact: 'Can improve ATS score by 2-3 points',
    });
  }

  // Section suggestions
  if (!resume.sections['experience'] || resume.sections['experience'].length < 50) {
    suggestions.push({
      priority: 'high',
      category: 'Structure',
      suggestion: 'Expand your experience section with detailed descriptions of relevant roles',
      impact: 'Can improve ATS score by 2-4 points',
    });
  }

  if (!resume.sections['skills'] || resume.sections['skills'].length < 30) {
    suggestions.push({
      priority: 'medium',
      category: 'Structure',
      suggestion: 'Create a dedicated skills section with all relevant technical and soft skills',
      impact: 'Can improve ATS score by 2-3 points',
    });
  }

  // Specific role matching
  if (jd.jobTitle && !resume.rawText.includes(jd.jobTitle)) {
    suggestions.push({
      priority: 'medium',
      category: 'Relevance',
      suggestion: `Mention experience with "${jd.jobTitle}" role or similar positions`,
      impact: 'Can improve ATS score by 1-2 points',
    });
  }

  // Quantifiable metrics
  if (!resume.rawText.match(/\d+%|\d+\s*(?:million|thousand|hundred|users|customers|team|projects)/i)) {
    suggestions.push({
      priority: 'low',
      category: 'Impact',
      suggestion: 'Add quantifiable metrics and achievements (e.g., "Improved performance by 30%")',
      impact: 'Can improve ATS score by 1-2 points',
    });
  }

  return suggestions.sort((a, b) => {
    const priorityMap = { high: 0, medium: 1, low: 2 };
    return priorityMap[a.priority] - priorityMap[b.priority];
  });
}

function findMissingKeywords(resumeText: string, jdText: string): string[] {
  const jdWords = jdText.split(/\s+/).filter(w => w.length > 5);
  const resumeText2 = resumeText;

  const missing = jdWords
    .filter(word => !resumeText2.includes(word))
    .filter((word, idx, arr) => arr.indexOf(word) === idx)
    .slice(0, 10);

  return missing;
}
