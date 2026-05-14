import { extractTextFromFile, cleanText, normalizeText } from './fileHandler.js';

export interface ResumeParsed {
  rawText: string;
  cleanText: string;
  normalizedText: string;
  sections: Record<string, string>;
  skills: string[];
  experience: string[];
  education: string[];
}

export async function parseResume(filePath: string): Promise<ResumeParsed> {

  const rawText = await extractTextFromFile(filePath);

  const clean = cleanText(rawText);

  const normalized = normalizeText(rawText);

  const sections = extractSections(clean);

  const skills = extractSkills(normalized);

  const experience = extractExperience(sections);

  const education = extractEducation(sections);

  return {
    rawText,
    cleanText: clean,
    normalizedText: normalized,
    sections,
    skills,
    experience,
    education,
  };
}

function extractSections(text: string): Record<string, string> {

  const commonSections = [
    'summary',
    'experience',
    'education',
    'skills',
    'projects',
    'certifications'
  ];

  const sections: Record<string, string> = {};

  let currentSection = 'general';

  sections[currentSection] = '';

  text.split('\n').forEach(line => {

    const lower = line.toLowerCase().trim();

    const matchedSection = commonSections.find(section =>
      lower.includes(section)
    );

    if (matchedSection) {

      currentSection = matchedSection;

      sections[currentSection] = '';

    } else {

      sections[currentSection] += line + '\n';

    }

  });

  return sections;
}

function extractSkills(text: string): string[] {

  const skillKeywords = [
    'javascript',
    'typescript',
    'python',
    'java',
    'react',
    'node.js',
    'node',
    'express',
    'mongodb',
    'postgresql',
    'sql',
    'nosql',
    'docker',
    'kubernetes',
    'aws',
    'azure',
    'gcp',
    'graphql',
    'git',
    'github',
    'gitlab',
    'redis',
    'jenkins',
    'terraform',
    'microservices'
  ];

  const found = new Set<string>();

  skillKeywords.forEach(skill => {

    const escapedSkill = skill.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');

    if (regex.test(text)) {

      found.add(skill);

    }

  });

  return Array.from(found);
}

function extractExperience(
  sections: Record<string, string>
): string[] {

  return sections['experience']
    ? sections['experience']
        .split('\n')
        .filter(line => line.trim().length > 20)
    : [];
}

function extractEducation(
  sections: Record<string, string>
): string[] {

  return sections['education']
    ? sections['education']
        .split('\n')
        .filter(line => line.trim().length > 10)
    : [];
}