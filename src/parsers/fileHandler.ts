import fs from 'fs';
import path from 'path';
import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractTextFromFile(filePath: string): Promise<string> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    return await extractFromPDF(filePath);
  } else if (ext === '.docx') {
    return await extractFromDOCX(filePath);
  } else if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf-8');
  } else {
    throw new Error(`Unsupported file format: ${ext}. Supported: .pdf, .docx, .txt`);
  }
}

async function extractFromPDF(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractFromDOCX(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,\-()&]/g, ' ')
    .trim();
}

export function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}
