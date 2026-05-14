import { useState } from 'react';
import { optimizeResume } from '../services/api';
import { generateResumePDF, generateATSReportPDF, generateComparisonPDF, downloadBlob, generateFilename } from '../services/pdfExport';
import type { AnalysisResult, OptimizedResume, OptimizationMode, ExperienceEntry } from '../types';

interface ResumeOptimizerProps {
  analysisResult: AnalysisResult;
  resumeFile: File;
  jobDescription: string;
  onOptimizationComplete?: (resume: OptimizedResume, mode: string) => void;
}

const MODE_INFO: Record<OptimizationMode, { label: string; description: string; icon: string; color: string }> = {
  conservative: {
    label: 'Conservative',
    description: 'Minimal changes, preserves original wording',
    icon: '🛡️',
    color: 'from-blue-500 to-cyan-600'
  },
  balanced: {
    label: 'Balanced',
    description: 'Optimal ATS + readability (recommended)',
    icon: '⚖️',
    color: 'from-purple-500 to-indigo-600'
  },
  aggressive: {
    label: 'Aggressive',
    description: 'Maximum ATS optimization',
    icon: '🚀',
    color: 'from-orange-500 to-red-600'
  }
};

function ResumeOptimizer({ analysisResult, resumeFile, jobDescription, onOptimizationComplete }: ResumeOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState<OptimizedResume | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [originalResumeText, setOriginalResumeText] = useState<string>('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [selectedMode, setSelectedMode] = useState<OptimizationMode>('balanced');
  const [activeTab, setActiveTab] = useState<'comparison' | 'analysis' | 'report'>('comparison');
  const [pdfGenerating, setPdfGenerating] = useState<'resume' | 'report' | 'comparison' | null>(null);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setError(null);

    try {
      // Read resume file content
      const resumeText = await resumeFile.text();
      setOriginalResumeText(resumeText);

      const optimized = await optimizeResume({
        resumeText,
        jobDescription,
        currentScore: analysisResult.score,
        matchedSkills: analysisResult.matchedSkills,
        missingSkills: analysisResult.missingSkills,
        strengths: analysisResult.strengths,
        weaknesses: analysisResult.improvements,
        mode: selectedMode
      });

      setOptimizedResume(optimized);
      setShowComparison(true);
      setActiveTab('comparison');
      onOptimizationComplete?.(optimized, selectedMode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize resume');
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const saveOptimizedResumeToServer = async () => {
    if (!optimizedResume || !resumeFile) return;
    
    setSaveStatus('saving');
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('optimizedResume', JSON.stringify(optimizedResume));
      formData.append('originalFilename', resumeFile.name);
      
      const response = await fetch('http://localhost:5000/api/resumes/save-optimized', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const formatExperienceSection = (experience: ExperienceEntry[]): string => {
    return experience.map(exp => {
      let text = `${exp.title} at ${exp.company} (${exp.dates})`;
      if (exp.location) text += ` - ${exp.location}`;
      text += '\n';
      exp.bullets.forEach(bullet => {
        text += `  \u2022 ${bullet}\n`;
      });
      return text;
    }).join('\n');
  };

  const downloadOptimizedResume = () => {
    if (!optimizedResume) return;

    const content = `PROFESSIONAL SUMMARY
${optimizedResume.professionalSummary}

SKILLS
${optimizedResume.skills.join(' \u2022 ')}

EXPERIENCE
${formatExperienceSection(optimizedResume.experience)}

EDUCATION
${optimizedResume.education.map(edu =>
  `${edu.degree}${edu.field ? ` in ${edu.field}` : ''} - ${edu.institution} (${edu.dates})${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`
).join('\n')}

${optimizedResume.certifications.length > 0 ? `CERTIFICATIONS
${optimizedResume.certifications.map(cert =>
  `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`
).join('\n')}

` : ''}${optimizedResume.projects.length > 0 ? `PROJECTS
${optimizedResume.projects.map(proj =>
  `${proj.name}: ${proj.description}\n${proj.bullets.map(b => `  \u2022 ${b}`).join('\n')}`
).join('\n\n')}

` : ''}---
OPTIMIZATION REPORT
---

OPTIMIZATION MODE: ${selectedMode.toUpperCase()}
ATS SCORE IMPROVEMENT: ${analysisResult.score}/100 \u2192 ${optimizedResume.predictedScore}/100 (+${optimizedResume.improvementPercentage}%)

IMPROVEMENTS MADE:
${optimizedResume.improvements.map((imp, idx) => `${idx + 1}. ${imp}`).join('\n')}

KEYWORDS ADDED:
${optimizedResume.addedKeywords.join(', ')}

ANALYSIS METRICS:
- Keyword Density: ${optimizedResume.analysis.keywordDensity.toFixed(1)}%
- Readability Score: ${optimizedResume.analysis.readabilityScore.toFixed(0)}/100
- Action Verb Score: ${optimizedResume.analysis.actionVerbScore.toFixed(0)}%
- Weak Bullets Found: ${optimizedResume.analysis.weakBullets.length}
- Duplicate Keywords: ${optimizedResume.analysis.duplicateKeywords.length}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized-resume-${selectedMode}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadResumeAsPDF = async () => {
    if (!optimizedResume) return;
    setPdfGenerating('resume');
    try {
      const blob = await generateResumePDF({
        resume: optimizedResume,
        originalScore: analysisResult.score,
        mode: selectedMode,
        matchedSkills: analysisResult.matchedSkills,
        missingSkills: analysisResult.missingSkills,
      });
      downloadBlob(blob, generateFilename('resume', selectedMode));
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setPdfGenerating(null);
    }
  };

  const downloadReportAsPDF = async () => {
    if (!optimizedResume) return;
    setPdfGenerating('report');
    try {
      const blob = await generateATSReportPDF({
        resume: optimizedResume,
        originalScore: analysisResult.score,
        mode: selectedMode,
        matchedSkills: analysisResult.matchedSkills,
        missingSkills: analysisResult.missingSkills,
      });
      downloadBlob(blob, generateFilename('ats-report', selectedMode));
    } catch (err) {
      console.error('Failed to generate ATS report PDF:', err);
    } finally {
      setPdfGenerating(null);
    }
  };

  const downloadComparisonAsPDF = async () => {
    if (!optimizedResume) return;
    setPdfGenerating('comparison');
    try {
      const blob = await generateComparisonPDF({
        resume: optimizedResume,
        originalScore: analysisResult.score,
        mode: selectedMode,
        matchedSkills: analysisResult.matchedSkills,
        missingSkills: analysisResult.missingSkills,
      });
      downloadBlob(blob, generateFilename('comparison', selectedMode));
    } catch (err) {
      console.error('Failed to generate comparison PDF:', err);
    } finally {
      setPdfGenerating(null);
    }
  };

  const downloadComparisonReport = () => {
    if (!optimizedResume) return;

    const content = `ATS RESUME OPTIMIZATION REPORT
Generated: ${new Date().toLocaleString()}
Optimization Mode: ${selectedMode.toUpperCase()}

========================================
SCORE COMPARISON
========================================
Original ATS Score: ${analysisResult.score}/100
Optimized ATS Score: ${optimizedResume.predictedScore}/100
Improvement: +${optimizedResume.improvementPercentage}% (${optimizedResume.predictedScore - analysisResult.score} points)

========================================
OPTIMIZED RESUME
========================================

PROFESSIONAL SUMMARY
${optimizedResume.professionalSummary}

SKILLS
${optimizedResume.skills.join(' \u2022 ')}

EXPERIENCE
${formatExperienceSection(optimizedResume.experience)}

EDUCATION
${optimizedResume.education.map(edu =>
  `${edu.degree}${edu.field ? ` in ${edu.field}` : ''} - ${edu.institution} (${edu.dates})${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`
).join('\n')}

${optimizedResume.certifications.length > 0 ? `CERTIFICATIONS
${optimizedResume.certifications.map(cert =>
  `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`
).join('\n')}

` : ''}${optimizedResume.projects.length > 0 ? `PROJECTS
${optimizedResume.projects.map(proj =>
  `${proj.name}: ${proj.description}\n${proj.bullets.map(b => `  \u2022 ${b}`).join('\n')}`
).join('\n\n')}

` : ''}========================================
OPTIMIZATION DETAILS
========================================

IMPROVEMENTS MADE:
${optimizedResume.improvements.map((imp, idx) => `${idx + 1}. ${imp}`).join('\n')}

KEYWORDS ADDED FROM JOB DESCRIPTION:
${optimizedResume.addedKeywords.join(', ')}

MATCHED SKILLS:
${analysisResult.matchedSkills.join(', ')}

MISSING SKILLS (NOW ADDRESSED):
${analysisResult.missingSkills.join(', ')}

WEAK PHRASES REMOVED:
${optimizedResume.removedWeakPhrases.join(', ') || 'None detected'}

========================================
ADVANCED ANALYSIS
========================================

Keyword Density: ${optimizedResume.analysis.keywordDensity.toFixed(1)}% (target: 2-5%)
Readability Score: ${optimizedResume.analysis.readabilityScore.toFixed(0)}/100
Action Verb Usage: ${optimizedResume.analysis.actionVerbScore.toFixed(0)}% of bullets
Weak Bullets Remaining: ${optimizedResume.analysis.weakBullets.length}
Duplicate Keywords: ${optimizedResume.analysis.duplicateKeywords.join(', ') || 'None'}

Sections Complete:
${Object.entries(optimizedResume.analysis.sectionCompleteness).map(([k, v]) => `  ${k}: ${v ? '\u2713' : '\u2717'}`).join('\n')}

========================================
REWRITTEN BULLETS
========================================
${optimizedResume.rewrittenBullets.map((rb, idx) =>
  `${idx + 1}. ORIGINAL: "${rb.original}"
   OPTIMIZED: "${rb.optimized}"
   REASON: ${rb.reason}`
).join('\n\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ats-optimization-report-${selectedMode}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Header Section with Mode Selector */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              🤖 AI Resume Optimizer
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-normal">
                Powered by 9Router
              </span>
            </h2>
            <p className="text-purple-100 text-lg mb-4">
              Real AI-powered optimization using local LLM infrastructure
            </p>
            
            {/* Mode Selector */}
            <div className="flex flex-wrap gap-3">
              {(Object.entries(MODE_INFO) as [OptimizationMode, typeof MODE_INFO['conservative']][]).map(([mode, info]) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  disabled={isOptimizing}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                    selectedMode === mode
                      ? 'bg-white text-purple-700 border-white shadow-lg scale-105'
                      : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:border-white/40'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span>{info.icon}</span>
                      <span className="font-semibold">{info.label}</span>
                    </div>
                    <p className={`text-xs mt-1 ${selectedMode === mode ? 'text-purple-500' : 'text-white/60'}`}>
                      {info.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0"
          >
            {isOptimizing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Optimizing...
              </span>
            ) : (
              `✨ Optimize ${MODE_INFO[selectedMode].icon}`
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg animate-fadeIn shadow-lg">
          <div className="flex items-start">
            <span className="text-red-600 text-3xl mr-4">⚠️</span>
            <div>
              <h3 className="text-red-800 font-semibold text-lg mb-1">Optimization Failed</h3>
              <p className="text-red-700">{error}</p>
              <p className="text-red-600 text-sm mt-2">
                Make sure 9Router is running on http://localhost:20128
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isOptimizing && (
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200 animate-fadeIn">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">🧠</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                AI is Analyzing & Optimizing Your Resume...
              </h3>
              <p className="text-gray-600 text-lg">
                Mode: {MODE_INFO[selectedMode].label} - {MODE_INFO[selectedMode].description}
              </p>
              <p className="text-gray-500 text-sm mt-2">This may take 15-45 seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* Optimized Results */}
      {optimizedResume && showComparison && (
        <div className="space-y-6 animate-fadeIn">
          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200 flex">
            {[
              { id: 'comparison' as const, label: 'Before & After', icon: '🔄' },
              { id: 'analysis' as const, label: 'ATS Analysis', icon: '📊' },
              { id: 'report' as const, label: 'Optimization Report', icon: '📋' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Before & After Comparison */}
          {activeTab === 'comparison' && (
            <>
              {/* Score Comparison */}
              <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-8 border-2 border-green-300 shadow-xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  📊 ATS Score Improvement
                  <span className="text-sm bg-green-200 text-green-800 px-3 py-1 rounded-full font-normal ml-2">
                    {MODE_INFO[selectedMode].icon} {MODE_INFO[selectedMode].label}
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 text-center shadow-md border-2 border-gray-200">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Original Score</p>
                    <p className="text-5xl font-bold text-gray-800">{Math.round(analysisResult.score)}</p>
                    <p className="text-xs text-gray-500 mt-2">out of 100</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-5xl text-green-500">→</span>
                      <p className="text-sm text-green-600 font-semibold mt-2">
                        +{optimizedResume.predictedScore - Math.round(analysisResult.score)} points
                      </p>
                      <p className="text-xs text-green-500">
                        +{optimizedResume.improvementPercentage}% improvement
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-center shadow-md text-white">
                    <p className="text-sm mb-2 font-medium opacity-90">Predicted Score</p>
                    <p className="text-5xl font-bold">{Math.round(optimizedResume.predictedScore)}</p>
                    <p className="text-xs mt-2 opacity-90">out of 100</p>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  🔄 Section Comparison
                </h3>
                
                {/* Professional Summary Comparison */}
                {optimizedResume.professionalSummary && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      ✍️ Professional Summary
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500 uppercase">Original</span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                          {originalResumeText.substring(0, 400)}...
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-green-700 uppercase">AI Optimized</span>
                          <button
                            onClick={() => copyToClipboard(optimizedResume.professionalSummary, 'summary')}
                            className="text-xs bg-white hover:bg-gray-100 px-3 py-1 rounded-md transition-colors shadow-sm"
                          >
                            {copiedSection === 'summary' ? '✓ Copied' : '📋 Copy'}
                          </button>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                          {optimizedResume.professionalSummary}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Skills Comparison */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    🎯 Skills ({optimizedResume.skills.length} total)
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Original Skills</span>
                        <span className="text-xs text-gray-500">{analysisResult.matchedSkills.length} matched</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.matchedSkills.map((skill, index) => (
                          <span key={index} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-xs">
                            {skill}
                          </span>
                        ))}
                        {analysisResult.matchedSkills.length === 0 && (
                          <p className="text-xs text-gray-400 italic">No skills matched in original resume</p>
                        )}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-green-700 uppercase">AI Enhanced Skills</span>
                        <button
                          onClick={() => copyToClipboard(optimizedResume.skills.join(', '), 'skills')}
                          className="text-xs bg-white hover:bg-gray-100 px-3 py-1 rounded-md transition-colors shadow-sm"
                        >
                          {copiedSection === 'skills' ? '✓ Copied' : '📋 Copy'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {optimizedResume.skills.map((skill, index) => (
                          <span key={index} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-md text-xs font-medium shadow-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience Entries */}
                {optimizedResume.experience.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      💼 Experience
                    </h4>
                    {optimizedResume.experience.map((exp, expIndex) => (
                      <div key={expIndex} className="mb-6 last:mb-0">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-sm font-bold text-green-800">{exp.title}</span>
                              <span className="text-sm text-green-600 ml-2">at {exp.company}</span>
                              <span className="text-xs text-green-500 ml-2">({exp.dates})</span>
                              {exp.location && (
                                <span className="text-xs text-green-400 ml-2">📍 {exp.location}</span>
                              )}
                            </div>
                            <button
                              onClick={() => copyToClipboard(exp.bullets.join('\n'), `experience-${expIndex}`)}
                              className="text-xs bg-white hover:bg-gray-100 px-3 py-1 rounded-md transition-colors shadow-sm"
                            >
                              {copiedSection === `experience-${expIndex}` ? '✓ Copied' : '📋 Copy'}
                            </button>
                          </div>
                          <ul className="space-y-2">
                            {exp.bullets.map((bullet, bulletIndex) => (
                              <li key={bulletIndex} className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
                                <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">•</span>
                                <span className="text-gray-700 text-sm leading-relaxed">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                          {exp.technologies && exp.technologies.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {exp.technologies.map((tech, techIndex) => (
                                <span key={techIndex} className="bg-white/80 text-green-700 px-2 py-0.5 rounded text-xs border border-green-200">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Education */}
                {optimizedResume.education.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      🎓 Education
                    </h4>
                    <div className="space-y-3">
                      {optimizedResume.education.map((edu, index) => (
                        <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-gray-800">{edu.degree}</span>
                              {edu.field && <span className="text-gray-600"> in {edu.field}</span>}
                              <span className="text-gray-500 ml-2">- {edu.institution}</span>
                            </div>
                            <span className="text-sm text-gray-500">{edu.dates}</span>
                          </div>
                          {edu.gpa && (
                            <p className="text-sm text-gray-600 mt-1">GPA: {edu.gpa}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {optimizedResume.certifications.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      🏆 Certifications
                    </h4>
                    <div className="space-y-2">
                      {optimizedResume.certifications.map((cert, index) => (
                        <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                          <span className="font-medium text-gray-800">{cert.name}</span>
                          {cert.issuer && <span className="text-gray-500 ml-2">- {cert.issuer}</span>}
                          {cert.date && <span className="text-gray-400 text-sm ml-2">({cert.date})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {optimizedResume.projects.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      🚀 Projects
                    </h4>
                    {optimizedResume.projects.map((proj, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                          <div className="font-semibold text-gray-800 mb-1">{proj.name}</div>
                          <p className="text-sm text-gray-600 mb-2">{proj.description}</p>
                          <ul className="space-y-1">
                            {proj.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rewritten Bullets Detail */}
                {optimizedResume.rewrittenBullets.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      ✏️ Bullet Point Improvements
                    </h4>
                    <div className="space-y-4">
                      {optimizedResume.rewrittenBullets.map((rb, index) => (
                        <div key={index} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                          <div className="mb-3">
                            <span className="text-xs font-semibold text-red-600 uppercase">Before:</span>
                            <p className="text-sm text-gray-600 mt-1 line-through decoration-red-300">{rb.original}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-green-600 uppercase">After:</span>
                            <p className="text-sm text-gray-800 mt-1 font-medium">{rb.optimized}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 italic">{rb.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tab: ATS Analysis */}
          {activeTab === 'analysis' && (
            <>
              {/* Advanced Analysis Metrics */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  📊 Advanced ATS Analysis
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { 
                      label: 'Keyword Density', 
                      value: `${optimizedResume.analysis.keywordDensity.toFixed(1)}%`, 
                      status: optimizedResume.analysis.keywordDensity >= 2 && optimizedResume.analysis.keywordDensity <= 5 ? 'good' : optimizedResume.analysis.keywordDensity < 2 ? 'warning' : 'error',
                      desc: 'Target: 2-5%',
                      icon: '🔑'
                    },
                    { 
                      label: 'Readability', 
                      value: `${optimizedResume.analysis.readabilityScore.toFixed(0)}/100`, 
                      status: optimizedResume.analysis.readabilityScore >= 60 ? 'good' : optimizedResume.analysis.readabilityScore >= 40 ? 'warning' : 'error',
                      desc: 'Higher is better',
                      icon: '📖'
                    },
                    { 
                      label: 'Action Verbs', 
                      value: `${optimizedResume.analysis.actionVerbScore.toFixed(0)}%`, 
                      status: optimizedResume.analysis.actionVerbScore >= 70 ? 'good' : optimizedResume.analysis.actionVerbScore >= 40 ? 'warning' : 'error',
                      desc: '% of strong verbs',
                      icon: '💪'
                    },
                    { 
                      label: 'Weak Bullets', 
                      value: `${optimizedResume.analysis.weakBullets.length}`, 
                      status: optimizedResume.analysis.weakBullets.length === 0 ? 'good' : optimizedResume.analysis.weakBullets.length <= 3 ? 'warning' : 'error',
                      desc: 'Remaining weak phrases',
                      icon: '⚠️'
                    },
                  ].map((metric, index) => (
                    <div key={index} className={`rounded-xl p-4 border-2 ${
                      metric.status === 'good' ? 'bg-green-50 border-green-300' :
                      metric.status === 'warning' ? 'bg-amber-50 border-amber-300' :
                      'bg-red-50 border-red-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{metric.icon}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          metric.status === 'good' ? 'bg-green-200 text-green-800' :
                          metric.status === 'warning' ? 'bg-amber-200 text-amber-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {metric.status === 'good' ? '✓ Good' : metric.status === 'warning' ? '⚠ Needs Work' : '✗ Poor'}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
                      <p className="text-sm text-gray-600 mt-1">{metric.label}</p>
                      <p className="text-xs text-gray-500">{metric.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Section Completeness */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">📋 Section Completeness</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(optimizedResume.analysis.sectionCompleteness).map(([section, complete]) => (
                      <div key={section} className={`rounded-lg p-3 text-center ${
                        complete ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <span className={`text-2xl ${complete ? '' : 'opacity-30'}`}>
                          {section === 'summary' ? '✍️' : section === 'skills' ? '🎯' : section === 'experience' ? '💼' : '🎓'}
                        </span>
                        <p className={`text-sm font-medium mt-1 capitalize ${complete ? 'text-green-700' : 'text-red-700'}`}>
                          {section.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className={`text-xs ${complete ? 'text-green-600' : 'text-red-600'}`}>
                          {complete ? '✓ Complete' : '✗ Missing'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Duplicate Keywords */}
                {optimizedResume.analysis.duplicateKeywords.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">🔄 Duplicate Keywords Detected</h4>
                    <div className="flex flex-wrap gap-2">
                      {optimizedResume.analysis.duplicateKeywords.map((keyword, index) => (
                        <span key={index} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                          ⚠️ {keyword}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Consider reducing repetition of these keywords</p>
                  </div>
                )}

                {/* Remaining Weak Bullets */}
                {optimizedResume.analysis.weakBullets.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">⚠️ Remaining Weak Bullets</h4>
                    <ul className="space-y-2">
                      {optimizedResume.analysis.weakBullets.map((bullet, index) => (
                        <li key={index} className="bg-red-50 p-3 rounded-lg border border-red-200 text-sm text-red-700">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">These bullets could be strengthened further with more specific action verbs and impact metrics</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tab: Optimization Report */}
          {activeTab === 'report' && (
            <>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  📋 Optimization Report
                  <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-normal ml-2">
                    {MODE_INFO[selectedMode].icon} {MODE_INFO[selectedMode].label}
                  </span>
                </h3>

                {/* Improvements */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">✨ Improvements Made</h4>
                  <ul className="space-y-2">
                    {optimizedResume.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                        <span className="text-green-500 text-lg mt-0.5 flex-shrink-0">✓</span>
                        <span className="text-gray-700 text-sm leading-relaxed">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Added Keywords */}
                {optimizedResume.addedKeywords.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">🔑 Keywords Added from Job Description</h4>
                    <div className="flex flex-wrap gap-2">
                      {optimizedResume.addedKeywords.map((keyword, index) => (
                        <span key={index} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Removed Weak Phrases */}
                {optimizedResume.removedWeakPhrases.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">🗑️ Weak Phrases Removed</h4>
                    <div className="flex flex-wrap gap-2">
                      {optimizedResume.removedWeakPhrases.map((phrase, index) => (
                        <span key={index} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium line-through">
                          {phrase}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action Buttons - Export Section */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              📥 Export Options
            </h3>

            {/* PDF Export Row - Primary */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-3">📄 Professional PDF Export</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={downloadResumeAsPDF}
                  disabled={pdfGenerating === 'resume'}
                  className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {pdfGenerating === 'resume' ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      📄 Resume PDF
                    </>
                  )}
                </button>
                <button
                  onClick={downloadReportAsPDF}
                  disabled={pdfGenerating === 'report'}
                  className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {pdfGenerating === 'report' ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      📊 ATS Report PDF
                    </>
                  )}
                </button>
                <button
                  onClick={downloadComparisonAsPDF}
                  disabled={pdfGenerating === 'comparison'}
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {pdfGenerating === 'comparison' ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      🔄 Comparison PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Text Export Row - Secondary */}
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-3">📝 Text Export</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={saveOptimizedResumeToServer}
                  disabled={saveStatus === 'saving'}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-3 rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveStatus === 'saving' ? '⏳ Saving...' : saveStatus === 'saved' ? '✓ Saved!' : saveStatus === 'error' ? '✗ Failed' : '💾 Save'}
                </button>
                <button
                  onClick={downloadOptimizedResume}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                >
                  📥 Resume TXT
                </button>
                <button
                  onClick={downloadComparisonReport}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  📊 Report TXT
                </button>
                <button
                  onClick={() => {
                    const text = `PROFESSIONAL SUMMARY:\n${optimizedResume.professionalSummary}\n\nSKILLS:\n${optimizedResume.skills.join(', ')}\n\nEXPERIENCE:\n${formatExperienceSection(optimizedResume.experience)}\n\nSCORE: ${Math.round(analysisResult.score)} → ${Math.round(optimizedResume.predictedScore)} (+${optimizedResume.improvementPercentage}%)`;
                    copyToClipboard(text, 'all');
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                >
                  {copiedSection === 'all' ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>

            {/* File Quality Note */}
            <div className="mt-4 text-xs text-gray-500 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">PDF</span>
              <span>Recruiter-ready export with professional formatting, selectable text, and proper layout</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeOptimizer;