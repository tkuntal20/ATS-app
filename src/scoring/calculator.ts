import { ResumeParsed } from '../parsers/resumeParser.js';
import { JDParsed } from '../parsers/jdParser.js';

export interface ScoreBreakdown {
  keywordMatch: number;
  skillAlignment: number;
  experienceMatch: number;
  formatting: number;
  readability: number;
  total: number;
}

export interface ScoringResult {
  score: number;
  breakdown: ScoreBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
}

export function calculateATSScore(resume: ResumeParsed, jd: JDParsed): ScoringResult {
  const breakdown = {
    keywordMatch: calculateKeywordMatch(resume, jd),
    skillAlignment: calculateSkillAlignment(resume, jd),
    experienceMatch: calculateExperienceMatch(resume, jd),
    formatting: calculateFormatting(resume),
    readability: calculateReadability(resume),
    total: 0,
  };

  breakdown.total =
    breakdown.keywordMatch +
    breakdown.skillAlignment +
    breakdown.experienceMatch +
    breakdown.formatting +
    breakdown.readability;

  const { matchedSkills, missingSkills } = findSkillMatches(resume, jd);
  const { strengths, weaknesses } = generateInsights(resume, jd, breakdown);

  return {
    score: Math.min(100, breakdown.total),
    breakdown: {
      ...breakdown,
      total: Math.min(100, breakdown.total),
    },
    matchedSkills,
    missingSkills,
    strengths,
    weaknesses,
  };
}

function calculateKeywordMatch(resume: ResumeParsed, jd: JDParsed): number {
  const resumeText = resume.normalizedText;
  const jdKeywords = extractKeywords(jd.normalizedText);

  let matched = 0;
  jdKeywords.forEach((keyword: string) => {
    if (resumeText.includes(keyword)) {
      matched++;
    }
  });

  const matchPercentage = (matched / jdKeywords.length) * 100;
  return Math.min(40, (matchPercentage / 100) * 40);
}

function calculateSkillAlignment(resume: ResumeParsed, jd: JDParsed): number {
  const resumeSkills = resume.skills.map((s: string) => s.toLowerCase());
  const requiredSkills = jd.requiredSkills.map((s: string) => s.toLowerCase());

  let matched = 0;
  requiredSkills.forEach((skill: string) => {
    if (resumeSkills.some((rs: string) => rs.includes(skill) || skill.includes(rs))) {
      matched++;
    }
  });

  return Math.min(25, (matched / Math.max(requiredSkills.length, 1)) * 25);
}

function calculateExperienceMatch(resume: ResumeParsed, jd: JDParsed): number {
  const resumeExperience = extractYearsFromText(resume.rawText);
  const requiredYears = jd.yearsOfExperience;

  if (resumeExperience >= requiredYears) {
    return 15;
  }
  const ratio = resumeExperience / Math.max(requiredYears, 1);
  return Math.min(15, ratio * 15);
}

function calculateFormatting(resume: ResumeParsed): number {
  let score = 10;

  if (resume.rawText.includes('[') || resume.rawText.includes('|')) {
    score -= 3;
  }
  if (resume.rawText.length > 5000) {
    score -= 2;
  }

  return Math.max(5, score);
}

function calculateReadability(resume: ResumeParsed): number {
  let score = 10;
  const lines = resume.cleanText.split('\n');
  const avgLineLength = resume.cleanText.length / lines.length;

  if (avgLineLength > 100) {
    score -= 2;
  }

  const hasActionVerbs = /^(achieved|created|developed|designed|implemented|led|managed|organized|reduced)/m.test(
    resume.rawText
  );
  if (!hasActionVerbs) {
    score -= 3;
  }

  return Math.max(5, score);
}

function findSkillMatches(resume: ResumeParsed, jd: JDParsed): {
  matchedSkills: string[];
  missingSkills: string[];
} {
  const resumeSkills = resume.skills.map((s: string) => s.toLowerCase());
  const requiredSkills = jd.requiredSkills.map((s: string) => s.toLowerCase());

  const matched = requiredSkills.filter((skill: string) =>
    resumeSkills.some((rs: string) => rs.includes(skill) || skill.includes(rs))
  );

  const missing = requiredSkills.filter(
    (skill: string) => !resumeSkills.some((rs: string) => rs.includes(skill) || skill.includes(rs))
  );

  return { matchedSkills: matched, missingSkills: missing };
}

function generateInsights(
  resume: ResumeParsed,
  jd: JDParsed,
  breakdown: any
): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (breakdown.keywordMatch > 30) {
    strengths.push('Good keyword alignment with job description');
  } else {
    weaknesses.push('Low keyword match - consider using JD terminology');
  }

  if (breakdown.skillAlignment > 20) {
    strengths.push('Most required skills are present');
  } else {
    weaknesses.push('Missing critical skills mentioned in JD');
  }

  if (breakdown.readability > 8) {
    strengths.push('Resume is well-structured and readable');
  } else {
    weaknesses.push('Consider improving formatting and structure');
  }

  if (resume.experience.length > 0) {
    strengths.push('Experience section is present');
  } else {
    weaknesses.push('Add more details about professional experience');
  }

  return { strengths, weaknesses };
}

function extractKeywords(text: string): string[] {
  const keywords = text
    .split(/[\s,;.!?]/);
  return [...new Set(keywords.filter(w => w.length > 3))];
}

function extractYearsFromText(text: string): number {
  const matches = text.match(/(\d+)\s*(?:\+)?\s*(?:year|yr)/gi);
  if (matches) {
    const years = matches.map(m => parseInt(m));
    return Math.max(...years, 0);
  }
  return 0;
}
