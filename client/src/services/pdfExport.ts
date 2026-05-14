import jsPDF from 'jspdf';
import type { OptimizedResume, OptimizationMode } from '../types';

interface PDFExportOptions {
  resume: OptimizedResume;
  originalScore: number;
  mode: OptimizationMode;
  matchedSkills: string[];
  missingSkills: string[];
}

const COLORS = {
  primary: [102, 51, 153],      // Purple
  secondary: [99, 102, 241],     // Indigo
  success: [34, 197, 94],       // Green
  warning: [245, 158, 11],      // Amber
  danger: [239, 68, 68],        // Red
  text: [30, 30, 30],           // Dark gray
  muted: [107, 114, 128],       // Gray
  light: [249, 250, 251],       // Light gray
  white: [255, 255, 255],
};

const FONTS = {
  title: 18,
  section: 14,
  subsection: 11,
  body: 10,
  small: 8,
};

export async function generateResumePDF(options: PDFExportOptions): Promise<Blob> {
  const { resume, mode } = options;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Helper functions
  const addText = (text: string, x: number, y: number, fontSize: number, color: number[], isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color as [number, number, number]);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(text, x, y);
  };

  const addSectionHeader = (title: string) => {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
    }
    addText(title.toUpperCase(), margin, yPos, FONTS.subsection, COLORS.primary, true);
    yPos += 2;
    doc.setDrawColor(...COLORS.primary as [number, number, number]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;
  };

  const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
    doc.setFontSize(fontSize);
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = doc.getTextWidth(testLine);
      if (textWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const addWrappedText = (text: string, fontSize: number, color: number[], lineHeight: number = 5) => {
    const lines = wrapText(text, contentWidth, fontSize);
    lines.forEach(line => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = margin;
      }
      addText(line, margin, yPos, fontSize, color);
      yPos += lineHeight;
    });
  };

  // Header
  addText('RESUME', margin, yPos, FONTS.title, COLORS.primary, true);
  yPos += 8;
  addText(`Optimized with AI - ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`, margin, yPos, FONTS.small, COLORS.muted);
  yPos += 10;

  // Professional Summary
  if (resume.professionalSummary) {
    addSectionHeader('Professional Summary');
    addWrappedText(resume.professionalSummary, FONTS.body, COLORS.text, 5);
    yPos += 4;
  }

  // Skills
  if (resume.skills.length > 0) {
    addSectionHeader('Skills');
    const skillsPerRow = 4;
    for (let i = 0; i < resume.skills.length; i += skillsPerRow) {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }
      const rowSkills = resume.skills.slice(i, i + skillsPerRow);
      addText(rowSkills.join(' • '), margin, yPos, FONTS.body, COLORS.text);
      yPos += 6;
    }
    yPos += 4;
  }

  // Experience
  if (resume.experience.length > 0) {
    addSectionHeader('Experience');
    resume.experience.forEach(exp => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }
      // Position and company
      const titleLine = `${exp.title}${exp.company ? ` at ${exp.company}` : ''}`;
      addText(titleLine, margin, yPos, FONTS.subsection, COLORS.text, true);
      
      if (exp.dates) {
        const dateWidth = doc.getTextWidth(titleLine);
        addText(exp.dates, margin + dateWidth + 5, yPos, FONTS.small, COLORS.muted);
      }
      yPos += 5;

      if (exp.location) {
        addText(exp.location, margin, yPos, FONTS.small, COLORS.muted);
        yPos += 4;
      }

      // Bullets
      exp.bullets.forEach(bullet => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = margin;
        }
        addText('•', margin, yPos, FONTS.body, COLORS.success);
        addText(bullet, margin + 5, yPos, FONTS.body, COLORS.text);
        yPos += 5;
      });
      yPos += 4;
    });
  }

  // Education
  if (resume.education.length > 0) {
    addSectionHeader('Education');
    resume.education.forEach(edu => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = margin;
      }
      const eduLine = `${edu.degree}${edu.field ? ` in ${edu.field}` : ''} - ${edu.institution}`;
      addText(eduLine, margin, yPos, FONTS.body, COLORS.text, true);
      yPos += 4;
      if (edu.dates) {
        addText(edu.dates, margin, yPos, FONTS.small, COLORS.muted);
        yPos += 4;
      }
    });
    yPos += 4;
  }

  // Certifications
  if (resume.certifications.length > 0) {
    addSectionHeader('Certifications');
    resume.certifications.forEach(cert => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }
      const certLine = `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}`;
      addText('• ' + certLine, margin, yPos, FONTS.body, COLORS.text);
      yPos += 5;
    });
    yPos += 4;
  }

  // Projects
  if (resume.projects.length > 0) {
    addSectionHeader('Projects');
    resume.projects.forEach(proj => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = margin;
      }
      addText(proj.name, margin, yPos, FONTS.subsection, COLORS.text, true);
      yPos += 4;
      if (proj.description) {
        addText(proj.description, margin, yPos, FONTS.small, COLORS.muted);
        yPos += 4;
      }
      proj.bullets.forEach(bullet => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = margin;
        }
        addText('•', margin, yPos, FONTS.small, COLORS.success);
        addText(bullet, margin + 5, yPos, FONTS.small, COLORS.text);
        yPos += 4;
      });
      yPos += 3;
    });
  }

  // Footer on last page
  doc.setFontSize(FONTS.small);
  doc.setTextColor(...COLORS.muted as [number, number, number]);
  doc.text(
    `Generated by ATS Resume Optimizer | Score: ${Math.round(resume.predictedScore)}/100 | ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc.output('blob');
}

export async function generateATSReportPDF(options: PDFExportOptions): Promise<Blob> {
  const { resume, originalScore, mode, matchedSkills } = options;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 20;
  let yPos = margin;

  // Helper functions
  const addText = (text: string, x: number, y: number, fontSize: number, color: number[], isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color as [number, number, number]);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(text, x, y);
  };

  const addRect = (x: number, y: number, w: number, h: number, color: number[]) => {
    doc.setFillColor(...color as [number, number, number]);
    doc.rect(x, y, w, h, 'F');
  };

  const addSectionHeader = (title: string, icon: string = '') => {
    if (yPos > 260) {
      doc.addPage();
      yPos = margin;
    }
    addText(`${icon} ${title}`.trim(), margin, yPos, FONTS.section, COLORS.primary, true);
    yPos += 2;
    doc.setDrawColor(...COLORS.primary as [number, number, number]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
  };

  // Header
  addRect(0, 0, pageWidth, 45, COLORS.primary);
  addText('ATS ANALYSIS REPORT', margin, 20, FONTS.title, COLORS.white, true);
  addText(`Generated: ${new Date().toLocaleString()}`, margin, 30, FONTS.small, [200, 200, 255]);
  addText(`Optimization Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`, margin, 38, FONTS.small, [200, 200, 255]);
  yPos = 55;

  // Score Comparison Section
  addSectionHeader('Score Comparison', '📊');

  // Score boxes
  const boxWidth = 50;
  const boxHeight = 25;
  
  // Original Score
  addRect(margin, yPos, boxWidth, boxHeight, [240, 240, 240]);
  addText('Original', margin + 5, yPos + 8, FONTS.small, COLORS.muted);
  addText(`${Math.round(originalScore)}`, margin + 5, yPos + 16, 24, COLORS.text, true);

  // Arrow
  addText('→', margin + boxWidth + 10, yPos + 12, 16, COLORS.success, true);

  // New Score
  addRect(margin + boxWidth + 25, yPos, boxWidth, boxHeight, COLORS.success);
  addText('Optimized', margin + boxWidth + 30, yPos + 8, FONTS.small, [200, 255, 200]);
  addText(`${Math.round(resume.predictedScore)}`, margin + boxWidth + 30, yPos + 16, 24, COLORS.white, true);

  // Improvement badge
  addRect(margin + boxWidth * 2 + 35, yPos + 5, 40, 15, COLORS.success);
  addText(`+${resume.predictedScore - originalScore}`, margin + boxWidth * 2 + 40, yPos + 13, FONTS.subsection, COLORS.white, true);

  yPos += boxHeight + 15;

  // Analysis Metrics
  addSectionHeader('Analysis Metrics', '📈');

  const metrics = [
    { label: 'Keyword Density', value: `${resume.analysis.keywordDensity.toFixed(1)}%`, status: resume.analysis.keywordDensity >= 2 && resume.analysis.keywordDensity <= 5 ? 'good' : 'warning' },
    { label: 'Readability Score', value: `${resume.analysis.readabilityScore.toFixed(0)}/100`, status: resume.analysis.readabilityScore >= 60 ? 'good' : 'warning' },
    { label: 'Action Verb Score', value: `${resume.analysis.actionVerbScore.toFixed(0)}%`, status: resume.analysis.actionVerbScore >= 70 ? 'good' : 'warning' },
    { label: 'Weak Bullets', value: `${resume.analysis.weakBullets.length}`, status: resume.analysis.weakBullets.length === 0 ? 'good' : 'warning' },
  ];

  const colWidth = (pageWidth - margin * 2) / 2;
  metrics.forEach((metric, i) => {
    const x = margin + (i % 2) * colWidth;
    const y = yPos + Math.floor(i / 2) * 20;
    
    const statusColor = metric.status === 'good' ? COLORS.success : COLORS.warning;
    addRect(x, y, colWidth - 5, 15, statusColor.map(c => Math.min(255, c + 230)) as number[]);
    addText(metric.label, x + 5, y + 6, FONTS.small, COLORS.text);
    addText(metric.value, x + 5, y + 12, FONTS.subsection, COLORS.text, true);
  });
  yPos += 50;

  // Matched Skills
  if (matchedSkills.length > 0) {
    addSectionHeader('Matched Skills', '✅');
    const skillsText = matchedSkills.join(' • ');
    doc.setFontSize(FONTS.body);
    doc.setTextColor(...COLORS.text as [number, number, number]);
    const lines = doc.splitTextToSize(skillsText, pageWidth - margin * 2);
    lines.forEach((line: string) => {
      if (yPos > 260) { doc.addPage(); yPos = margin; }
      doc.text(line, margin, yPos);
      yPos += 5;
    });
    yPos += 5;
  }

  // Missing Skills (Now Added)
  if (resume.addedKeywords.length > 0) {
    addSectionHeader('Keywords Added', '🔑');
    const keywordWidth = 40;
    resume.addedKeywords.forEach((keyword, i) => {
      if (yPos > 260) { doc.addPage(); yPos = margin; }
      const x = margin + (i % 4) * keywordWidth;
      if (i % 4 === 0) yPos += 8;
      addRect(x, yPos - 4, 35, 8, COLORS.secondary);
      addText(keyword.substring(0, 15), x + 2, yPos, FONTS.small, COLORS.white);
    });
    yPos += 15;
  }

  // Improvements Made
  if (resume.improvements.length > 0) {
    addSectionHeader('Improvements Made', '✨');
    resume.improvements.forEach((imp, i) => {
      if (yPos > 260) { doc.addPage(); yPos = margin; }
      addText(`${i + 1}.`, margin, yPos, FONTS.body, COLORS.success, true);
      doc.setFontSize(FONTS.body);
      doc.setTextColor(...COLORS.text as [number, number, number]);
      const lines = doc.splitTextToSize(imp, pageWidth - margin * 2 - 15);
      doc.text(lines, margin + 10, yPos);
      yPos += lines.length * 5 + 3;
    });
  }

  return doc.output('blob');
}

export async function generateComparisonPDF(options: PDFExportOptions): Promise<Blob> {
  const { resume, originalScore, mode } = options;
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 15;
  let yPos = margin;

  const addText = (text: string, x: number, y: number, fontSize: number, color: number[], isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color as [number, number, number]);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(text, x, y);
  };

  const addRect = (x: number, y: number, w: number, h: number, color: number[]) => {
    doc.setFillColor(...color as [number, number, number]);
    doc.rect(x, y, w, h, 'F');
  };

  // Header
  addRect(0, 0, pageWidth, 30, COLORS.primary);
  addText('BEFORE & AFTER COMPARISON', margin, 18, FONTS.title, COLORS.white, true);
  addText(`Score: ${Math.round(originalScore)} → ${Math.round(resume.predictedScore)} (+${resume.improvementPercentage}%)`, pageWidth - margin - 80, 18, FONTS.body, COLORS.white);
  yPos = 40;

  // Two column layout
  const colWidth = (pageWidth - margin * 3) / 2;
  const leftCol = margin;
  const rightCol = margin + colWidth + margin;

  // Left column - Original
  addRect(leftCol, yPos - 5, colWidth, 10, [240, 240, 240]);
  addText('ORIGINAL RESUME', leftCol + 5, yPos, FONTS.subsection, COLORS.muted, true);

  // Right column - Optimized
  addRect(rightCol, yPos - 5, colWidth, 10, COLORS.success);
  addText('AI OPTIMIZED', rightCol + 5, yPos, FONTS.subsection, COLORS.white, true);

  yPos += 10;

  // Professional Summary comparison
  addText('Professional Summary', leftCol, yPos, FONTS.body, COLORS.primary, true);
  yPos += 5;

  const summaryLines = doc.splitTextToSize(resume.professionalSummary, colWidth - 10);
  summaryLines.forEach((line: string) => {
    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = margin;
    }
    addText(line, leftCol, yPos, FONTS.small, COLORS.text);
    yPos += 4;
  });

  // Skills comparison on right
  let rightY = yPos - (summaryLines.length * 4) + 5;
  addText('Skills Added', rightCol, rightY, FONTS.body, COLORS.success, true);
  rightY += 5;
  resume.addedKeywords.forEach((keyword) => {
    if (rightY > pageHeight - 15) return;
    addText('• ' + keyword, rightCol, rightY, FONTS.small, COLORS.text);
    rightY += 4;
  });

  yPos += 10;

  // Rewritten Bullets
  if (resume.rewrittenBullets.length > 0) {
    addText('Rewritten Bullets', leftCol, yPos, FONTS.body, COLORS.primary, true);
    yPos += 5;

  resume.rewrittenBullets.slice(0, 5).forEach((rb) => {
      if (yPos > pageHeight - 25) return;
      
      // Original (strikethrough effect with line)
      addText('Before:', leftCol, yPos, FONTS.small, COLORS.danger, true);
      yPos += 4;
      doc.setTextColor(...COLORS.muted as [number, number, number]);
      doc.text(rb.original.substring(0, 80), leftCol, yPos);
      yPos += 4;

      // Optimized
      addText('After:', rightCol, yPos - 8, FONTS.small, COLORS.success, true);
      addText(rb.optimized.substring(0, 80), rightCol, yPos, FONTS.small, COLORS.text);
      yPos += 8;
    });
  }

  // Footer
  doc.setFontSize(6);
  doc.setTextColor(...COLORS.muted as [number, number, number]);
  doc.text(`Generated by ATS Resume Optimizer | ${mode} mode | ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

  return doc.output('blob');
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateFilename(type: string, mode: OptimizationMode): string {
  const timestamp = Date.now();
  return `${type}-${mode}-${timestamp}.pdf`;
}