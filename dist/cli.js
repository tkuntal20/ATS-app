import { Command } from 'commander';
import { createAnalyzeCommand } from './commands/analyze.js';
import { createScanCommand } from './commands/scan.js';
import { createPushCommand } from './commands/push.js';
import { createFullCommand } from './commands/full.js';
const program = new Command();
program
    .name('ats-app')
    .description('CLI tool to analyze resumes and calculate ATS scores')
    .version('1.0.0');
program.addCommand(createAnalyzeCommand());
program.addCommand(createScanCommand());
program.addCommand(createPushCommand());
program.addCommand(createFullCommand());
program.parse(process.argv);
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=cli.js.map