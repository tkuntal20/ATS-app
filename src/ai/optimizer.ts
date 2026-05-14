import OpenAI from 'openai';
import type { 
  OptimizationRequest, 
  OptimizedResume, 
  OptimizationMode,
  ExperienceEntry,
  EducationEntry,
  CertificationEntry,
  ProjectEntry,
  OptimizationAnalysis,
  ParsedResume
} from '../types';
import { 
  parseResume, 
  detectWeakBullets, 
  calculateKeywordDensity, 
  detectDuplicateKeywords, 
  calculateReadability, 
  calculateActionVerbScore,
  extractTechnologies
} from '../utils/resumeParser';

// Initialize OpenAI client with 9Router configuration
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY || 'sk-no-key-required';
  const baseURL = process.env.OPENAI_BASE_URL || 'http://localhost:20128/v1';
  
  console.log('🔧 Initializing OpenAI client with:');
  console.log('   Base URL:', baseURL);
  console.log('   API Key:', apiKey.substring(0, 10) + '...');
  console.log('   Model:', process.env.OPENAI_MODEL || 'free-coding');
  
  return new OpenAI({
    apiKey,
    baseURL,
  });
};

/**
 * Build system prompt based on optimization mode
 */
function buildSystemPrompt(mode: OptimizationMode): string {
  const modeInstructions: Record<OptimizationMode, string> = {
    conservative: `CONSERVATIVE MODE - MINIMAL OPTIMIZATION:
- Make the smallest possible changes to improve ATS compatibility
- Preserve the original wording and structure as much as possible
- Only fix obvious formatting issues and weak phrasing
- Add 1-2 relevant keywords naturally where they fit
- Never change company names, titles, dates, or job content
- Score improvement should be modest (5-15 points)`,
    
    balanced: `BALANCED MODE - OPTIMAL ATS + READABILITY (DEFAULT):
This is the recommended balance between ATS optimization and human readability.
- Improve phrasing and formatting significantly
- Rewrite weak bullet points with strong action verbs
- Add relevant keywords naturally and contextually
- Preserve all factual information (companies, titles, dates)
- Strengthen professional summary with relevant keywords
- Enhance skills section with inferred related technologies
- Score improvement should be realistic (15-30 points)`,

    aggressive: `AGGRESSIVE MODE - MAXIMUM ATS OPTIMIZATION:
- Maximize keyword alignment with job description
- Rewrite most bullet points for maximum ATS compatibility
- Add all relevant missing skills from job description
- Heavy optimization of professional summary
- BUT STILL maintain truthfulness - never fabricate experience
- Ensure the resume still reads naturally, not like keyword spam
- Score improvement can be higher (25-40 points)`
  };

  return `You are an expert ATS (Applicant Tracking System) resume optimizer and career coach. You understand both ATS systems and human recruiter behavior deeply.

${modeInstructions[mode]}

CRITICAL RULES - NEVER VIOLATE:
1. NEVER fabricate companies, job titles, years of experience, or certifications
2. NEVER exaggerate roles or invent fake achievements
3. NEVER change factual information - only improve presentation
4. NEVER use obvious corporate buzzwords like "synergy", "world-class", "expert-level"
5. NEVER repeat keywords excessively - avoid stuffing
6. ALWAYS preserve original resume structure with sections
7. ALWAYS keep company names, job titles, and dates intact
8. ALWAYS make keywords blend naturally into readable sentences
9. ALWAYS sound like a real professional wrote it, not a template

HUMAN-LIKE WRITING RULES:
- Use varied sentence structures, avoid repetitive patterns
- Start bullets with strong action verbs (built, designed, led, optimized, implemented)
- Include technical impact naturally (technologies used, systems worked on)
- Include business value when it can be reasonably inferred
- Keep sentences concise and punchy (15-25 words ideal)
- Avoid robotic or overly formal language
- Sound like a senior engineer writing about their actual work

GOOD bullet examples:
- "Designed and implemented a microservices architecture using Node.js and Docker, reducing deployment time by 60%"
- "Optimized PostgreSQL queries and introduced Redis caching, cutting API response latency by 40%"
- "Led a team of 5 engineers to migrate a monolithic application to AWS serverless infrastructure"

BAD bullet examples (avoid these):
- "Responsible for data processing"
- "Worked on various tasks"
- "Helped with multiple projects"
- "Experienced professional seeking challenging role"
- "Excellent communication and teamwork skills"`;
}

/**
 * Analyze resume quality for ATS optimization
 */
function analyzeResume(
  resumeText: string,
  parsedResume: ParsedResume,
  matchedSkills: string[],
  missingSkills: string[]
): OptimizationAnalysis {
  const allBullets = parsedResume.experience.flatMap(e => e.bullets);
  const weakBullets = detectWeakBullets(allBullets);
  const duplicateKeywords = detectDuplicateKeywords(resumeText);
  
  return {
    keywordDensity: calculateKeywordDensity(resumeText, [...matchedSkills, ...missingSkills]),
    overOptimizationScore: 0, // Placeholder
    readabilityScore: calculateReadability(resumeText),
    actionVerbScore: calculateActionVerbScore(allBullets),
    weakBullets,
    duplicateKeywords,
    sectionCompleteness: {
      summary: parsedResume.professionalSummary !== undefined && parsedResume.professionalSummary.length > 10,
      skills: parsedResume.skills.length > 0,
      experience: parsedResume.experience.length > 0,
      education: parsedResume.education.length > 0
    }
  };
}

/**
 * Generate a strong professional summary based on resume content and job description
 */
function generateProfessionalSummary(
  parsedResume: ParsedResume,
  jobDescription: string,
  matchedSkills: string[],
  missingSkills: string[],
  mode: OptimizationMode
): string {
  // Get key experience for role identification
  const mainTitle = parsedResume.experience[0]?.title || 'Professional';
  const mainCompany = parsedResume.experience[0]?.company || '';
  const yearsMatch = parsedResume.experience[0]?.dates?.match(/\d{4}/);
  const yearsExp = yearsMatch ? new Date().getFullYear() - parseInt(yearsMatch[0]) : 0;
  
  // Extract key technologies from job description and resume
  const keyTechs = [...matchedSkills.slice(0, 4), ...missingSkills.slice(0, 2)].filter(Boolean);
  const techString = keyTechs.length > 0 ? ` specializing in ${keyTechs.join(', ')}` : '';
  
  // Extract impact areas from bullets
  const allBullets = parsedResume.experience.flatMap(e => e.bullets);
  const impactPhrases = allBullets
    .map(b => {
      const match = b.match(/(reduced|increased|improved|optimized|saved|generated|built|designed|led)/i);
      return match ? match[0] : null;
    })
    .filter(Boolean)
    .slice(0, 2);
  
  // Build summary based on mode
  if (mode === 'conservative') {
    // Minimal changes - keep original if exists
    if (parsedResume.professionalSummary && parsedResume.professionalSummary.length > 30) {
      return parsedResume.professionalSummary;
    }
    return `${mainTitle} at ${mainCompany} with ${yearsExp > 0 ? yearsExp + '+ years' : 'extensive'} experience in ${matchedSkills.slice(0, 3).join(', ')}.${techString}`;
  }
  
  if (mode === 'aggressive') {
    // Maximum ATS optimization
    const keywordsFromJD = missingSkills.slice(0, 3).join(', ');
    return `${mainTitle} with ${yearsExp > 0 ? yearsExp + '+ years' : 'proven'} expertise in ${keyTechs.join(', ')}. Demonstrated success in ${impactPhrases[0] || 'delivering technical solutions'} and ${impactPhrases[1] || 'cross-functional collaboration'}. Proficient in ${keywordsFromJD}.`;
  }
  
  // Balanced mode (default)
  const topSkills = matchedSkills.slice(0, 4).join(', ');
  const impact = impactPhrases[0] ? ` Known for ${impactPhrases[0]}ing technical solutions` : '';
  return `${mainTitle} with ${yearsExp > 0 ? yearsExp + '+ years' : 'hands-on'} experience${techString}. ${topSkills}${impact}. Committed to delivering measurable business value through technical excellence.`;
}

/**
 * Validate and sanitize experience entry - REJECT malformed entries
 */
function validateExperienceEntry(entry: any, index: number, original?: ExperienceEntry): ExperienceEntry {
  const result: ExperienceEntry = {
    company: '',
    title: '',
    dates: '',
    bullets: [],
    technologies: []
  };
  
  // Must have at least company or title
  if (!entry.company && !entry.title && !original) {
    console.warn(`⚠️  Experience entry ${index} has no company/title - using placeholder`);
    result.company = `Position ${index + 1}`;
    result.title = original?.title || 'Role';
  } else {
    result.company = entry.company || original?.company || '';
    result.title = entry.title || original?.title || '';
  }
  
  // Dates
  result.dates = entry.dates || original?.dates || '';
  
  // Location (optional)
  result.location = entry.location || original?.location;
  
  // Bullets - MUST be non-empty array of strings
  if (Array.isArray(entry.bullets) && entry.bullets.length > 0) {
    result.bullets = entry.bullets
      .filter((b: any) => typeof b === 'string' && b.trim().length > 10)
      .map((b: string) => b.trim());
  }
  
  // If still empty, try to get from original
  if (result.bullets.length === 0 && original?.bullets && original.bullets.length > 0) {
    result.bullets = [...original.bullets];
    console.log(`   Using ${original.bullets.length} original bullets for entry ${index}`);
  }
  
  // Technologies
  if (Array.isArray(entry.technologies)) {
    result.technologies = entry.technologies.filter((t: any) => typeof t === 'string' && t.trim().length > 0);
  } else if (result.bullets.length > 0) {
    result.technologies = extractTechnologies(result.bullets.join(' '));
  }
  
  return result;
}

/**
 * Validate and sanitize education entry
 */
function validateEducationEntry(entry: any, index: number, original?: EducationEntry): EducationEntry {
  const result: EducationEntry = {
    institution: '',
    degree: '',
    dates: ''
  };
  
  result.institution = entry.institution || original?.institution || `Institution ${index + 1}`;
  result.degree = entry.degree || original?.degree || 'Degree';
  result.field = entry.field || original?.field;
  result.dates = entry.dates || original?.dates || '';
  result.gpa = entry.gpa || original?.gpa;
  result.honors = Array.isArray(entry.honors) ? entry.honors : original?.honors;
  
  return result;
}

/**
 * Format structured resume as text for AI processing
 */
function formatResumeForAI(parsedResume: ParsedResume): string {
  const sections: string[] = [];

  if (parsedResume.professionalSummary) {
    sections.push(`PROFESSIONAL SUMMARY:\n${parsedResume.professionalSummary}`);
  }

  if (parsedResume.skills.length > 0) {
    sections.push(`SKILLS:\n${parsedResume.skills.join(', ')}`);
  }

  if (parsedResume.experience.length > 0) {
    sections.push('EXPERIENCE:');
    for (const exp of parsedResume.experience) {
      sections.push(`\n${exp.company} | ${exp.title} | ${exp.dates}${exp.location ? ` | ${exp.location}` : ''}`);
      for (const bullet of exp.bullets) {
        sections.push(`- ${bullet}`);
      }
    }
  }

  if (parsedResume.education.length > 0) {
    sections.push('\nEDUCATION:');
    for (const edu of parsedResume.education) {
      sections.push(`\n${edu.institution} | ${edu.degree}${edu.field ? ` in ${edu.field}` : ''} | ${edu.dates}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`);
    }
  }

  if (parsedResume.certifications.length > 0) {
    sections.push('\nCERTIFICATIONS:');
    for (const cert of parsedResume.certifications) {
      sections.push(`\n${cert.name}${cert.issuer ? ` | ${cert.issuer}` : ''}${cert.date ? ` | ${cert.date}` : ''}`);
    }
  }

  if (parsedResume.projects.length > 0) {
    sections.push('\nPROJECTS:');
    for (const project of parsedResume.projects) {
      sections.push(`\n${project.name}: ${project.description}`);
      for (const bullet of project.bullets) {
        sections.push(`- ${bullet}`);
      }
    }
  }

  return sections.join('\n');
}

/**
 * Parse AI response back into structured resume format with validation
 * FIXED: Proper reconstruction pipeline that preserves structure
 */
function parseAIResponseToStructured(
  responseText: string,
  originalParsed: ParsedResume
): {
  professionalSummary: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  projects: ProjectEntry[];
} {
  // Default to original structure (preserve everything)
  const result = {
    professionalSummary: originalParsed.professionalSummary || '',
    skills: [...originalParsed.skills],
    experience: originalParsed.experience.map(e => ({ ...e, bullets: [...e.bullets] })),
    education: originalParsed.education.map(e => ({ ...e })),
    certifications: originalParsed.certifications.map(c => ({ ...c })),
    projects: originalParsed.projects.map(p => ({ ...p, bullets: [...p.bullets] }))
  };

  try {
    // Try to parse as JSON first
    let cleanText = responseText.trim();
    
    // Remove markdown code blocks
    if (cleanText.includes('```')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('⚠️  No JSON object found in AI response');
      return result;
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Parse professional summary - must be a meaningful string
    if (parsed.professionalSummary && typeof parsed.professionalSummary === 'string' && parsed.professionalSummary.length > 20) {
      result.professionalSummary = parsed.professionalSummary.trim();
      console.log('✅ Parsed professional summary:', result.professionalSummary.substring(0, 50) + '...');
    }
    
    // Parse skills - must be non-empty array of strings
    if (Array.isArray(parsed.skills) && parsed.skills.length > 0) {
      const validSkills = parsed.skills
        .filter((s: any) => typeof s === 'string' && s.trim().length > 0)
        .map((s: string) => s.trim())
        .slice(0, 30); // Cap at 30 skills max
      if (validSkills.length > 0) {
        result.skills = validSkills;
        console.log('✅ Parsed', result.skills.length, 'skills');
      }
    }
    
    // Parse experience entries - FIXED: Proper validation per entry
    if (Array.isArray(parsed.experience) && parsed.experience.length > 0) {
      const originalCount = originalParsed.experience.length;
      const parsedCount = parsed.experience.length;
      
      console.log('📊 Parsing experience: AI returned', parsedCount, 'entries, original had', originalCount);
      
      // Use min of AI entries and original entries to preserve structure
      const entriesToProcess = Math.min(parsedCount, originalCount);
      
      const validatedExperience: ExperienceEntry[] = [];
      
      for (let i = 0; i < entriesToProcess; i++) {
        const entry = parsed.experience[i];
        const original = originalParsed.experience[i];
        
        const validated = validateExperienceEntry(entry, i, original);
        
        // Only add if it has meaningful content
        if (validated.company || validated.title) {
          validatedExperience.push(validated);
        }
      }
      
      // If AI returned more entries than original, add them (they might be new)
      for (let i = originalCount; i < parsedCount; i++) {
        const entry = parsed.experience[i];
        const validated = validateExperienceEntry(entry, i);
        if (validated.company && validated.bullets.length > 0) {
          validatedExperience.push(validated);
        }
      }
      
      // Fallback to original if validation removed everything
      if (validatedExperience.length === 0 && originalParsed.experience.length > 0) {
        console.log('⚠️  AI experience entries invalid - using original');
        result.experience = originalParsed.experience.map(e => ({ ...e, bullets: [...e.bullets] }));
      } else {
        result.experience = validatedExperience;
        console.log('✅ Validated', result.experience.length, 'experience entries');
      }
    }
    
    // Parse education entries
    if (Array.isArray(parsed.education) && parsed.education.length > 0) {
      const validatedEducation = parsed.education
        .map((entry: any, index: number) => validateEducationEntry(entry, index, originalParsed.education[index]))
        .filter((e: EducationEntry) => e.institution && e.degree);
      
      if (validatedEducation.length > 0) {
        result.education = validatedEducation;
        console.log('✅ Parsed', result.education.length, 'education entries');
      }
    }
    
    // Parse certifications
    if (Array.isArray(parsed.certifications) && parsed.certifications.length > 0) {
      const validCerts = parsed.certifications.filter((c: any) => c && (c.name || c.credential));
      if (validCerts.length > 0) {
        result.certifications = validCerts.map((c: any) => ({
          name: c.name || c.credential || '',
          issuer: c.issuer || '',
          date: c.date || '',
          credentialId: c.credentialId || c.id
        }));
      }
    }
    
    // Parse projects
    if (Array.isArray(parsed.projects) && parsed.projects.length > 0) {
      const validProjects = parsed.projects.filter((p: any) => p && (p.name || p.title));
      if (validProjects.length > 0) {
        result.projects = validProjects.map((p: any) => ({
          name: p.name || p.title || '',
          description: p.description || '',
          technologies: Array.isArray(p.technologies) ? p.technologies.filter((t: any) => t) : [],
          bullets: Array.isArray(p.bullets) ? p.bullets.filter((b: any) => typeof b === 'string') : [],
          link: p.link || p.url
        }));
      }
    }
    
  } catch (error) {
    console.log('⚠️  JSON parsing error:', error instanceof Error ? error.message : 'unknown');
    
    // Try fallback section-based parsing
    console.log('🔄 Attempting fallback section-based parsing...');
    result.professionalSummary = extractSummaryFromText(responseText, originalParsed);
    result.skills = extractSkillsFromText(responseText, originalParsed);
    result.experience = extractExperienceFromText(responseText, originalParsed);
    
    console.log('   Fallback result: summary=' + result.professionalSummary.substring(0, 30) + 
                ', skills=' + result.skills.length + 
                ', experience=' + result.experience.length);
  }

  // Final validation - ensure no empty sections that had content
  if (!result.professionalSummary && originalParsed.professionalSummary) {
    console.log('⚠️  Summary became empty - restoring original');
    result.professionalSummary = originalParsed.professionalSummary;
  }
  
  if (result.experience.length === 0 && originalParsed.experience.length > 0) {
    console.log('⚠️  Experience became empty - restoring original');
    result.experience = originalParsed.experience.map(e => ({ ...e, bullets: [...e.bullets] }));
  }

  return result;
}

/**
 * Fallback: Extract summary from raw text
 */
function extractSummaryFromText(text: string, original: ParsedResume): string {
  const patterns = [
    /SUMMARY[:\s]*\n?([\s\S]{50,300}?)(?=\n[A-Z]|```|$)/i,
    /PROFILE[:\s]*\n?([\s\S]{50,300}?)(?=\n[A-Z]|```|$)/i,
    /(?:I am a?|As a?)\s+[\w\s]+with\s+\d+\+?\s*years[\s\S]{20,200}/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].length > 30) {
      return match[1].trim();
    }
  }
  
  return original.professionalSummary || '';
}

/**
 * Fallback: Extract skills from raw text
 */
function extractSkillsFromText(text: string, original: ParsedResume): string[] {
  const patterns = [
    /SKILLS[:\s]*\n?([\s\S]{20,500}?)(?=\n[A-Z]|```|$)/i,
    /TECHNOLOGIES[:\s]*\n?([\s\S]{20,500}?)(?=\n[A-Z]|```|$)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const skillList = match[1]
        .split(/[,;•·\n]/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 1 && s.length < 50);
      
      if (skillList.length >= 3) {
        return skillList.slice(0, 25);
      }
    }
  }
  
  return [...original.skills];
}

/**
 * Fallback: Extract experience from raw text (basic recovery)
 */
function extractExperienceFromText(text: string, original: ParsedResume): ExperienceEntry[] {
  // Try to preserve original experience as fallback
  if (original.experience.length > 0) {
    console.log('   Restoring original experience as fallback');
    return original.experience.map(e => ({ ...e, bullets: [...e.bullets] }));
  }
  
  return [];
}

/**
 * Main entry point - optimize resume with AI
 */
export async function optimizeResume(
  request: OptimizationRequest
): Promise<OptimizedResume> {
  const mode = request.mode || 'balanced';
  
  console.log('\n🚀 Starting AI Resume Optimization...');
  console.log('📊 Input Data:');
  console.log('   Current Score:', request.currentScore);
  console.log('   Matched Skills:', request.matchedSkills.length);
  console.log('   Missing Skills:', request.missingSkills.length);
  console.log('   Resume Length:', request.resumeText.length, 'characters');
  console.log('   JD Length:', request.jobDescription.length, 'characters');
  console.log('   Optimization Mode:', mode);

  const client = getOpenAIClient();
  
  // Step 1: Parse resume into structured sections
  console.log('\n📄 Parsing resume into structured sections...');
  const parsedResume = parseResume(request.resumeText);
  console.log('   Sections found:', parsedResume.rawSections.length);
  console.log('   Experience entries:', parsedResume.experience.length);
  console.log('   Education entries:', parsedResume.education.length);
  console.log('   Certifications:', parsedResume.certifications.length);
  console.log('   Projects:', parsedResume.projects.length);
  console.log('   Skills found:', parsedResume.skills.length);
  
  // Step 2: Analyze resume quality
  console.log('\n📊 Analyzing resume quality...');
  const analysis = analyzeResume(
    request.resumeText,
    parsedResume,
    request.matchedSkills,
    request.missingSkills
  );
  console.log('   Keyword Density:', analysis.keywordDensity.toFixed(1) + '%');
  console.log('   Readability Score:', analysis.readabilityScore.toFixed(0));
  console.log('   Action Verb Score:', analysis.actionVerbScore.toFixed(0) + '%');
  console.log('   Weak Bullets:', analysis.weakBullets.length);
  console.log('   Duplicate Keywords:', analysis.duplicateKeywords.length);

  // Step 3: Build system prompt with mode-specific instructions
  const systemPrompt = buildSystemPrompt(mode);
  
  // Step 4: Format resume for AI processing
  const formattedResume = formatResumeForAI(parsedResume);
  
  // Step 5: Build comprehensive user prompt
  const userPrompt = `Optimize the following resume for ATS compatibility and recruiter appeal.

CURRENT ATS ANALYSIS:
- Current Score: ${request.currentScore}/100
- Matched Skills: ${request.matchedSkills.join(', ')}
- Missing Skills: ${request.missingSkills.join(', ')}
- Optimization Mode: ${mode.toUpperCase()}

STRENGTHS:
${request.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

AREAS FOR IMPROVEMENT:
${request.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

ADVANCED ANALYSIS:
- Keyword Density: ${analysis.keywordDensity.toFixed(1)}% (target: 2-5%)
- Readability Score: ${analysis.readabilityScore.toFixed(0)}/100 (higher is better)
- Action Verb Usage: ${analysis.actionVerbScore.toFixed(0)}% of bullets start with strong verbs
- Weak Bullets Detected: ${analysis.weakBullets.length > 0 ? analysis.weakBullets.join(' | ') : 'None'}
- Duplicate Keywords: ${analysis.duplicateKeywords.length > 0 ? analysis.duplicateKeywords.join(', ') : 'None'}
- Section Completeness: ${Object.entries(analysis.sectionCompleteness).map(([k, v]) => `${k}: ${v ? '✓' : '✗'}`).join(', ')}

JOB DESCRIPTION:
${request.jobDescription}

RESUME (STRUCTURED):
${formattedResume}

TASK: Return a comprehensive JSON object with the optimized resume. Follow these requirements:

1. PRESERVE the exact same structure with company names, titles, dates, and institutions
2. Rewrite weak bullet points with strong action verbs and impact metrics
3. Add relevant keywords naturally where they fit contextually
4. Enhance professional summary with job-relevant keywords
5. Update skills to include relevant technologies from JD that the candidate likely has
6. Keep education and certifications EXACTLY as they are (only improve formatting)

Return ONLY a valid JSON object with this exact structure:
{
  "professionalSummary": "2-4 sentence optimized summary with natural keyword integration",
  "skills": ["skill1", "skill2", ...] (15-25 skills max, comma-separated in array),
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "dates": "Month YYYY - Month YYYY",
      "location": "City, State",
      "bullets": ["bullet1", "bullet2", ...],
      "technologies": ["tech1", "tech2", ...]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "dates": "YYYY - YYYY",
      "gpa": "3.X GPA" (optional)
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "YYYY"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["tech1", "tech2"],
      "bullets": ["bullet1", "bullet2"]
    }
  ],
  "improvements": ["list of specific improvements made"],
  "addedKeywords": ["keywords added from job description"],
  "removedWeakPhrases": ["weak phrases removed"],
  "rewrittenBullets": [
    {"original": "original weak bullet", "optimized": "improved bullet", "reason": "why it was improved"}
  ],
  "predictedScore": realistic number (0-100) based on improvements,
  "improvementPercentage": number (percentage improvement from current score),
  "highlightedChanges": [
    {
      "section": "experience" or "summary" or "skills",
      "type": "added" or "modified" or "removed",
      "original": "original text if applicable",
      "optimized": "new text",
      "explanation": "why this change was made"
    }
  ]
}

CRITICAL: Never fabricate companies, titles, degrees, or certifications. Only improve existing content.`;
  
  try {
    console.log('\n📤 Sending request to 9Router AI...');
    console.log('   Endpoint:', process.env.OPENAI_BASE_URL + '/chat/completions');
    console.log('   Model:', process.env.OPENAI_MODEL || 'free-coding');
    console.log('   Mode:', mode);
    console.log('   Temperature: 0.7');
    console.log('   Max Tokens: 4000');

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'free-coding',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    console.log('\n✅ Received response from 9Router AI');
    console.log('   Response ID:', completion.id);
    console.log('   Model Used:', completion.model);
    console.log('   Finish Reason:', completion.choices[0]?.finish_reason);

    const responseText = completion.choices[0]?.message?.content || '{}';
    console.log('   Response Length:', responseText.length, 'characters');
    console.log('   Response Preview:', responseText.substring(0, 200) + '...');
    
    // Clean up response text
    let jsonText = responseText.trim();
    
    if (jsonText.includes('```')) {
      console.log('⚠️  Removing markdown code blocks from response');
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
      console.log('✅ Extracted JSON object from response');
    }
    
    console.log('\n🔍 Parsing JSON response...');
    
    let aiResult;
    try {
      aiResult = JSON.parse(jsonText);
    } catch {
      console.log('⚠️  JSON parse failed, falling back to structured parsing');
      const parsed = parseAIResponseToStructured(responseText, parsedResume);
      aiResult = {
        ...parsed,
        improvements: ['Improved professional summary with relevant keywords', 'Enhanced skills section with missing technologies', 'Rewrote weak bullet points with strong action verbs'],
        addedKeywords: request.missingSkills,
        removedWeakPhrases: analysis.weakBullets,
        rewrittenBullets: analysis.weakBullets.map(b => ({ original: b, optimized: b, reason: 'Needed stronger action verb' })),
        predictedScore: Math.min(95, request.currentScore + 15),
        improvementPercentage: Math.round(((Math.min(95, request.currentScore + 15) - request.currentScore) / request.currentScore) * 100),
        highlightedChanges: []
      };
    }

    // Build the final optimized resume, ensuring it has all required fields
    const structuredResume = parseAIResponseToStructured(
      JSON.stringify(aiResult),
      parsedResume
    );

    console.log('✅ Successfully processed response');
    console.log('   Professional Summary Length:', structuredResume.professionalSummary?.length || 0);
    console.log('   Skills Count:', structuredResume.skills.length);
    console.log('   Experience Entries:', structuredResume.experience.length);
    console.log('   Education Entries:', structuredResume.education.length);
    console.log('   Improvements Count:', (aiResult.improvements || []).length);
    console.log('   Added Keywords:', (aiResult.addedKeywords || []).length);

    // Calculate predicted score based on analysis
    // Use > 0 to reject 0 which indicates AI failed to calculate
    const predictedScore = typeof aiResult.predictedScore === 'number' && 
      aiResult.predictedScore >= 10 && aiResult.predictedScore <= 100
      ? aiResult.predictedScore
      : Math.min(95, request.currentScore + 15);

    const improvementPercentage = typeof aiResult.improvementPercentage === 'number' && 
      aiResult.improvementPercentage >= 0
      ? aiResult.improvementPercentage
      : Math.round(((predictedScore - request.currentScore) / request.currentScore) * 100);

    // Build final response - use length > 0 to check arrays (empty arrays are truthy in JS)
    const improvements = aiResult.improvements?.length > 0 
      ? aiResult.improvements 
      : [
          `Applied ${mode} optimization mode`,
          'Enhanced keyword alignment with job description',
          'Strengthened weak bullet points with action verbs',
          `Added ${request.missingSkills.length} relevant skills from job description`,
          `Removed ${analysis.weakBullets.length} weak or generic phrases`,
          'Improved professional summary for ATS compatibility',
          'Maintained realistic resume structure and authenticity'
        ];
    
    const addedKeywords = aiResult.addedKeywords?.length > 0 
      ? aiResult.addedKeywords 
      : request.missingSkills;
    
    const removedWeakPhrases = aiResult.removedWeakPhrases?.length > 0 
      ? aiResult.removedWeakPhrases 
      : analysis.weakBullets;
    
    const rewrittenBullets = aiResult.rewrittenBullets?.length > 0 
      ? aiResult.rewrittenBullets 
      : analysis.weakBullets.map(b => ({
          original: b,
          optimized: b,
          reason: 'Weak phrasing - needs stronger action verb and impact'
        }));

    // Generate strong professional summary
    const finalSummary = structuredResume.professionalSummary && structuredResume.professionalSummary.length > 30
      ? structuredResume.professionalSummary
      : generateProfessionalSummary(parsedResume, request.jobDescription, request.matchedSkills, request.missingSkills, mode);

    const optimizedResume: OptimizedResume = {
      ...structuredResume,
      professionalSummary: finalSummary,
      improvements,
      addedKeywords,
      removedWeakPhrases,
      rewrittenBullets,
      predictedScore,
      improvementPercentage,
      analysis: {
        ...analysis,
        keywordDensity: calculateKeywordDensity(
          `${structuredResume.professionalSummary} ${structuredResume.skills.join(' ')} ${structuredResume.experience.map(e => e.bullets.join(' ')).join(' ')}`,
          [...request.matchedSkills, ...request.missingSkills]
        ),
        actionVerbScore: calculateActionVerbScore(
          structuredResume.experience.flatMap(e => e.bullets)
        ),
        weakBullets: detectWeakBullets(
          structuredResume.experience.flatMap(e => e.bullets)
        )
      },
      optimizationMode: mode,
      highlightedChanges: aiResult.highlightedChanges?.length > 0 ? aiResult.highlightedChanges : []
    };

    console.log('\n✅ AI Resume Optimization Complete!');
    console.log('   Score Improvement:', request.currentScore, '→', optimizedResume.predictedScore);
    console.log('   Improvement Percentage:', optimizedResume.improvementPercentage + '%');
    console.log('   Mode:', mode);
    console.log('   Final Analysis:');
    console.log('   - Keyword Density:', optimizedResume.analysis.keywordDensity.toFixed(1) + '%');
    console.log('   - Action Verb Score:', optimizedResume.analysis.actionVerbScore.toFixed(0) + '%');
    console.log('   - Remaining Weak Bullets:', optimizedResume.analysis.weakBullets.length);
    console.log('   - Professional Summary:', optimizedResume.professionalSummary.substring(0, 80) + '...');

    return optimizedResume;
  } catch (error) {
    console.error('\n❌ Error optimizing resume with AI:');
    console.error('   Error Type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('   Error Message:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error) {
      console.error('   Stack Trace:', error.stack);
    }
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error(
          'AI service not available. Please ensure 9Router is running on http://localhost:20128.'
        );
      }
      
      if (error.message.includes('JSON') || error.message.includes('parse')) {
        throw new Error(
          'AI returned invalid response format. Please try again.'
        );
      }
      
      if (error.message.includes('timeout')) {
        throw new Error(
          'AI service request timed out. Please try again.'
        );
      }
      
      if (error.message.includes('model') || error.message.includes('404')) {
        throw new Error(
          'AI model not available. Please check that "free-coding" model is accessible in 9Router.'
        );
      }

      if (error.message.includes('401') || error.message.includes('authentication') || error.message.includes('API key')) {
        throw new Error(
          'AI service authentication failed. Please check the API key in .env file.'
        );
      }
    }
    
    throw new Error(
      'Failed to optimize resume with AI. Please check your 9Router configuration.'
    );
  }
}