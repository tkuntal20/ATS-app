import { extractTextFromFile, cleanText, normalizeText } from './fileHandler.js';

export interface JDParsed {
  rawText: string;
  cleanText: string;
  normalizedText: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  yearsOfExperience: number;
  jobTitle: string;
  responsibilities: string[];
  qualifications: string[];
}

export async function parseJD(filePath: string): Promise<JDParsed> {

  const rawText = await extractTextFromFile(filePath);

  const clean = cleanText(rawText);

  const normalized = normalizeText(rawText);

  const requiredSkills = extractRequiredSkills(normalized);

  const niceToHaveSkills = extractNiceToHaveSkills(normalized);

  const yearsOfExperience = extractYearsOfExperience(normalized);

  const jobTitle = extractJobTitle(clean);

  const responsibilities = extractResponsibilities(clean);

  const qualifications = extractQualifications(clean);

  return {
    rawText,
    cleanText: clean,
    normalizedText: normalized,
    requiredSkills,
    niceToHaveSkills,
    yearsOfExperience,
    jobTitle,
    responsibilities,
    qualifications,
  };
}

function extractRequiredSkills(text: string): string[] {

  const allSkills = extractAllSkills(text);

  const niceToHaveIdx = text.indexOf('nice to have');

  const requiredText =
    niceToHaveIdx > -1
      ? text.substring(0, niceToHaveIdx)
      : text;

  return allSkills.filter(skill =>
    requiredText.includes(skill.toLowerCase())
  );
}

function extractNiceToHaveSkills(text: string): string[] {

  const allSkills = extractAllSkills(text);

  const niceToHaveIdx = text.indexOf('nice to have');

  if (niceToHaveIdx > -1) {

    const niceToHaveText = text.substring(niceToHaveIdx);

    return allSkills.filter(skill =>
      niceToHaveText.includes(skill.toLowerCase())
    );

  }

  return [];
}

function extractAllSkills(text: string): string[] {

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

  const normalizedText = text.toLowerCase();

  skillKeywords.forEach(skill => {

    const escapedSkill = skill.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');

    if (regex.test(normalizedText)) {

      found.add(skill);

    }

  });

  return Array.from(found);
}

function extractYearsOfExperience(text: string): number {

  const match = text.match(
    /(\d+)\+?\s*(years?|yrs?|year)\s*(of)?\s*(experience)?/i
  );

  return match ? parseInt(match[1]) : 0;
}

function extractJobTitle(text: string): string {

  const lines = text.split('\n');

  const possibleTitle = lines.find(
    line =>
      line.trim().length > 5 &&
      line.trim().length < 80 &&
      !line.toLowerCase().includes('job description')
  );

  return possibleTitle?.trim() || 'Unknown Position';
}

function extractResponsibilities(text: string): string[] {

  const responsibilities: string[] = [];

  const lines = text.split('\n');

  let inResponsibilities = false;

  lines.forEach(line => {

    const lower = line.toLowerCase();

    if (
      lower.includes('responsibility') ||
      lower.includes('what you will')
    ) {

      inResponsibilities = true;

    } else if (
      lower.includes('requirement') ||
      lower.includes('qualification')
    ) {

      inResponsibilities = false;

    } else if (
      inResponsibilities &&
      line.match(/^[\s\-\*•]\s+/) &&
      line.trim().length > 10
    ) {

      responsibilities.push(
        line.replace(/^[\s\-\*•]\s+/, '').trim()
      );

    }

  });

  return responsibilities.slice(0, 10);
}

function extractQualifications(text: string): string[] {

  const qualifications: string[] = [];

  const lines = text.split('\n');

  let inQualifications = false;

  lines.forEach(line => {

    const lower = line.toLowerCase();

    if (
      lower.includes('qualification') ||
      lower.includes('requirement')
    ) {

      inQualifications = true;

    } else if (
      lower.includes('nice to have') ||
      lower.includes('other')
    ) {

      inQualifications = false;

    } else if (
      inQualifications &&
      line.match(/^[\s\-\*•]\s+/) &&
      line.trim().length > 10
    ) {

      qualifications.push(
        line.replace(/^[\s\-\*•]\s+/, '').trim()
      );

    }

  });

  return qualifications.slice(0, 10);
}