export interface JDParsed {
    rawText: string;
    cleanText: string;
    normalizedText: string;
    requiredSkills: string[];
    niceToHaveSkills: string[];
    yearsOfExperience: number;
    jobTitle: string;
    responsibilities: string[];
    qualifications: string[];
}
export declare function parseJD(filePath: string): Promise<JDParsed>;
//# sourceMappingURL=jdParser.d.ts.map