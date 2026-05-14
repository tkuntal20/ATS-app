import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
export async function extractTextFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
        return await extractFromPDF(filePath);
    }
    else if (ext === '.docx') {
        return await extractFromDOCX(filePath);
    }
    else if (ext === '.txt') {
        return fs.readFileSync(filePath, 'utf-8');
    }
    else {
        throw new Error(`Unsupported file format: ${ext}. Supported: .pdf, .docx, .txt`);
    }
}
async function extractFromPDF(filePath) {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
}
async function extractFromDOCX(filePath) {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
}
export function cleanText(text) {
    return text
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s.,\-()&]/g, ' ')
        .trim();
}
export function normalizeText(text) {
    return text.toLowerCase().trim();
}
//# sourceMappingURL=fileHandler.js.map