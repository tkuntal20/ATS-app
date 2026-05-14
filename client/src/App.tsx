import { useState } from 'react';
import './App.css';

interface AnalysisResult {
  success: boolean;
  score: number;
  breakdown: {
    keywordMatch: number;
    skillAlignment: number;
    experienceMatch: number;
    formatting: number;
    readability: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: Array<{
    suggestion: string;
    priority: string;
    impact: string;
  }>;
}

function App() {
  const [resume, setResume] = useState<File | null>(null);
  const [jd, setJD] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setResume(file);
        setError(null);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF, DOCX, DOC, or TXT file');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setResume(file);
        setError(null);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!resume || !jd.trim()) {
      setError('Please upload a resume and paste a job description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', resume);
      formData.append('jd', jd);

      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze resume. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResume(null);
    setJD('');
    setResult(null);
    setError(null);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 75) return '#22c55e';
    if (score >= 50) return '#facc15';
    return '#ef4444';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    return 'Needs Improvement';
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#facc15';
      case 'low':
        return '#22c55e';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">
            <span className="logo-icon">📊</span>
            ATS Resume Analyzer
          </h1>
          <p className="tagline">
            Optimize your resume for Applicant Tracking Systems
          </p>
        </div>
      </header>

      <main className="main-content">
        {!result ? (
          <div className="upload-container">
            <div className="upload-card">
              <h2 className="section-title">Upload Your Resume</h2>
              
              <div
                className={`file-drop-zone ${dragActive ? 'drag-active' : ''} ${resume ? 'has-file' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="resume-upload" className="file-label">
                  {resume ? (
                    <>
                      <span className="file-icon">✓</span>
                      <span className="file-name">{resume.name}</span>
                      <span className="file-size">
                        {(resume.size / 1024).toFixed(2)} KB
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="upload-icon">📄</span>
                      <span className="upload-text">
                        Drag & drop your resume here
                      </span>
                      <span className="upload-subtext">
                        or click to browse
                      </span>
                      <span className="upload-formats">
                        Supports PDF, DOCX, DOC, TXT (Max 5MB)
                      </span>
                    </>
                  )}
                </label>
              </div>

              <div className="jd-section">
                <label htmlFor="jd-input" className="jd-label">
                  <span>Job Description</span>
                  <span className="char-count">{jd.length} characters</span>
                </label>
                <textarea
                  id="jd-input"
                  placeholder="Paste the complete job description here...&#10;&#10;Include:&#10;• Job title and requirements&#10;• Required skills and qualifications&#10;• Experience requirements&#10;• Responsibilities"
                  rows={12}
                  value={jd}
                  onChange={(e) => setJD(e.target.value)}
                  className="jd-textarea"
                />
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading || !resume || !jd.trim()}
                className="analyze-button"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Analyze Resume
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="results-container">
            <div className="results-header">
              <h2 className="results-title">Analysis Results</h2>
              <button onClick={handleReset} className="reset-button">
                ← Analyze Another Resume
              </button>
            </div>

            <div className="score-section">
              <div className="score-card-main">
                <div className="score-label">Your ATS Score</div>
                <div
                  className="score-number"
                  style={{ color: getScoreColor(result.score) }}
                >
                  {result.score.toFixed(1)}
                </div>
                <div
                  className="score-status"
                  style={{ color: getScoreColor(result.score) }}
                >
                  {getScoreLabel(result.score)}
                </div>
                <div className="score-bar">
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${result.score}%`,
                      backgroundColor: getScoreColor(result.score)
                    }}
                  ></div>
                </div>
              </div>

              {result.breakdown && (
                <div className="breakdown-card">
                  <h3 className="breakdown-title">Score Breakdown</h3>
                  <div className="breakdown-items">
                    <div className="breakdown-item">
                      <div className="breakdown-label">
                        <span>Keyword Match</span>
                        <span className="breakdown-weight">40%</span>
                      </div>
                      <div className="breakdown-bar">
                        <div
                          className="breakdown-bar-fill"
                          style={{ width: `${result.breakdown.keywordMatch}%` }}
                        ></div>
                      </div>
                      <span className="breakdown-value">
                        {result.breakdown.keywordMatch.toFixed(1)}
                      </span>
                    </div>

                    <div className="breakdown-item">
                      <div className="breakdown-label">
                        <span>Skill Alignment</span>
                        <span className="breakdown-weight">25%</span>
                      </div>
                      <div className="breakdown-bar">
                        <div
                          className="breakdown-bar-fill"
                          style={{ width: `${result.breakdown.skillAlignment}%` }}
                        ></div>
                      </div>
                      <span className="breakdown-value">
                        {result.breakdown.skillAlignment.toFixed(1)}
                      </span>
                    </div>

                    <div className="breakdown-item">
                      <div className="breakdown-label">
                        <span>Experience Match</span>
                        <span className="breakdown-weight">15%</span>
                      </div>
                      <div className="breakdown-bar">
                        <div
                          className="breakdown-bar-fill"
                          style={{ width: `${result.breakdown.experienceMatch}%` }}
                        ></div>
                      </div>
                      <span className="breakdown-value">
                        {result.breakdown.experienceMatch.toFixed(1)}
                      </span>
                    </div>

                    <div className="breakdown-item">
                      <div className="breakdown-label">
                        <span>Formatting</span>
                        <span className="breakdown-weight">10%</span>
                      </div>
                      <div className="breakdown-bar">
                        <div
                          className="breakdown-bar-fill"
                          style={{ width: `${result.breakdown.formatting}%` }}
                        ></div>
                      </div>
                      <span className="breakdown-value">
                        {result.breakdown.formatting.toFixed(1)}
                      </span>
                    </div>

                    <div className="breakdown-item">
                      <div className="breakdown-label">
                        <span>Readability</span>
                        <span className="breakdown-weight">10%</span>
                      </div>
                      <div className="breakdown-bar">
                        <div
                          className="breakdown-bar-fill"
                          style={{ width: `${result.breakdown.readability}%` }}
                        ></div>
                      </div>
                      <span className="breakdown-value">
                        {result.breakdown.readability.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="skills-grid">
              <div className="skills-card matched">
                <h3 className="skills-title">
                  <span className="skills-icon">✓</span>
                  Matched Skills ({result.matchedSkills?.length || 0})
                </h3>
                <div className="skills-list">
                  {result.matchedSkills?.length > 0 ? (
                    result.matchedSkills.map((skill, idx) => (
                      <span key={idx} className="skill-tag matched">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="empty-state">No matched skills found</p>
                  )}
                </div>
              </div>

              <div className="skills-card missing">
                <h3 className="skills-title">
                  <span className="skills-icon">✗</span>
                  Missing Skills ({result.missingSkills?.length || 0})
                </h3>
                <div className="skills-list">
                  {result.missingSkills?.length > 0 ? (
                    result.missingSkills.map((skill, idx) => (
                      <span key={idx} className="skill-tag missing">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="empty-state">All required skills present!</p>
                  )}
                </div>
              </div>
            </div>

            {(result.strengths?.length > 0 || result.weaknesses?.length > 0) && (
              <div className="analysis-grid">
                {result.strengths?.length > 0 && (
                  <div className="analysis-card strengths">
                    <h3 className="analysis-title">
                      <span className="analysis-icon">💪</span>
                      Strengths
                    </h3>
                    <ul className="analysis-list">
                      {result.strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.weaknesses?.length > 0 && (
                  <div className="analysis-card weaknesses">
                    <h3 className="analysis-title">
                      <span className="analysis-icon">⚠️</span>
                      Areas for Improvement
                    </h3>
                    <ul className="analysis-list">
                      {result.weaknesses.map((weakness, idx) => (
                        <li key={idx}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {result.suggestions?.length > 0 && (
              <div className="suggestions-card">
                <h3 className="suggestions-title">
                  <span className="suggestions-icon">💡</span>
                  Actionable Suggestions
                </h3>
                <div className="suggestions-list">
                  {result.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="suggestion-item">
                      <div className="suggestion-header">
                        <span
                          className="suggestion-priority"
                          style={{
                            backgroundColor: getPriorityColor(suggestion.priority)
                          }}
                        >
                          {suggestion.priority || 'Medium'}
                        </span>
                        {suggestion.impact && (
                          <span className="suggestion-impact">
                            Impact: {suggestion.impact}
                          </span>
                        )}
                      </div>
                      <p className="suggestion-text">{suggestion.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          💡 Tip: Tailor your resume for each job application to maximize your ATS score
        </p>
      </footer>
    </div>
  );
}

export default App;