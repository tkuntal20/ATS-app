export interface ResumeParsed {
    rawText: string;
    cleanText: string;
    normalizedText: string;
    skills: string[];
    experience: string[];
    education: string[];
    sections: Record<string, string>;
}
export declare function parseResume(filePath: string): Promise<ResumeParsed>;
//# sourceMappingURL=resumeParser.d.ts.map