import { Command } from 'commander';
import { parseResume } from '../parsers/resumeParser.js';
import { parseJD } from '../parsers/jdParser.js';
import { calculateATSScore } from '../scoring/calculator.js';
import { generateSuggestions } from '../suggestions/generator.js';
import { formatScoringResult, formatSuggestions } from '../suggestions/formatter.js';

export function createAnalyzeCommand(): Command {
  return new Command('analyze')
    .description('Analyze resume against job description')
    .requiredOption('-r, --resume <path>', 'Path to resume file (PDF, DOCX, TXT)')
    .requiredOption('-j, --jd <path>', 'Path to job description file')
    .action(async (options) => {
      try {
        console.log('🚀 Analyzing resume...\n');

        // Parse files
        console.log('📄 Parsing resume...');
        const resume = await parseResume(options.resume);

        console.log('📋 Parsing job description...');
        const jd = await parseJD(options.jd);

        // Calculate score
        console.log('🎯 Calculating ATS score...');
        const score = calculateATSScore(resume, jd);

        // Generate suggestions
        console.log('💡 Generating suggestions...\n');
        const suggestions = generateSuggestions(resume, jd, score);

        // Format and display results
        console.log(formatScoringResult(score));
        console.log(formatSuggestions(suggestions));

        console.log('═══════════════════════════════════════\n');
      } catch (error) {
        console.error('❌ Error:', (error as Error).message);
        process.exit(1);
      }
    });
}
