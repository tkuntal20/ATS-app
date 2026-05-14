import { Command } from 'commander';
import { parseResume } from '../parsers/resumeParser.js';
import { parseJD } from '../parsers/jdParser.js';
import { calculateATSScore } from '../scoring/calculator.js';
import { generateSuggestions } from '../suggestions/generator.js';
import { pushToGitHub, validateGitHubToken } from '../github/uploader.js';
export function createPushCommand() {
    return new Command('push')
        .description('Push ATS analysis results to GitHub')
        .requiredOption('-r, --resume <path>', 'Path to resume file')
        .requiredOption('-j, --jd <path>', 'Path to job description file')
        .requiredOption('-o, --owner <owner>', 'GitHub owner (username or org)')
        .requiredOption('-rp, --repo <repo>', 'GitHub repository name')
        .option('-t, --token <token>', 'GitHub token (or set GITHUB_TOKEN env var)')
        .option('-b, --branch <branch>', 'Branch name (default: main)', 'main')
        .action(async (options) => {
        try {
            let token = options.token || process.env.GITHUB_TOKEN;
            if (!token) {
                console.error('❌ GitHub token not found. Set --token or GITHUB_TOKEN environment variable');
                process.exit(1);
            }
            console.log('🚀 Analyzing resume and pushing to GitHub...\n');
            // Validate token
            console.log('🔐 Validating GitHub token...');
            const isValid = await validateGitHubToken(token);
            if (!isValid) {
                console.error('❌ Invalid GitHub token');
                process.exit(1);
            }
            // Parse files
            console.log('📄 Parsing resume...');
            const resume = await parseResume(options.resume);
            console.log('📋 Parsing job description...');
            const jd = await parseJD(options.jd);
            // Calculate score
            console.log('🎯 Calculating ATS score...');
            const score = calculateATSScore(resume, jd);
            // Generate suggestions
            console.log('💡 Generating suggestions...');
            const suggestions = generateSuggestions(resume, jd, score);
            // Push to GitHub
            console.log('📤 Pushing to GitHub...');
            const result = await pushToGitHub(options.resume, options.jd, score, suggestions, {
                token,
                owner: options.owner,
                repo: options.repo,
                branch: options.branch,
            });
            console.log('\n' + result.message);
            console.log(`\n🔗 View results: ${result.url}\n`);
        }
        catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=push.js.map