import type {
  ParsedResume,
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
  CertificationEntry,
  ResumeSection
} from '../types';

/**
 * Parse resume text into structured sections
 * Preserves company names, titles, dates, and structure
 */
export function parseResume(resumeText: string): ParsedResume {
  const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const parsed: ParsedResume = {
    professionalSummary: undefined,
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    rawSections: []
  };

  let currentSection: 'summary' | 'skills' | 'experience' | 'education' | 'certifications' | 'projects' | 'unknown' = 'unknown';
  let currentContent: string[] = [];
  let currentExperience: Partial<ExperienceEntry> | null = null;
  let currentEducation: Partial<EducationEntry> | null = null;
  let currentProject: Partial<ProjectEntry> | null = null;

  const sectionHeaders = {
    summary: /^(professional\s+summary|summary|profile|about|objective)/i,
    skills: /^(skills|technical\s+skills|core\s+competencies|technologies)/i,
    experience: /^(experience|work\s+experience|employment|professional\s+experience)/i,
    education: /^(education|academic|qualifications)/i,
    certifications: /^(certifications?|licenses?|credentials?)/i,
    projects: /^(projects?|portfolio)/i
  };

  const datePattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4}|\d{1,2}\/\d{4}|present|current)\b/i;
  const companyTitlePattern = /^(.+?)\s*[-–—|]\s*(.+?)(?:\s*[-–—|]\s*(.+))?$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect section headers
    let newSection: typeof currentSection = 'unknown';
    for (const [section, pattern] of Object.entries(sectionHeaders)) {
      if (pattern.test(line)) {
        newSection = section as typeof currentSection;
        break;
      }
    }

    if (newSection !== 'unknown' && newSection !== currentSection) {
      // Save previous section
      if (currentSection !== 'unknown' && currentContent.length > 0) {
        parsed.rawSections.push({
          type: currentSection as any,
          content: currentContent.join('\n')
        });
      }
      
      currentSection = newSection;
      currentContent = [];
      continue;
    }

    // Parse content based on current section
    const section = currentSection as 'summary' | 'skills' | 'experience' | 'education' | 'certifications' | 'projects' | 'unknown';
    if (section === 'summary') {
      currentContent.push(line);
      if (!parsed.professionalSummary) {
        parsed.professionalSummary = '';
      }
      parsed.professionalSummary += (parsed.professionalSummary ? ' ' : '') + line;
    }
    else if (section === 'skills') {
      // Extract skills from various formats
      const skillSeparators = /[,;|•·]/;
      if (skillSeparators.test(line)) {
        const skills = line.split(skillSeparators).map(s => s.trim()).filter(s => s.length > 0);
        parsed.skills.push(...skills);
      } else {
        parsed.skills.push(line);
      }
      currentContent.push(line);
    }
    else if (section === 'experience') {
      // Try to detect company/title line
      if (companyTitlePattern.test(line) || (datePattern.test(line) && !line.startsWith('•') && !line.startsWith('-'))) {
        // Save previous experience
        if (currentExperience && currentExperience.company && currentExperience.title) {
          parsed.experience.push(currentExperience as ExperienceEntry);
        }
        
        // Start new experience entry
        const match = line.match(companyTitlePattern);
        if (match) {
          currentExperience = {
            company: match[1].trim(),
            title: match[2].trim(),
            dates: match[3]?.trim() || '',
            bullets: []
          };
        } else if (datePattern.test(line)) {
          // Line contains dates, might be continuation
          if (currentExperience) {
            currentExperience.dates = line;
          } else {
            currentExperience = {
              company: line,
              title: '',
              dates: '',
              bullets: []
            };
          }
        }
      }
      // Bullet points
      else if ((line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) && currentExperience) {
        const bullet = line.replace(/^[•\-*]\s*/, '').trim();
        if (bullet) {
          currentExperience.bullets = currentExperience.bullets || [];
          currentExperience.bullets.push(bullet);
        }
      }
      // Continuation of previous line or location
      else if (currentExperience) {
        if (!currentExperience.title && currentExperience.company) {
          currentExperience.title = line;
        } else if (!currentExperience.dates) {
          currentExperience.dates = line;
        } else if (line.length < 50 && !currentExperience.location) {
          currentExperience.location = line;
        }
      }
      currentContent.push(line);
    }
    else if (section === 'education') {
      if (datePattern.test(line) || line.includes('University') || line.includes('College') || line.includes('Institute')) {
        // Save previous education
        if (currentEducation && currentEducation.institution) {
          parsed.education.push(currentEducation as EducationEntry);
        }
        
        currentEducation = {
          institution: line,
          degree: '',
          dates: ''
        };
      } else if (currentEducation) {
        if (!currentEducation.degree) {
          currentEducation.degree = line;
        } else if (!currentEducation.dates && datePattern.test(line)) {
          currentEducation.dates = line;
        } else if (line.toLowerCase().includes('gpa')) {
          currentEducation.gpa = line;
        }
      }
      currentContent.push(line);
    }
    else if (section === 'certifications') {
      const cert: CertificationEntry = {
        name: line,
        issuer: '',
        date: ''
      };
      
      // Try to extract issuer and date
      const parts = line.split(/[-–—|]/);
      if (parts.length >= 2) {
        cert.name = parts[0].trim();
        cert.issuer = parts[1].trim();
        if (parts.length >= 3) {
          cert.date = parts[2].trim();
        }
      }
      
      parsed.certifications.push(cert);
      currentContent.push(line);
    }
    else if (section === 'projects') {
      if (!line.startsWith('•') && !line.startsWith('-')) {
        // Save previous project
        if (currentProject && currentProject.name) {
          parsed.projects.push(currentProject as ProjectEntry);
        }
        
        currentProject = {
          name: line,
          description: '',
          technologies: [],
          bullets: []
        };
      } else if (currentProject) {
        const bullet = line.replace(/^[•\-*]\s*/, '').trim();
        currentProject.bullets = currentProject.bullets || [];
        currentProject.bullets.push(bullet);
      }
      currentContent.push(line);
    }
    else {
      currentContent.push(line);
    }
  }

  // Save final section
  if (currentSection !== 'unknown' && currentContent.length > 0) {
    parsed.rawSections.push({
      type: currentSection as any,
      content: currentContent.join('\n')
    });
  }

  // Save final entries
  if (currentExperience && currentExperience.company && currentExperience.title) {
    parsed.experience.push(currentExperience as ExperienceEntry);
  }
  if (currentEducation && currentEducation.institution) {
    parsed.education.push(currentEducation as EducationEntry);
  }
  if (currentProject && currentProject.name) {
    parsed.projects.push(currentProject as ProjectEntry);
  }

  return parsed;
}

/**
 * Extract technologies/skills from experience bullets
 */
export function extractTechnologies(text: string): string[] {
  const techPatterns = [
    /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|Go|Rust|PHP|Swift|Kotlin)\b/gi,
    /\b(React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|\.NET)\b/gi,
    /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|CI\/CD)\b/gi,
    /\b(MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch|DynamoDB)\b/gi,
    /\b(REST|GraphQL|gRPC|WebSocket|API)\b/gi
  ];

  const technologies = new Set<string>();
  
  for (const pattern of techPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => technologies.add(match));
    }
  }

  return Array.from(technologies);
}

/**
 * Detect weak bullet points that need improvement
 */
export function detectWeakBullets(bullets: string[]): string[] {
  const weakPatterns = [
    /^(responsible for|duties include|worked on|helped with)/i,
    /^(assisted|participated|involved in)/i,
    /\b(various|multiple|several|many)\b/i,
    /\b(stuff|things|etc\.?)\b/i
  ];

  const weakBullets: string[] = [];

  for (const bullet of bullets) {
    for (const pattern of weakPatterns) {
      if (pattern.test(bullet)) {
        weakBullets.push(bullet);
        break;
      }
    }
    
    // Check for lack of action verbs
    const startsWithActionVerb = /^(achieved|architected|automated|built|created|designed|developed|engineered|enhanced|implemented|improved|increased|led|optimized|reduced|scaled|spearheaded|streamlined)/i;
    if (!startsWithActionVerb.test(bullet) && bullet.length > 20) {
      weakBullets.push(bullet);
    }
  }

  return weakBullets;
}

/**
 * Calculate keyword density
 */
export function calculateKeywordDensity(text: string, keywords: string[]): number {
  const words = text.toLowerCase().split(/\s+/);
  const keywordCount = keywords.reduce((count, keyword) => {
    const keywordWords = keyword.toLowerCase().split(/\s+/);
    return count + words.filter(word => keywordWords.includes(word)).length;
  }, 0);

  return words.length > 0 ? (keywordCount / words.length) * 100 : 0;
}

/**
 * Detect duplicate keywords
 */
export function detectDuplicateKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = new Map<string, number>();

  words.forEach(word => {
    if (word.length > 3) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  });

  const duplicates: string[] = [];
  wordCount.forEach((count, word) => {
    if (count > 5) {
      duplicates.push(word);
    }
  });

  return duplicates;
}

/**
 * Calculate readability score (Flesch Reading Ease approximation)
 */
export function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease formula
  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  
  return Math.max(0, Math.min(100, score));
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  const vowels = 'aeiouy';
  let count = 0;
  let previousWasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }

  // Adjust for silent e
  if (word.endsWith('e')) {
    count--;
  }

  return Math.max(1, count);
}

/**
 * Calculate action verb score
 */
export function calculateActionVerbScore(bullets: string[]): number {
  const strongActionVerbs = [
    'achieved', 'architected', 'automated', 'built', 'created', 'designed',
    'developed', 'engineered', 'enhanced', 'implemented', 'improved', 'increased',
    'led', 'optimized', 'reduced', 'scaled', 'spearheaded', 'streamlined'
  ];

  let strongVerbCount = 0;
  
  for (const bullet of bullets) {
    const firstWord = bullet.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
    if (strongActionVerbs.includes(firstWord)) {
      strongVerbCount++;
    }
  }

  return bullets.length > 0 ? (strongVerbCount / bullets.length) * 100 : 0;
}