import { Command } from 'commander';
import { parseResume } from '../parsers/resumeParser.js';
import { formatScoringResult } from '../suggestions/formatter.js';
export function createScanCommand() {
    return new Command('scan')
        .description('Scan resume for general ATS issues')
        .requiredOption('-r, --resume <path>', 'Path to resume file (PDF, DOCX, TXT)')
        .action(async (options) => {
        try {
            console.log('🚀 Scanning resume...\n');
            // Parse resume
            console.log('📄 Parsing resume...');
            const resume = await parseResume(options.resume);
            // Quick ATS checks
            const score = {
                score: 0,
                breakdown: {
                    keywordMatch: 0,
                    skillAlignment: 0,
                    experienceMatch: 0,
                    formatting: calculateFormatting(resume.rawText),
                    readability: calculateReadability(resume.rawText),
                    total: 0,
                },
                matchedSkills: resume.skills.slice(0, 5),
                missingSkills: [],
                strengths: generateQuickStrengths(resume),
                weaknesses: generateQuickWeaknesses(resume),
            };
            score.breakdown.total =
                score.breakdown.formatting + score.breakdown.readability;
            console.log(formatScoringResult(score));
            console.log('📝 Quick Scan Results:\n');
            console.log(`• Resume length: ${resume.rawText.length} characters`);
            console.log(`• Skills found: ${resume.skills.length}`);
            console.log(`• Sections detected: ${Object.keys(resume.sections).length}`);
            console.log('');
            console.log('ℹ️  Use "ats-app analyze --resume <path> --jd <path>" for detailed analysis\n');
            console.log('═══════════════════════════════════════\n');
        }
        catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    });
}
function calculateFormatting(text) {
    let score = 10;
    if (text.includes('[') || text.includes('|'))
        score -= 3;
    if (text.length > 5000)
        score -= 2;
    return Math.max(5, score);
}
function calculateReadability(text) {
    let score = 10;
    const lines = text.split('\n');
    const avgLineLength = text.length / lines.length;
    if (avgLineLength > 100)
        score -= 2;
    const hasActionVerbs = /^(achieved|created|developed|designed|implemented|led|managed|organized|reduced)/m.test(text);
    if (!hasActionVerbs)
        score -= 3;
    return Math.max(5, score);
}
function generateQuickStrengths(resume) {
    const strengths = [];
    if (resume.skills.length > 0)
        strengths.push('Skills section is present');
    if (resume.experience.length > 0)
        strengths.push('Experience details are included');
    if (resume.education.length > 0)
        strengths.push('Education background is listed');
    return strengths;
}
function generateQuickWeaknesses(resume) {
    const weaknesses = [];
    if (resume.skills.length === 0)
        weaknesses.push('No clear skills section found');
    if (resume.experience.length === 0)
        weaknesses.push('Experience section needs expansion');
    if (resume.education.length === 0)
        weaknesses.push('Education section is missing');
    return weaknesses;
}
//# sourceMappingURL=scan.js.map