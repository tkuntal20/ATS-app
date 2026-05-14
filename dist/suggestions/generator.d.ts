import { ResumeParsed } from '../parsers/resumeParser.js';
import { JDParsed } from '../parsers/jdParser.js';
import { ScoringResult } from '../scoring/calculator.js';
export interface Suggestion {
    priority: 'high' | 'medium' | 'low';
    category: string;
    suggestion: string;
    impact: string;
}
export declare function generateSuggestions(resume: ResumeParsed, jd: JDParsed, scoring: ScoringResult): Suggestion[];
//# sourceMappingURL=generator.d.ts.map