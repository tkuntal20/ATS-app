import { ScoringResult } from '../scoring/calculator.js';
import { Suggestion } from '../suggestions/generator.js';
export declare function pushToGitHub(resumePath: string, jdPath: string, score: ScoringResult, suggestions: Suggestion[], options: {
    token: string;
    owner: string;
    repo: string;
    branch?: string;
}): Promise<{
    url: string;
    message: string;
}>;
export declare function validateGitHubToken(token: string): Promise<boolean>;
//# sourceMappingURL=uploader.d.ts.map