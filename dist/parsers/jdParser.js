import { extractTextFromFile, cleanText, normalizeText } from './fileHandler.js';
export async function parseJD(filePath) {
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
function extractRequiredSkills(text) {
    const allSkills = extractAllSkills(text);
    // Skills before "nice to have" are considered required
    const niceToHaveIdx = text.indexOf('nice to have');
    const requiredText = niceToHaveIdx > -1 ? text.substring(0, niceToHaveIdx) : text;
    return allSkills.filter(skill => requiredText.includes(skill) &&
        (requiredText.includes(`required ${skill}`) ||
            requiredText.includes(`must have ${skill}`) ||
            requiredText.includes(`${skill} required`))).length > 0
        ? allSkills.filter(skill => requiredText.includes(skill))
        : allSkills.slice(0, Math.ceil(allSkills.length * 0.7));
}
function extractNiceToHaveSkills(text) {
    const allSkills = extractAllSkills(text);
    const niceToHaveIdx = text.indexOf('nice to have');
    if (niceToHaveIdx > -1) {
        const niceToHaveText = text.substring(niceToHaveIdx);
        return allSkills.filter(skill => niceToHaveText.includes(skill));
    }
    return allSkills.slice(Math.ceil(allSkills.length * 0.7));
}
function extractAllSkills(text) {
    const skillKeywords = [
        'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust',
        'react', 'vue', 'angular', 'svelte', 'node', 'express', 'django', 'flask',
        'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
        'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform',
        'git', 'ci/cd', 'jenkins', 'gitlab', 'github',
        'html', 'css', 'rest', 'graphql', 'api', 'microservices',
        'agile', 'scrum', 'jira', 'slack', 'communication', 'leadership'
    ];
    const found = new Set();
    skillKeywords.forEach(skill => {
        if (text.includes(skill.toLowerCase())) {
            found.add(skill);
        }
    });
    return Array.from(found);
}
function extractYearsOfExperience(text) {
    const match = text.match(/(\d+)\+?\s*(years?|yrs)/i);
    return match ? parseInt(match[1]) : 0;
}
function extractJobTitle(text) {
    const lines = text.split('\n');
    return lines[0]?.trim() || 'Unknown Position';
}
function extractResponsibilities(text) {
    const responsibilities = [];
    const lines = text.split('\n');
    let inResponsibilities = false;
    lines.forEach(line => {
        const lower = line.toLowerCase();
        if (lower.includes('responsibility') || lower.includes('what you will')) {
            inResponsibilities = true;
        }
        else if (lower.includes('requirement') || lower.includes('qualification')) {
            inResponsibilities = false;
        }
        else if (inResponsibilities && line.match(/^[\s\-\*•]\s+/) && line.trim().length > 10) {
            responsibilities.push(line.replace(/^[\s\-\*•]\s+/, '').trim());
        }
    });
    return responsibilities.slice(0, 10);
}
function extractQualifications(text) {
    const qualifications = [];
    const lines = text.split('\n');
    let inQualifications = false;
    lines.forEach(line => {
        const lower = line.toLowerCase();
        if (lower.includes('qualification') || lower.includes('requirement')) {
            inQualifications = true;
        }
        else if (lower.includes('nice to have') || lower.includes('other')) {
            inQualifications = false;
        }
        else if (inQualifications && line.match(/^[\s\-\*•]\s+/) && line.trim().length > 10) {
            qualifications.push(line.replace(/^[\s\-\*•]\s+/, '').trim());
        }
    });
    return qualifications.slice(0, 10);
}
//# sourceMappingURL=jdParser.js.map