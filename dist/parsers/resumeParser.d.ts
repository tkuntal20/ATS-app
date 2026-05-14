export interface ResumeParsed {
    rawText: string;
    cleanText: string;
    normalizedText: string;
    sections: Record<string, string>;
    skills: string[];
    experience: string[];
    education: string[];
}
export declare function parseResume(filePath: string): Promise<ResumeParsed>;
//# sourceMappingURL=resumeParser.d.ts.map