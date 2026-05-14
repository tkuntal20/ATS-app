import fs from 'fs';
import path from 'path';

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function isValidFile(filePath: string): boolean {
  if (!fileExists(filePath)) return false;
  const ext = path.extname(filePath).toLowerCase();
  return ['.pdf', '.docx', '.txt'].includes(ext);
}

export function getFileSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function sanitizeFilePath(filePath: string): string {
  return path.resolve(filePath);
}

export function getFileName(filePath: string): string {
  return path.basename(filePath);
}

export function validateInputs(resumePath?: string, jdPath?: string): boolean {
  if (resumePath && !isValidFile(resumePath)) {
    throw new Error(`Invalid resume file: ${resumePath}`);
  }
  if (jdPath && !isValidFile(jdPath)) {
    throw new Error(`Invalid JD file: ${jdPath}`);
  }
  return true;
}
