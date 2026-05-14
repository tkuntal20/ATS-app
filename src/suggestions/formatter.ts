import { ScoringResult } from '../scoring/calculator.js';
import { Suggestion } from './generator.js';

export function formatScoringResult(score: ScoringResult): string {
  const { breakdown, matchedSkills, missingSkills, strengths, weaknesses } = score;

  let output = '\n';
  output += '═══════════════════════════════════════\n';
  output += '          ATS SCORE ANALYSIS\n';
  output += '═══════════════════════════════════════\n\n';

  output += formatScoreBanner(breakdown.total);
  output += '\n';

  output += '📊 SCORE BREAKDOWN:\n';
  output += `  • Keyword Match:     ${breakdown.keywordMatch.toFixed(1)}/40\n`;
  output += `  • Skill Alignment:   ${breakdown.skillAlignment.toFixed(1)}/25\n`;
  output += `  • Experience Match:  ${breakdown.experienceMatch.toFixed(1)}/15\n`;
  output += `  • Formatting:        ${breakdown.formatting.toFixed(1)}/10\n`;
  output += `  • Readability:       ${breakdown.readability.toFixed(1)}/10\n`;
  output += '\n';

  if (matchedSkills.length > 0) {
    output += `✅ MATCHED SKILLS (${matchedSkills.length}):\n`;
    matchedSkills.slice(0, 5).forEach(skill => {
      output += `  • ${skill}\n`;
    });
    if (matchedSkills.length > 5) {
      output += `  ... and ${matchedSkills.length - 5} more\n`;
    }
    output += '\n';
  }

  if (missingSkills.length > 0) {
    output += `❌ MISSING SKILLS (${missingSkills.length}):\n`;
    missingSkills.slice(0, 5).forEach(skill => {
      output += `  • ${skill}\n`;
    });
    if (missingSkills.length > 5) {
      output += `  ... and ${missingSkills.length - 5} more\n`;
    }
    output += '\n';
  }

  if (strengths.length > 0) {
    output += `💪 STRENGTHS:\n`;
    strengths.forEach(strength => {
      output += `  • ${strength}\n`;
    });
    output += '\n';
  }

  if (weaknesses.length > 0) {
    output += `⚠️  AREAS TO IMPROVE:\n`;
    weaknesses.forEach(weakness => {
      output += `  • ${weakness}\n`;
    });
    output += '\n';
  }

  return output;
}

export function formatSuggestions(suggestions: Suggestion[]): string {
  if (suggestions.length === 0) {
    return '\n✨ No suggestions - your resume looks great!\n\n';
  }

  let output = '\n';
  output += '═══════════════════════════════════════\n';
  output += '      ACTIONABLE SUGGESTIONS\n';
  output += '═══════════════════════════════════════\n\n';

  const highPriority = suggestions.filter(s => s.priority === 'high');
  const mediumPriority = suggestions.filter(s => s.priority === 'medium');
  const lowPriority = suggestions.filter(s => s.priority === 'low');

  if (highPriority.length > 0) {
    output += `🔴 HIGH PRIORITY (${highPriority.length}):\n`;
    highPriority.forEach((s, idx) => {
      output += `${idx + 1}. [${s.category}] ${s.suggestion}\n`;
      output += `   Impact: ${s.impact}\n\n`;
    });
  }

  if (mediumPriority.length > 0) {
    output += `🟡 MEDIUM PRIORITY (${mediumPriority.length}):\n`;
    mediumPriority.forEach((s, idx) => {
      output += `${idx + 1}. [${s.category}] ${s.suggestion}\n`;
      output += `   Impact: ${s.impact}\n\n`;
    });
  }

  if (lowPriority.length > 0) {
    output += `🟢 LOW PRIORITY (${lowPriority.length}):\n`;
    lowPriority.forEach((s, idx) => {
      output += `${idx + 1}. [${s.category}] ${s.suggestion}\n`;
      output += `   Impact: ${s.impact}\n\n`;
    });
  }

  return output;
}

export function formatScoreBanner(score: number): string {
  const scoreOut = score.toFixed(0);
  const percentage = score.toFixed(1);

  let color = '🔴';
  if (score >= 75) color = '🟢';
  else if (score >= 50) color = '🟡';

  const barLength = Math.round(score / 5);
  const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);

  return `${color} OVERALL SCORE: ${scoreOut}/100 (${percentage}%)\n[${bar}]`;
}

export function formatJSONResult(
  resumePath: string,
  jdPath: string,
  score: ScoringResult,
  suggestions: Suggestion[]
): object {
  return {
    resumeFile: resumePath,
    jdFile: jdPath,
    timestamp: new Date().toISOString(),
    score: {
      overall: Math.round(score.score),
      breakdown: {
        keywordMatch: Math.round(score.breakdown.keywordMatch),
        skillAlignment: Math.round(score.breakdown.skillAlignment),
        experienceMatch: Math.round(score.breakdown.experienceMatch),
        formatting: Math.round(score.breakdown.formatting),
        readability: Math.round(score.breakdown.readability),
      },
    },
    skills: {
      matched: score.matchedSkills,
      missing: score.missingSkills,
    },
    insights: {
      strengths: score.strengths,
      weaknesses: score.weaknesses,
    },
    suggestions: suggestions.map(s => ({
      priority: s.priority,
      category: s.category,
      suggestion: s.suggestion,
      impact: s.impact,
    })),
  };
}
