import type { AnalysisResult } from '../types';
import ScoreCircle from './ScoreCircle';
import SkillsList from './SkillsList';
import SuggestionsList from './SuggestionsList';

interface ResultsDisplayProps {
  results: AnalysisResult;
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Score Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ATS Compatibility Score
            </h2>
            <p className="text-gray-600">
              Your resume's match with the job description
            </p>
          </div>
          <div className="flex flex-col items-center">
            <ScoreCircle score={results.score} />
            <p className={`mt-4 text-lg font-semibold ${getScoreColor(results.score)}`}>
              {getScoreLabel(results.score)}
            </p>
          </div>
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-2">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="ml-3 text-xl font-semibold text-gray-900">
              Matched Skills
            </h3>
          </div>
          <SkillsList skills={results.matchedSkills} type="matched" />
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 bg-red-100 rounded-lg p-2">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="ml-3 text-xl font-semibold text-gray-900">
              Missing Skills
            </h3>
          </div>
          <SkillsList skills={results.missingSkills} type="missing" />
        </div>
      </div>

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="ml-3 text-xl font-semibold text-gray-900">Strengths</h3>
          </div>
          <SuggestionsList items={results.strengths} type="strength" />
        </div>

        {/* Improvements */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-2">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="ml-3 text-xl font-semibold text-gray-900">
              Suggestions for Improvement
            </h3>
          </div>
          <SuggestionsList items={results.improvements} type="improvement" />
        </div>
      </div>
    </div>
  );
}