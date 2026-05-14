import { extractTextFromFile, cleanText, normalizeText } from './fileHandler.js';

export interface ResumeParsed {
  rawText: string;
  cleanText: string;
  normalizedText: string;
  skills: string[];
  experience: string[];
  education: string[];
  sections: Record<string, string>;
}

export async function parseResume(filePath: string): Promise<ResumeParsed> {
  const rawText = await extractTextFromFile(filePath);
  const clean = cleanText(rawText);
  const normalized = normalizeText(rawText);

  const skills = extractSkills(normalized);
  const experience = extractExperience(clean);
  const education = extractEducation(normalized);
  const sections = extractSections(clean);

  return {
    rawText,
    cleanText: clean,
    normalizedText: normalized,
    skills,
    experience,
    education,
    sections,
  };
}

function extractSkills(text: string): string[] {
  const skillKeywords = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust',
    'react', 'vue', 'angular', 'svelte', 'node', 'express', 'django', 'flask',
    'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
    'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform',
    'git', 'ci/cd', 'jenkins', 'gitlab', 'github', 'bitbucket',
    'html', 'css', 'rest', 'graphql', 'api', 'microservices',
    'agile', 'scrum', 'jira', 'slack', 'communication', 'leadership',
    'project management', 'problem solving', 'analytical', 'strategic thinking'
  ];

  const found = new Set<string>();
  skillKeywords.forEach(skill => {
    if (text.includes(skill.toLowerCase())) {
      found.add(skill);
    }
  });

  return Array.from(found);
}

function extractExperience(text: string): string[] {
  const experiences: string[] = [];
  const lines = text.split('\n');

  lines.forEach((line, idx) => {
    if (line.match(/\d+\s*(years?|yrs|year of experience)/i) ||
        line.match(/company|role|position|worked|employed/i)) {
      experiences.push(line.trim());
      if (idx + 1 < lines.length) {
        experiences.push(lines[idx + 1].trim());
      }
    }
  });

  return experiences.filter(e => e.length > 0);
}

function extractEducation(text: string): string[] {
  const educationPatterns = [
    'bachelor', 'master', 'phd', 'diploma', 'certificate',
    'b.s.', 'b.a.', 'm.s.', 'm.a.', 'm.b.a.', 'b.e.', 'm.e.'
  ];

  const lines = text.split('\n');
  return lines.filter(line =>
    educationPatterns.some(pattern => line.toLowerCase().includes(pattern))
  );
}

function extractSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const sectionNames = ['experience', 'skills', 'education', 'projects', 'certifications', 'summary'];

  sectionNames.forEach(section => {
    const regex = new RegExp(`${section}[^a-zA-Z]*(.*?)(?=${sectionNames.join('|')}|$)`, 'is');
    const match = text.match(regex);
    if (match) {
      sections[section] = match[1].trim();
    }
  });

  return sections;
}
