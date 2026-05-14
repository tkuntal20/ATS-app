import type { AnalysisResult, OptimizedResume } from '../types';
import ScoreCircle from './ScoreCircle';
import ScoreBreakdown from './ScoreBreakdown';
import SkillsList from './SkillsList';
import SuggestionsList from './SuggestionsList';
import ResumeOptimizer from './ResumeOptimizer';
import { generatePDF, generateResumePDF, generateComparisonPDF } from '../utils/pdfExport';
import { useState, useCallback } from 'react';

interface ResultsDisplayProps {
  results: AnalysisResult;
  resumeFile: File;
  jobDescription: string;
}

export default function ResultsDisplay({ results, resumeFile, jobDescription }: ResultsDisplayProps) {
  const [optimizedResume, setOptimizedResume] = useState<OptimizedResume | null>(null);
  const [optimizationMode, setOptimizationMode] = useState<string>('balanced');

  const handleExportPDF = () => {
    generatePDF(results);
  };

  const handleExportReportPDF = useCallback(() => {
    generatePDF({ results, optimizedResume: optimizedResume || undefined, optimizationMode });
  }, [results, optimizedResume, optimizationMode]);

  const handleExportResumePDF = useCallback(() => {
    if (optimizedResume) {
      generateResumePDF(optimizedResume, optimizationMode);
    }
  }, [optimizedResume, optimizationMode]);

  const handleExportComparisonPDF = useCallback(() => {
    if (optimizedResume) {
      generateComparisonPDF(
        'Original resume content available after optimization', // placeholder; actual text would come from API
        optimizedResume,
        results.score,
        optimizationMode
      );
    }
  }, [optimizedResume, results.score, optimizationMode]);

  const handleOptimizationComplete = useCallback((resume: OptimizedResume, mode: string) => {
    setOptimizedResume(resume);
    setOptimizationMode(mode);
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Export Buttons */}
      <div className="flex flex-wrap justify-end gap-3">
        {/* Basic Report */}
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Analysis Report
        </button>

        {/* Full Report with Optimization */}
        <button
          onClick={handleExportReportPDF}
          disabled={!optimizedResume}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105 ${
            optimizedResume
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Full Report
        </button>

        {/* Optimized Resume */}
        <button
          onClick={handleExportResumePDF}
          disabled={!optimizedResume}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105 ${
            optimizedResume
              ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Optimized Resume
        </button>

        {/* Before/After Comparison */}
        <button
          onClick={handleExportComparisonPDF}
          disabled={!optimizedResume}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105 ${
            optimizedResume
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Before/After
        </button>
      </div>

      {/* Overall Score Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your ATS Score</h2>
          <p className="text-gray-600 mb-8">How well your resume matches the job description</p>
          <ScoreCircle score={results.score} />
          <p className="mt-6 text-sm text-gray-600 max-w-2xl text-center">
            {results.score >= 80
              ? '🎉 Excellent! Your resume is well-optimized for ATS systems.'
              : results.score >= 60
              ? '👍 Good score! A few improvements could make it even better.'
              : '💡 There\'s room for improvement. Follow the suggestions below to boost your score.'}
          </p>
        </div>
      </div>

      {/* Score Breakdown */}
      {results.breakdown && <ScoreBreakdown breakdown={results.breakdown} />}

      {/* Skills Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-slideInLeft">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 rounded-lg p-2">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Matched Skills</h3>
              <p className="text-sm text-gray-600">Skills found in your resume</p>
            </div>
          </div>
          <SkillsList skills={results.matchedSkills} type="matched" />
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-slideInRight">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 rounded-lg p-2">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Missing Skills</h3>
              <p className="text-sm text-gray-600">Consider adding these</p>
            </div>
          </div>
          <SkillsList skills={results.missingSkills} type="missing" />
        </div>
      </div>

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-slideInLeft">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 rounded-lg p-2">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Strengths</h3>
              <p className="text-sm text-gray-600">What you're doing well</p>
            </div>
          </div>
          <SuggestionsList suggestions={results.strengths} type="strengths" />
        </div>

        {/* Areas to Improve */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-slideInRight">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 rounded-lg p-2">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Areas to Improve</h3>
              <p className="text-sm text-gray-600">Actionable suggestions</p>
            </div>
          </div>
          <SuggestionsList suggestions={results.improvements} type="improvements" />
        </div>
      </div>

      {/* Action Items Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-8 text-white animate-fadeIn">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 rounded-lg p-3 flex-shrink-0">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">Next Steps</h3>
            <ul className="space-y-2 text-white/90">
              {results.missingSkills.length > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-white/70 mt-1">•</span>
                  <span>Add missing skills: {results.missingSkills.slice(0, 3).join(', ')}{results.missingSkills.length > 3 ? '...' : ''}</span>
                </li>
              )}
              {results.improvements.length > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-white/70 mt-1">•</span>
                  <span>Address the improvement suggestions above</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-white/70 mt-1">•</span>
                <span>Use keywords from the job description naturally throughout your resume</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white/70 mt-1">•</span>
                <span>Ensure your resume is in a clean, ATS-friendly format (PDF or DOCX)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Resume Optimizer */}
      <ResumeOptimizer 
        analysisResult={results}
        resumeFile={resumeFile}
        jobDescription={jobDescription}
        onOptimizationComplete={handleOptimizationComplete}
      />
    </div>
  );
}
