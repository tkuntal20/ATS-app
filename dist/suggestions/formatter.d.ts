import { ScoringResult } from '../scoring/calculator.js';
import { Suggestion } from './generator.js';
export declare function formatScoringResult(score: ScoringResult): string;
export declare function formatSuggestions(suggestions: Suggestion[]): string;
export declare function formatScoreBanner(score: number): string;
export declare function formatJSONResult(resumePath: string, jdPath: string, score: ScoringResult, suggestions: Suggestion[]): object;
//# sourceMappingURL=formatter.d.ts.map