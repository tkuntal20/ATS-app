import { ResumeParsed } from '../parsers/resumeParser.js';
import { JDParsed } from '../parsers/jdParser.js';
export interface ScoreBreakdown {
    keywordMatch: number;
    skillAlignment: number;
    experienceMatch: number;
    formatting: number;
    readability: number;
    total: number;
}
export interface ScoringResult {
    score: number;
    breakdown: ScoreBreakdown;
    matchedSkills: string[];
    missingSkills: string[];
    strengths: string[];
    weaknesses: string[];
}
export declare function calculateATSScore(resume: ResumeParsed, jd: JDParsed): ScoringResult;
//# sourceMappingURL=calculator.d.ts.map